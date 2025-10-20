"use client";

import { NoteEditor } from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { useNoteNavigation } from "@/hooks/useNoteNavigation";
import {
	getGetMyNoteByIdQueryKey,
	useGetMyNoteById,
	usePublishNote,
	useUnpublishNote,
	useUpdateMyNote,
} from "@/lib/api/generated/client";
import { getApiBaseUrl } from "@/lib/config/env";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInAnonymously } from "firebase/auth";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface NoteEditPageProps {
	params: Promise<{ id: string }>;
}

export default function NoteEditPage({ params }: NoteEditPageProps) {
	const { status } = useAuthStore();
	const [ready, setReady] = useState(false);
	const [noteId, setNoteId] = useState<string>("");
	const [isUpdating, setIsUpdating] = useState(false);

	const { navigateToNotes, navigateToNote, saveAndNavigateToNote } =
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
	const updateNoteMutation = useUpdateMyNote({
		mutation: {
			onSuccess: () => {},
		},
	});
	const publishNoteMutation = usePublishNote({
		mutation: {
			onSuccess: (data) => {},
		},
	});
	const unpublishNoteMutation = useUnpublishNote({
		mutation: {
			onSuccess: (data) => {},
		},
	});

	const note = noteResponse?.data;

	// Debug: Log the note data to see what we're getting
	if (note) {
	}

	// Handler functions (declared early to be available in early returns)
	const handleBackToNotes = navigateToNotes; // Shortcut to notebook

	const handleCancel = () => {
		navigateToNote(noteId); // Back to note detail where user came from
	};

	const handleSaveNote = async (data: {
		title?: string | null;
		content: string;
		isPublic?: boolean;
	}) => {
		if (isUpdating) return; // Prevent double-clicks

		setIsUpdating(true);
		try {
			// First, update the note content
			await updateNoteMutation.mutateAsync({
				id: noteId,
				data: {
					title: data.title || undefined,
					content: data.content,
				},
			});

			// Then, handle visibility change if needed
			const currentVisibility = note?.isPublic ?? false;
			const newVisibility = data.isPublic ?? false;

			if (currentVisibility !== newVisibility) {
				if (newVisibility) {
					const publishResult = await publishNoteMutation.mutateAsync({
						id: noteId,
					});
				} else {
					const unpublishResult = await unpublishNoteMutation.mutateAsync({
						id: noteId,
					});
				}
			}

			// Navigate back to note detail and refresh cache
			await saveAndNavigateToNote(noteId);
		} catch (error) {
			setIsUpdating(false);
		}
	};

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
					<Button variant="ghost" onClick={handleBackToNotes}>
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
					<Button variant="ghost" onClick={handleBackToNotes}>
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

	return (
		<main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
			<div className="space-y-8 sm:space-y-10">
				{/* Header */}
				<div className="space-y-4">
					{/* Navigation breadcrumb */}
					<div className="flex items-center gap-2 text-sm">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBackToNotes}
							className="text-muted-foreground hover:text-foreground"
						>
							My Notes
						</Button>
						<span className="text-muted-foreground">›</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancel}
							className="text-muted-foreground hover:text-foreground"
						>
							Note Detail
						</Button>
						<span className="text-muted-foreground">›</span>
						<span className="font-medium">Edit</span>
					</div>

					{/* Title and primary action */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h1 className="text-2xl sm:text-3xl font-bold">Edit Note</h1>
						<Button variant="outline" onClick={handleCancel}>
							← Back to Note
						</Button>
					</div>
				</div>

				{/* Editor */}
				<NoteEditor
					note={note}
					onSave={handleSaveNote}
					onCancel={handleCancel}
					disabled={isUpdating}
				/>
			</div>
		</main>
	);
}
