"use client";

import { PrivateNotesGrid } from "@/components/notes/PrivateNotesGrid";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useNoteNavigation } from "@/hooks/useNoteNavigation";
import {
	getGetMyNotesQueryKey,
	useDeleteMyNote,
	useGetMyNotes,
} from "@/lib/api/generated/client";
import { getApiBaseUrl } from "@/lib/config/env";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInAnonymously } from "firebase/auth";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function MyNotebookPage() {
	const { status } = useAuthStore();
	const [ready, setReady] = useState(false);

	const { navigateToCreate, navigateToEdit, invalidateNotesCache } =
		useNoteNavigation();

	// API hooks
	const notesParams = { page: 1, limit: 100 } as const;
	const {
		data: notesResponse,
		isLoading,
		error,
	} = useGetMyNotes(notesParams, {
		query: {
			enabled: ready && status !== "unauthenticated",
			queryKey: getGetMyNotesQueryKey(notesParams),
		},
	});

	const deleteNoteMutation = useDeleteMyNote();

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

	const handleCreateNote = navigateToCreate;

	const handleEditNote = (note: { id: string }) => {
		navigateToEdit(note.id);
	};

	const handleDeleteNote = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this note? This action cannot be undone.",
			)
		) {
			return;
		}

		await deleteNoteMutation.mutateAsync({ id });

		// Refresh notes list using hook
		await invalidateNotesCache();
	};

	if (!ready) return <div>Loading your notes…</div>;

	if (status === "unauthenticated") {
		return (
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Authenticating… If this persists, please retry.
				</p>
				<Button asChild>
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		);
	}

	const notes = notesResponse?.data?.notes || [];

	return (
		<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
			<div className="space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">My Notebook</h1>
						<p className="text-sm text-muted-foreground">
							{status === "anonymous" ? "Signed in as Anonymous" : "Signed in"}
							{notes.length > 0 &&
								` • ${notes.length} note${notes.length === 1 ? "" : "s"}`}
						</p>
					</div>

					{/* Desktop create button */}
					<Button onClick={handleCreateNote} className="hidden md:flex">
						+ New Note
					</Button>
				</div>

				{/* Notes Grid */}
				{isLoading ? (
					<div className="text-center py-8">
						<div className="text-muted-foreground">Loading your notes...</div>
					</div>
				) : error ? (
					<div className="text-center py-8">
						<div className="text-destructive mb-2">Failed to load notes</div>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</div>
				) : (
					<PrivateNotesGrid
						notes={notes}
						viewContext="owner"
						onEditNote={(id) => navigateToEdit(id)}
						onDeleteNote={handleDeleteNote}
					/>
				)}

				{/* Mobile FAB */}
				<FloatingActionButton onClick={handleCreateNote} className="md:hidden">
					+
				</FloatingActionButton>
			</div>
		</main>
	);
}
