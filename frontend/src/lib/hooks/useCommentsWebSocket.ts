"use client";

import {
	getGetPrivateNoteCommentsQueryKey,
	getGetPublicNoteCommentsQueryKey,
} from "@/lib/api/generated/client";
import type {
	Comment,
	CommentsListResponse,
	WebsocketCommentCreated,
	WebsocketCommentsList,
} from "@/lib/api/generated/schemas";
import { WebsocketMessageType } from "@/lib/api/generated/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";

interface UseCommentsWebSocketOptions {
	noteId: string;
	isPrivateNote?: boolean;
	enabled?: boolean;
}

export function useCommentsWebSocket({
	noteId,
	isPrivateNote = false,
	enabled = true,
}: UseCommentsWebSocketOptions) {
	const queryClient = useQueryClient();
	const { subscribeToMessage, isConnected, status } = useWebSocket();

	// Get the appropriate query key based on note type
	const getQueryKey = useCallback(() => {
		return isPrivateNote
			? getGetPrivateNoteCommentsQueryKey(noteId)
			: getGetPublicNoteCommentsQueryKey(noteId);
	}, [noteId, isPrivateNote]);

	// Handle new comment created
	const handleCommentCreated = useCallback(
		(data: WebsocketCommentCreated) => {
			// Only handle comments for this specific note
			if (data.postId !== noteId) return;

			const queryKey = getQueryKey();

			// Get current comments data
			const currentData =
				queryClient.getQueryData<CommentsListResponse>(queryKey);

			if (currentData) {
				// Add new comment to the list
				const updatedData: CommentsListResponse = {
					...currentData,
					data: {
						...currentData.data,
						comments: [...currentData.data.comments, data.comment],
						count: currentData.data.count + 1,
					},
				};

				// Update the cache
				queryClient.setQueryData(queryKey, updatedData);

				console.log(
					`New comment added via WebSocket for note ${noteId}:`,
					data.comment,
				);
			} else {
				// If we don't have cached data, invalidate to trigger a fresh fetch
				queryClient.invalidateQueries({ queryKey });
			}
		},
		[noteId, getQueryKey, queryClient],
	);

	// Handle comments list update
	const handleCommentsListUpdate = useCallback(
		(data: WebsocketCommentsList) => {
			// Only handle updates for this specific note
			if (data.postId !== noteId) return;

			const queryKey = getQueryKey();

			// Update the entire comments list
			const updatedData: CommentsListResponse = {
				success: true,
				data: {
					postId: data.postId,
					comments: data.comments,
					count: data.count,
				},
			};

			queryClient.setQueryData(queryKey, updatedData);

			console.log(
				`Comments list updated via WebSocket for note ${noteId}:`,
				data,
			);
		},
		[noteId, getQueryKey, queryClient],
	);

	// Set up WebSocket subscriptions
	useEffect(() => {
		if (!enabled) return;

		console.log(
			`Setting up WebSocket subscriptions for note ${noteId} (private: ${isPrivateNote})`,
		);

		// Subscribe to comment creation events
		const unsubscribeCommentCreated =
			subscribeToMessage<WebsocketCommentCreated>(
				WebsocketMessageType.commentcreated,
				handleCommentCreated,
			);

		// Subscribe to comments list updates
		const unsubscribeCommentsList = subscribeToMessage<WebsocketCommentsList>(
			WebsocketMessageType.commentslist,
			handleCommentsListUpdate,
		);

		// Cleanup subscriptions
		return () => {
			unsubscribeCommentCreated();
			unsubscribeCommentsList();
		};
	}, [
		enabled,
		noteId,
		isPrivateNote,
		subscribeToMessage,
		handleCommentCreated,
		handleCommentsListUpdate,
	]);

	// Utility function to optimistically add a comment
	const optimisticallyAddComment = useCallback(
		(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">) => {
			const queryKey = getQueryKey();
			const currentData =
				queryClient.getQueryData<CommentsListResponse>(queryKey);

			if (currentData) {
				const optimisticComment: Comment = {
					...comment,
					id: `optimistic-${Date.now()}`, // Temporary ID
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				const updatedData: CommentsListResponse = {
					...currentData,
					data: {
						...currentData.data,
						comments: [...currentData.data.comments, optimisticComment],
						count: currentData.data.count + 1,
					},
				};

				queryClient.setQueryData(queryKey, updatedData);
				return optimisticComment;
			}

			return null;
		},
		[getQueryKey, queryClient],
	);

	// Utility function to remove an optimistic comment (for rollback)
	const removeOptimisticComment = useCallback(
		(commentId: string) => {
			const queryKey = getQueryKey();
			const currentData =
				queryClient.getQueryData<CommentsListResponse>(queryKey);

			if (currentData) {
				const updatedData: CommentsListResponse = {
					...currentData,
					data: {
						...currentData.data,
						comments: currentData.data.comments.filter(
							(c) => c.id !== commentId,
						),
						count: currentData.data.count - 1,
					},
				};

				queryClient.setQueryData(queryKey, updatedData);
			}
		},
		[getQueryKey, queryClient],
	);

	return {
		isConnected,
		connectionStatus: status,
		optimisticallyAddComment,
		removeOptimisticComment,
	};
}
