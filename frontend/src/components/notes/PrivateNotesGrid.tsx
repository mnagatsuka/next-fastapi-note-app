"use client";

import type { PrivateNote } from "@/lib/api/generated/schemas";
import { BaseNotesGrid } from "./BaseNotesGrid";
import { PrivateNoteCard } from "./PrivateNoteCard";

interface PrivateNotesGridProps {
	notes: PrivateNote[];
	viewContext: "private" | "owner";
	onEditNote?: (id: string) => void;
	onDeleteNote?: (id: string) => void;
	className?: string;
}

export function PrivateNotesGrid({
	notes,
	viewContext,
	onEditNote,
	onDeleteNote,
	className = "",
}: PrivateNotesGridProps) {
	return (
		<BaseNotesGrid
			isEmpty={notes.length === 0}
			emptyTitle="No notes yet"
			emptyDescription="Create your first note to get started with your personal notebook."
			className={className}
		>
			{notes.map((note) => (
				<PrivateNoteCard
					key={note.id}
					note={note}
					viewContext={viewContext}
					onEdit={onEditNote}
					onDelete={onDeleteNote}
				/>
			))}
		</BaseNotesGrid>
	);
}
