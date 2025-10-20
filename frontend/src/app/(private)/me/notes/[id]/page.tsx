"use client";

import { CommentsSection } from "@/components/comments";
import { Button } from "@/components/ui/button";
import { useNoteNavigation } from "@/hooks/useNoteNavigation";
import {
	getGetMyNoteByIdQueryKey,
	useDeleteMyNote,
	useGetMyNoteById,
} from "@/lib/api/generated/client";
import type { PrivateNote } from "@/lib/api/generated/schemas";
import { getApiBaseUrl } from "@/lib/config/env";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInAnonymously } from "firebase/auth";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface NoteDetailPageProps {
	params: Promise<{ id: string }>;
}

export default function PrivateNoteDetailPage({ params }: NoteDetailPageProps) {
	const { status } = useAuthStore();
	const [ready, setReady] = useState(false);
	const [noteId, setNoteId] = useState<string>("");

	const { navigateToNotes, navigateToEdit, invalidateNotesCache } =
		useNoteNavigation();

	// Resolve params
	useEffect(() => {
		params.then(({ id }) => setNoteId(id));
	}, [params]);

	// Authentication setup
	useEffect(() => {
		const run = async () => {
			if (status === "unauthenticated") {
				try {
					const cred = await signInAnonymously(auth);
					const token = await cred.user.getIdToken();
					await fetch(`${getApiBaseUrl()}/auth/anonymous-login`, {
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
				} catch {
					// ignore; UI will show retry option
				}
			}
			if (status !== "loading") setReady(true);
		};
		void run();
	}, [status]);

	// API hooks
	const {
		data: noteResponse,
		isLoading,
		error,
	} = useGetMyNoteById(noteId, {
		query: {
			enabled: ready && status !== "unauthenticated" && !!noteId,
			queryKey: getGetMyNoteByIdQueryKey(noteId),
		},
	});
	const deleteNoteMutation = useDeleteMyNote();

	const note = noteResponse?.data;

	// Handle authentication issues
	if (!ready) return <div>Loading...</div>;

	if (status === "unauthenticated") {
		return (
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Authenticating... If this persists, please retry.
				</p>
				<Button onClick={() => window.location.reload()}>Try Again</Button>
			</div>
		);
	}

	// Handle loading and errors
	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={navigateToNotes}>
						← Back to Notes
					</Button>
				</div>
				<div className="text-center py-8">
					<div className="text-muted-foreground">Loading note...</div>
				</div>
			</div>
		);
	}

	if (error || !note) {
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			Number(error.status) === 404
		) {
			notFound();
		}
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={navigateToNotes}>
						← Back to Notes
					</Button>
				</div>
				<div className="text-center py-8">
					<div className="text-destructive mb-2">Failed to load note</div>
					<Button variant="outline" onClick={() => window.location.reload()}>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	const handleEditNote = () => {
		navigateToEdit(noteId);
	};

	const handleDeleteNote = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this note? This action cannot be undone.",
			)
		) {
			return;
		}

		await deleteNoteMutation.mutateAsync({ id: noteId });

		// Refresh notes list and navigate back
		await invalidateNotesCache();
		navigateToNotes();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
			<div className="space-y-8 sm:space-y-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" onClick={navigateToNotes}>
							← Back to Notes
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={handleEditNote}>
							Edit
						</Button>
						<Button
							variant="outline"
							onClick={handleDeleteNote}
							disabled={deleteNoteMutation.isPending}
						>
							{deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>

				{/* Content */}
				<article className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
					{/* Note Content */}
					<div className="space-y-8">
						{/* Note Header */}
						<header className="space-y-4">
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-bold">
									{note.title || "Untitled"}
								</h1>
								{/* Visibility status indicator */}
								<span
									className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
										note?.isPublic === true
											? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
											: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
									}`}
								>
									{note?.isPublic === true ? "Public" : "Private"}
								</span>
							</div>
							<div className="text-sm text-muted-foreground">
								<span>Created {formatDate(note.createdAt)}</span>
								{note.updatedAt !== note.createdAt && (
									<span> • Updated {formatDate(note.updatedAt)}</span>
								)}
								<span>
									{" "}
									• {note.content.split(/\s+/).filter(Boolean).length} words
								</span>
							</div>
						</header>

						{/* Note Content */}
						<div className="prose prose-gray dark:prose-invert max-w-none">
							<div className="whitespace-pre-wrap text-base leading-7 sm:text-lg sm:leading-8">
								{note.content}
							</div>
						</div>
					</div>

					{/* Comments Section */}
					<div className="border-t border-border/60 pt-10 sm:pt-12">
						<CommentsSection noteId={noteId} isPrivateNote={true} />
					</div>
				</article>
			</div>
		</main>
	);
}
