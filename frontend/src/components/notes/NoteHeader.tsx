"use client";

import type { Author } from "@/lib/api/generated/schemas";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useRouter } from "next/navigation";

interface NoteHeaderProps {
	title: string;
	author: Author;
	publishedAt: string;
}

export function NoteHeader({ title, author, publishedAt }: NoteHeaderProps) {
	const router = useRouter();
	const { setAuthorFilter } = useNotesStore();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleAuthorClick = (e: React.MouseEvent) => {
		e.preventDefault();
		setAuthorFilter(author.id);
		router.push(`/?author=${author.id}`);
	};

	return (
		<header className="mb-10 sm:mb-12 border-b border-border/60 pb-8">
			<h1 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
				{title}
			</h1>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
				<button
					type="button"
					onClick={handleAuthorClick}
					className="flex items-center gap-2 transition-colors hover:text-foreground cursor-pointer"
				>
					{author.avatarUrl ? (
						<img
							src={author.avatarUrl}
							alt={`${author.displayName}'s avatar`}
							className="h-6 w-6 rounded-full"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					) : (
						<div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
							{author.displayName.charAt(0).toUpperCase()}
						</div>
					)}
					<span>by {author.displayName}</span>
				</button>
				<time dateTime={publishedAt}>Published {formatDate(publishedAt)}</time>
			</div>
		</header>
	);
}
