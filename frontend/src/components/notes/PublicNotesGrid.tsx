"use client";

import type { PublicNote } from "@/lib/api/generated/schemas";
import { BaseNotesGrid } from "./BaseNotesGrid";
import { PublicNoteCard } from "./PublicNoteCard";

interface PublicNotesGridProps {
	notes: PublicNote[];
	onAuthorFilter?: (authorId: string) => void;
	className?: string;
}

export function PublicNotesGrid({
	notes,
	onAuthorFilter,
	className = "",
}: PublicNotesGridProps) {
	return (
		<BaseNotesGrid
			isEmpty={notes.length === 0}
			emptyTitle="No notes published yet"
			emptyDescription="Be the first to share your thoughts by creating a note in your notebook!"
			className={className}
		>
			{notes.map((note) => (
				<PublicNoteCard
					key={note.id}
					note={note}
					onAuthorFilter={onAuthorFilter}
				/>
			))}
		</BaseNotesGrid>
	);
}
