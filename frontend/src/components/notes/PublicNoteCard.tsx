"use client";

import type { PublicNote } from "@/lib/api/generated/schemas";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useRouter } from "next/navigation";
import { BaseNoteCard } from "./BaseNoteCard";

interface PublicNoteCardProps {
	note: PublicNote;
	onAuthorFilter?: (authorId: string) => void;
	className?: string;
}

export function PublicNoteCard({
	note,
	onAuthorFilter,
	className = "",
}: PublicNoteCardProps) {
	const router = useRouter();
	const { setAuthorFilter } = useNotesStore();

	const handleAuthorClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (onAuthorFilter) onAuthorFilter(note.author.id);
		// Also sync to URL so public listing can react
		setAuthorFilter(note.author.id);
		router.push(`/?author=${note.author.id}`);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<BaseNoteCard
			id={note.id}
			title={note.title}
			content={note.content}
			updatedAt={note.updatedAt}
			linkHref={`/notes/${note.id}`}
			className={className}
		>
			{/* Author info */}
			<button
				type="button"
				onClick={handleAuthorClick}
				className="hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
			>
				{note.author.displayName}
			</button>

			{/* Published date */}
			<time dateTime={note.publishedAt}>
				Published {formatDate(note.publishedAt)}
			</time>
		</BaseNoteCard>
	);
}
