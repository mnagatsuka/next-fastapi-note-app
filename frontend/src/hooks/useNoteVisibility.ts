import {
	getGetMyNoteByIdQueryKey,
	getGetMyNotesQueryKey,
	getGetNoteByIdQueryKey,
	getGetNotesQueryKey,
	usePublishNote,
	useUnpublishNote,
} from "@/lib/api/generated/client";
import type {
	ErrorResponse,
	PrivateNote,
	PrivateNoteResponse,
	PrivateNotesListResponse,
} from "@/lib/api/generated/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface UseNoteVisibilityOptions {
	noteId: string;
	currentVisibility: boolean;
	onSuccess?: (newState: boolean) => void;
	onError?: (error: ErrorResponse) => void;
}

interface UseNoteVisibilityReturn {
	isPublic: boolean;
	isPending: boolean;
	publish: () => Promise<void>;
	unpublish: () => Promise<void>;
	toggle: () => Promise<void>;
}

/**
 * Custom hook for managing note visibility state with optimistic updates and proper cache invalidation
 * Uses generated Orval client functions for type safety and consistency
 */
export function useNoteVisibility({
	noteId,
	currentVisibility,
	onSuccess,
	onError,
}: UseNoteVisibilityOptions): UseNoteVisibilityReturn {
	const queryClient = useQueryClient();
	const [optimisticState, setOptimisticState] = useState(currentVisibility);

	// Sync optimistic state with prop changes (from server)
	useEffect(() => {
		setOptimisticState(currentVisibility);
	}, [currentVisibility]);

	// Publish mutation with optimistic updates
	const publishMutation = usePublishNote({
		mutation: {
			onMutate: async () => {
				// Optimistic update
				setOptimisticState(true);

				// Cancel outgoing refetches to prevent race conditions
				await queryClient.cancelQueries({
					queryKey: getGetMyNoteByIdQueryKey(noteId),
				});
				await queryClient.cancelQueries({ queryKey: getGetMyNotesQueryKey() });

				// Snapshot previous values for rollback
				const previousNote = queryClient.getQueryData<PrivateNoteResponse>(
					getGetMyNoteByIdQueryKey(noteId),
				);
				const previousNotesList =
					queryClient.getQueryData<PrivateNotesListResponse>(
						getGetMyNotesQueryKey(),
					);

				// Optimistically update individual note cache
				queryClient.setQueryData<PrivateNoteResponse>(
					getGetMyNoteByIdQueryKey(noteId),
					(old) => {
						if (old?.data) {
							return {
								...old,
								data: {
									...old.data,
									isPublic: true,
									publishedAt: new Date().toISOString(),
								},
							};
						}
						return old;
					},
				);

				// Optimistically update notes list cache
				queryClient.setQueryData<PrivateNotesListResponse>(
					getGetMyNotesQueryKey(),
					(old) => {
						if (old?.data?.notes) {
							return {
								...old,
								data: {
									...old.data,
									notes: old.data.notes.map((note: PrivateNote) =>
										note.id === noteId
											? {
													...note,
													isPublic: true,
													publishedAt: new Date().toISOString(),
												}
											: note,
									),
								},
							};
						}
						return old;
					},
				);

				return { previousNote, previousNotesList };
			},
			onError: (err, variables, context) => {
				// Revert optimistic update on error
				setOptimisticState(false);

				if (context?.previousNote) {
					queryClient.setQueryData(
						getGetMyNoteByIdQueryKey(noteId),
						context.previousNote,
					);
				}
				if (context?.previousNotesList) {
					queryClient.setQueryData(
						getGetMyNotesQueryKey(),
						context.previousNotesList,
					);
				}

				onError?.(err);
			},
			onSuccess: (data) => {
				// Update optimistic state with actual server response
				if (data?.data?.isPublic !== undefined) {
					setOptimisticState(data.data.isPublic);
				}
				onSuccess?.(true);
			},
			onSettled: () => {
				// Always invalidate to ensure fresh data from server
				queryClient.invalidateQueries({
					queryKey: getGetMyNotesQueryKey(),
					exact: false,
				});
				queryClient.invalidateQueries({
					queryKey: getGetMyNoteByIdQueryKey(noteId),
				});
				queryClient.invalidateQueries({
					queryKey: getGetNotesQueryKey(),
					exact: false,
				});
				queryClient.invalidateQueries({
					queryKey: getGetNoteByIdQueryKey(noteId),
				});
			},
		},
	});

	// Unpublish mutation with optimistic updates
	const unpublishMutation = useUnpublishNote({
		mutation: {
			onMutate: async () => {
				// Optimistic update
				setOptimisticState(false);

				// Cancel outgoing refetches to prevent race conditions
				await queryClient.cancelQueries({
					queryKey: getGetMyNoteByIdQueryKey(noteId),
				});
				await queryClient.cancelQueries({ queryKey: getGetMyNotesQueryKey() });

				// Snapshot previous values for rollback
				const previousNote = queryClient.getQueryData<PrivateNoteResponse>(
					getGetMyNoteByIdQueryKey(noteId),
				);
				const previousNotesList =
					queryClient.getQueryData<PrivateNotesListResponse>(
						getGetMyNotesQueryKey(),
					);

				// Optimistically update individual note cache
				queryClient.setQueryData<PrivateNoteResponse>(
					getGetMyNoteByIdQueryKey(noteId),
					(old) => {
						if (old?.data) {
							return {
								...old,
								data: {
									...old.data,
									isPublic: false,
									publishedAt: null,
								},
							};
						}
						return old;
					},
				);

				// Optimistically update notes list cache
				queryClient.setQueryData<PrivateNotesListResponse>(
					getGetMyNotesQueryKey(),
					(old) => {
						if (old?.data?.notes) {
							return {
								...old,
								data: {
									...old.data,
									notes: old.data.notes.map((note: PrivateNote) =>
										note.id === noteId
											? { ...note, isPublic: false, publishedAt: null }
											: note,
									),
								},
							};
						}
						return old;
					},
				);

				return { previousNote, previousNotesList };
			},
			onError: (err, variables, context) => {
				// Revert optimistic update on error
				setOptimisticState(true);

				if (context?.previousNote) {
					queryClient.setQueryData(
						getGetMyNoteByIdQueryKey(noteId),
						context.previousNote,
					);
				}
				if (context?.previousNotesList) {
					queryClient.setQueryData(
						getGetMyNotesQueryKey(),
						context.previousNotesList,
					);
				}

				onError?.(err);
			},
			onSuccess: (data) => {
				// Update optimistic state with actual server response
				if (data?.data?.isPublic !== undefined) {
					setOptimisticState(data.data.isPublic);
				}
				onSuccess?.(false);
			},
			onSettled: () => {
				// Always invalidate to ensure fresh data from server
				queryClient.invalidateQueries({
					queryKey: getGetMyNotesQueryKey(),
					exact: false,
				});
				queryClient.invalidateQueries({
					queryKey: getGetMyNoteByIdQueryKey(noteId),
				});
				queryClient.invalidateQueries({
					queryKey: getGetNotesQueryKey(),
					exact: false,
				});
				queryClient.invalidateQueries({
					queryKey: getGetNoteByIdQueryKey(noteId),
				});
			},
		},
	});

	// Helper functions
	const publish = async (): Promise<void> => {
		await publishMutation.mutateAsync({ id: noteId });
	};

	const unpublish = async (): Promise<void> => {
		await unpublishMutation.mutateAsync({ id: noteId });
	};

	const toggle = async (): Promise<void> => {
		if (optimisticState) {
			await unpublish();
		} else {
			await publish();
		}
	};

	return {
		isPublic: optimisticState,
		isPending: publishMutation.isPending || unpublishMutation.isPending,
		publish,
		unpublish,
		toggle,
	};
}
