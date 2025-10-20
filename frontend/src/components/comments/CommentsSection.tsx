"use client";

import { Badge } from "@/components/ui/badge";
import {
	getGetPrivateNoteCommentsQueryKey,
	getGetPublicNoteCommentsQueryKey,
	useCreatePrivateNoteComment,
	useCreatePublicNoteComment,
	useGetPrivateNoteComments,
	useGetPublicNoteComments,
} from "@/lib/api/generated/client";
import type {
	CommentsListResponse,
	CreatePrivateNoteCommentBody,
	CreatePublicNoteCommentBody,
} from "@/lib/api/generated/schemas";
import { useCommentsWebSocket } from "@/lib/hooks/useCommentsWebSocket";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentsSectionProps {
	noteId: string;
	isPrivateNote?: boolean;
	className?: string;
}

export function CommentsSection({
	noteId,
	isPrivateNote = false,
	className = "",
}: CommentsSectionProps) {
	const { status, user } = useAuthStore();
	const queryClient = useQueryClient();

	// WebSocket integration for real-time updates
	const {
		isConnected: wsConnected,
		optimisticallyAddComment,
		removeOptimisticComment,
	} = useCommentsWebSocket({
		noteId,
		isPrivateNote,
		enabled: true,
	});

	// Fetch comments based on note type
	const publicCommentsQuery = useGetPublicNoteComments(noteId, {
		query: {
			enabled: !isPrivateNote,
			queryKey: getGetPublicNoteCommentsQueryKey(noteId),
		},
	});

	const privateCommentsQuery = useGetPrivateNoteComments(noteId, {
		query: {
			enabled:
				isPrivateNote && (status === "authenticated" || status === "anonymous"),
			queryKey: getGetPrivateNoteCommentsQueryKey(noteId),
		},
	});

	// Select the appropriate query based on note type
	const commentsQuery = isPrivateNote
		? privateCommentsQuery
		: publicCommentsQuery;
	const comments = commentsQuery.data?.data?.comments || [];
	const commentsCount = commentsQuery.data?.data?.count || 0;

	// Comment creation mutations
	const createPublicCommentMutation = useCreatePublicNoteComment({
		mutation: {
			onMutate: async (variables) => {
				// Cancel outgoing refetches
				const queryKey = getGetPublicNoteCommentsQueryKey(noteId);
				await queryClient.cancelQueries({ queryKey });

				// Snapshot previous value
				const previousComments =
					queryClient.getQueryData<CommentsListResponse>(queryKey);

				// Optimistically add comment
				const optimisticComment = optimisticallyAddComment({
					content: variables.data.content,
					username: user?.displayName || user?.email || "Anonymous",
					postId: noteId,
				});

				return { previousComments, optimisticComment };
			},
			onError: (_error, _variables, context) => {
				// Remove optimistic comment on error
				if (context?.optimisticComment) {
					removeOptimisticComment(context.optimisticComment.id);
				}
			},
			onSettled: () => {
				// Always refetch after mutation settles
				const queryKey = getGetPublicNoteCommentsQueryKey(noteId);
				queryClient.invalidateQueries({ queryKey });
			},
		},
	});

	const createPrivateCommentMutation = useCreatePrivateNoteComment({
		mutation: {
			onMutate: async (variables) => {
				// Cancel outgoing refetches
				const queryKey = getGetPrivateNoteCommentsQueryKey(noteId);
				await queryClient.cancelQueries({ queryKey });

				// Snapshot previous value
				const previousComments =
					queryClient.getQueryData<CommentsListResponse>(queryKey);

				// Optimistically add comment
				const optimisticComment = optimisticallyAddComment({
					content: variables.data.content,
					username: user?.displayName || user?.email || "Anonymous",
					postId: noteId,
				});

				return { previousComments, optimisticComment };
			},
			onError: (_error, _variables, context) => {
				// Remove optimistic comment on error
				if (context?.optimisticComment) {
					removeOptimisticComment(context.optimisticComment.id);
				}
			},
			onSettled: () => {
				// Always refetch after mutation settles
				const queryKey = getGetPrivateNoteCommentsQueryKey(noteId);
				queryClient.invalidateQueries({ queryKey });
			},
		},
	});

	// Handle comment submission
	const handleCommentSubmit = useCallback(
		(data: CreatePublicNoteCommentBody | CreatePrivateNoteCommentBody) => {
			if (isPrivateNote) {
				createPrivateCommentMutation.mutate({ id: noteId, data });
			} else {
				createPublicCommentMutation.mutate({ id: noteId, data });
			}
		},
		[
			noteId,
			isPrivateNote,
			createPublicCommentMutation,
			createPrivateCommentMutation,
		],
	);

	const isSubmitting =
		createPublicCommentMutation.isPending ||
		createPrivateCommentMutation.isPending;

	return (
		<section className={`space-y-6 ${className}`}>
			{/* Comments header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">
						Comments {commentsCount > 0 && `(${commentsCount})`}
					</h3>

					{/* WebSocket connection status */}
					<Badge
						variant={wsConnected ? "default" : "secondary"}
						className="text-xs"
					>
						{wsConnected ? "Live" : "Offline"}
					</Badge>
				</div>
			</div>

			{/* Comment form */}
			<CommentForm
				noteId={noteId}
				isPrivateNote={isPrivateNote}
				onSubmit={handleCommentSubmit}
				isSubmitting={isSubmitting}
			/>

			{/* Comments list */}
			<CommentList comments={comments} isLoading={commentsQuery.isLoading} />

			{/* Error state */}
			{commentsQuery.error && (
				<div className="text-center py-4 text-destructive">
					<p>Failed to load comments. Please try again.</p>
				</div>
			)}
		</section>
	);
}
