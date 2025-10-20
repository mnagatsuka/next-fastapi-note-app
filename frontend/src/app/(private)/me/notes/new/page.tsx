"use client";

import { NoteEditor } from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { useNoteNavigation } from "@/hooks/useNoteNavigation";
import { useCreateMyNote, usePublishNote } from "@/lib/api/generated/client";
import { getApiBaseUrl } from "@/lib/config/env";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInAnonymously } from "firebase/auth";
import { useEffect, useState } from "react";

export default function NewNotePage() {
	const { status } = useAuthStore();
	const [ready, setReady] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const { navigateToNotes, saveAndNavigateToNotes } = useNoteNavigation();
	const createNoteMutation = useCreateMyNote();
	const publishNoteMutation = usePublishNote();

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

	// Handle authentication issues
	if (!ready) return <div>Loading...</div>;

	const handleCancel = navigateToNotes; // Back to notebook where user came from

	const handleSaveNote = async (data: {
		title?: string | null;
		content: string;
		isPublic?: boolean;
	}) => {
		if (isCreating) return; // Prevent double-clicks

		setIsCreating(true);
		try {
			// First, create the note (always created as private)
			const result = await createNoteMutation.mutateAsync({
				data: {
					title: data.title || undefined,
					content: data.content,
				},
			});

			// Then, publish if user wants it public
			if (data.isPublic && result.data?.id) {
				await publishNoteMutation.mutateAsync({ id: result.data.id });
			}

			// Navigate back to notebook and refresh cache
			await saveAndNavigateToNotes();
		} catch (error) {
			setIsCreating(false);
		}
	};

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

	return (
		<main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
			<div className="space-y-8 sm:space-y-10">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" onClick={handleCancel}>
							← Back to Notes
						</Button>
					</div>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">Create New Note</h1>
					</div>
				</div>

				{/* Editor */}
				<NoteEditor
					onSave={handleSaveNote}
					onCancel={handleCancel}
					disabled={isCreating}
				/>
			</div>
		</main>
	);
}
