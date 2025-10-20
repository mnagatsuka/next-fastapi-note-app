"use client";

import type { PrivateNote } from "@/lib/api/generated/schemas";
import { BaseNoteCard } from "./BaseNoteCard";

interface PrivateNoteCardProps {
	note: PrivateNote;
	viewContext: "private" | "owner";
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	className?: string;
}

export function PrivateNoteCard({
	note,
	viewContext,
	onEdit,
	onDelete,
	className = "",
}: PrivateNoteCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Determine link destination based on context
	const linkHref =
		viewContext === "owner" ? `/me/notes/${note.id}` : `/notes/${note.id}`;

	// Use published date if note is public and has publishedAt, otherwise use updatedAt
	const displayDate =
		note.isPublic && note.publishedAt ? note.publishedAt : note.updatedAt;
	const dateLabel = note.isPublic && note.publishedAt ? "Published" : "Updated";

	return (
		<BaseNoteCard
			id={note.id}
			title={note.title}
			content={note.content}
			updatedAt={note.updatedAt}
			linkHref={linkHref}
			onEdit={viewContext === "owner" ? onEdit : undefined}
			onDelete={viewContext === "owner" ? onDelete : undefined}
			className={className}
		>
			{/* Visibility status for owner view */}
			{viewContext === "owner" && (
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

			{/* Date - show published date if public, otherwise updated date */}
			<time dateTime={displayDate}>
				{dateLabel} {formatDate(displayDate)}
			</time>
		</BaseNoteCard>
	);
}
