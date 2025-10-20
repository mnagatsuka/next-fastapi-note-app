"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrivateNote, PublicNote } from "@/lib/api/generated/schemas";
import { useNotesStore } from "@/lib/stores/notes-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Type guards to handle current API differences
function isPublicNote(note: PublicNote | PrivateNote): note is PublicNote {
	return "author" in note && !("isPublic" in note);
}

function isPrivateNote(note: PublicNote | PrivateNote): note is PrivateNote {
	return "isPublic" in note || !("author" in note);
}

interface NoteCardProps {
	note: PublicNote | PrivateNote;
	viewContext: "public" | "private" | "owner";
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	onAuthorFilter?: (authorId: string) => void;
}

export function NoteCard({
	note,
	viewContext,
	onEdit,
	onDelete,
	onAuthorFilter,
}: NoteCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const { setAuthorFilter } = useNotesStore();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isDeleting) return;
		if (
			!confirm(
				"Are you sure you want to delete this note? This action cannot be undone.",
			)
		)
			return;

		setIsDeleting(true);
		try {
			onDelete?.(note.id);
		} catch (error) {
			setIsDeleting(false);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onEdit?.(note.id);
	};

	const handleAuthorClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if ("author" in note) {
			const publicNote = note as PublicNote;
			if (onAuthorFilter) onAuthorFilter(publicNote.author.id);
			// Also sync to URL so public listing can react
			setAuthorFilter(publicNote.author.id);
			router.push(`/?author=${publicNote.author.id}`);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getPreview = (content: string, maxLength = 120) => {
		if (content.length <= maxLength) return content;
		return `${content.slice(0, maxLength)}...`;
	};

	// Determine link destination based on context
	const linkHref =
		viewContext === "public" ? `/notes/${note.id}` : `/me/notes/${note.id}`;

	return (
		<Link href={linkHref} className="group">
			<Card className="h-full transition-all hover:shadow-md group cursor-pointer border-border/50 hover:border-border">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0">
							<CardTitle className="text-base font-medium line-clamp-2 group-hover:text-accent-foreground leading-snug">
								{note.title || "Untitled"}
							</CardTitle>
						</div>

						<div className="flex items-start gap-2 flex-shrink-0">
							{/* Visibility status for owner view */}
							{/* {viewContext === 'owner' && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (note as any).isPublic === true
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {(note as any).isPublic === true ? 'Public' : 'Private'}
                </span>
              )} */}

							{/* Actions - only for owned notes */}
							{viewContext === "owner" && (
								<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{onEdit && (
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0"
											onClick={handleEdit}
											title="Edit"
										>
											✏️
										</Button>
									)}

									{onDelete && (
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
											onClick={handleDelete}
											disabled={isDeleting}
											title="Delete"
										>
											{isDeleting ? "⏳" : "🗑️"}
										</Button>
									)}
								</div>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-0 space-y-4">
					{/* Content preview */}
					<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
						{getPreview(note.content)}
					</p>

					{/* Footer with metadata - conditional based on note type */}
					<div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
						<div className="flex items-center gap-2.5">
							{/* Visibility status for owner view */}
							{viewContext === "owner" && isPrivateNote(note) && (
								<span
									className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
										note.isPublic === true
											? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
											: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
									}`}
								>
									{note.isPublic === true ? "Public" : "Private"}
								</span>
							)}

							{/* Author info - only for public notes */}
							{viewContext === "public" && "author" in note && (
								<button
									type="button"
									onClick={handleAuthorClick}
									className="hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
								>
									{(note as PublicNote).author.displayName}
								</button>
							)}

							{/* Date handling */}
							<time
								dateTime={
									isPrivateNote(note) && note.isPublic && note.publishedAt
										? note.publishedAt
										: note.updatedAt
								}
							>
								{isPrivateNote(note) && note.isPublic && note.publishedAt
									? formatDate(note.publishedAt)
									: `Updated ${formatDate(note.updatedAt)}`}
							</time>
						</div>

						{/* Word count - only for private notes or owner view */}
						{(isPrivateNote(note) || viewContext === "owner") && (
							<span>{note.content.split(/\s+/).length} words</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
