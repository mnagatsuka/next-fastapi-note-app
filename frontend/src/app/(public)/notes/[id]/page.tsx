import { CommentsSection } from "@/components/comments";
import { NoteContent } from "@/components/notes/NoteContent";
import { NoteHeader } from "@/components/notes/NoteHeader";
import { NoteMeta } from "@/components/notes/NoteMeta";
import { getNoteById } from "@/lib/api/generated/client";
import type { PublicNote } from "@/lib/api/generated/schemas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface NotePageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: NotePageProps): Promise<Metadata> {
	const { id } = await params;
	try {
		const response = await getNoteById(id);
		const note = response.data;

		return {
			title: note.title,
			description: note.content.slice(0, 160),
			openGraph: {
				title: note.title,
				description: note.content.slice(0, 160),
				type: "article",
				publishedTime: note.publishedAt,
				modifiedTime: note.updatedAt,
				authors: [note.author.displayName],
			},
			twitter: {
				card: "summary",
				title: note.title,
				description: note.content.slice(0, 160),
			},
		};
	} catch {
		return {
			title: "Note not found",
			description: "The requested note could not be found.",
		};
	}
}

export default async function NoteDetailPage({ params }: NotePageProps) {
	const { id } = await params;

	let note: PublicNote;
	try {
		const response = await getNoteById(id);
		note = response.data;
	} catch (error) {
		notFound();
	}

	if (!note) {
		notFound();
	}

	return (
		<main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
			<article className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
				<div>
					<NoteHeader
						title={note.title}
						author={note.author}
						publishedAt={note.publishedAt}
					/>
					<NoteContent content={note.content} />
					<NoteMeta
						createdAt={note.createdAt}
						updatedAt={note.updatedAt}
						content={note.content}
					/>
				</div>

				{/* Comments Section */}
				<div className="border-t border-border/60 pt-10 sm:pt-12">
					<CommentsSection noteId={note.id} isPrivateNote={false} />
				</div>
			</article>
		</main>
	);
}
