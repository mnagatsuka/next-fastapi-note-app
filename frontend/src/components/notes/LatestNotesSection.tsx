"use client";

import { Button } from "@/components/ui/button";
import { getNotes } from "@/lib/api/generated/client";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PublicNotesGrid } from "./PublicNotesGrid";

interface LatestNotesSectionProps {
	limit?: number;
}

export function LatestNotesSection({ limit = 12 }: LatestNotesSectionProps) {
	const searchParams = useSearchParams();
	const { currentPage, authorFilter, setCurrentPage, setAuthorFilter } =
		useNotesStore();

	// Sync URL params with store
	useEffect(() => {
		const urlAuthorFilter = searchParams.get("author");
		if (urlAuthorFilter !== authorFilter) {
			setAuthorFilter(urlAuthorFilter);
		}
	}, [searchParams, authorFilter, setAuthorFilter]);

	const {
		data: notesData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			"notes",
			"public",
			{ page: currentPage, limit, sort: "latest", author: authorFilter },
		],
		queryFn: () =>
			getNotes({
				page: currentPage,
				limit,
				sort: "latest",
				// Note: Author filtering will be added when API supports it
			}),
	});

	if (isLoading) {
		return (
			<section className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="h-8 w-32 bg-muted animate-pulse rounded" />
					<div className="h-4 w-16 bg-muted animate-pulse rounded" />
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }, (_, i) => `skeleton-note-${i}`).map((skeletonId) => (
						<div key={skeletonId} className="border rounded-lg p-6 space-y-4">
							<div className="space-y-2">
								<div className="h-5 bg-muted animate-pulse rounded w-3/4" />
								<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
							</div>
							<div className="space-y-2">
								<div className="h-3 bg-muted animate-pulse rounded" />
								<div className="h-3 bg-muted animate-pulse rounded" />
								<div className="h-3 bg-muted animate-pulse rounded w-2/3" />
							</div>
						</div>
					))}
				</div>
			</section>
		);
	}

	if (error) {
		console.error("Failed to fetch notes:", error);
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">
					Failed to load notes. Please try again later.
				</p>
			</div>
		);
	}

	const notes = notesData?.data?.notes ?? [];
	const pagination = notesData?.data?.pagination;

	const handlePreviousPage = () => {
		if (pagination?.hasPrev) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (pagination?.hasNext) {
			setCurrentPage(currentPage + 1);
		}
	};

	const clearAuthorFilter = () => {
		setAuthorFilter(null);
		const url = new URL(window.location.href);
		url.searchParams.delete("author");
		window.history.replaceState({}, "", url.pathname + url.search);
	};

	if (!notes.length) {
		return (
			<div className="text-center py-12">
				<h2 className="text-lg font-semibold mb-2">
					{authorFilter ? "No notes found" : "No notes published yet"}
				</h2>
				<p className="text-muted-foreground">
					{authorFilter
						? "This author has not published any notes yet."
						: "Be the first to share your thoughts by creating a note in your notebook!"}
				</p>
				{authorFilter && (
					<Button
						variant="outline"
						onClick={clearAuthorFilter}
						className="mt-4"
					>
						Show All Notes
					</Button>
				)}
			</div>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div>
					<h2 className="text-2xl font-bold">
						{authorFilter
							? `Notes by ${notes[0]?.author?.displayName}`
							: "Latest Notes"}
					</h2>
					{authorFilter && (
						<Button
							variant="ghost"
							onClick={clearAuthorFilter}
							className="mt-1 p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
						>
							← Show all notes
						</Button>
					)}
				</div>

				<div className="flex items-center gap-4">
					{pagination && (
						<span className="text-sm text-muted-foreground">
							Page {pagination.page} of{" "}
							{Math.ceil(pagination.total / pagination.limit)}
						</span>
					)}
					<span className="text-sm text-muted-foreground">
						{pagination?.total || notes.length}{" "}
						{(pagination?.total || notes.length) === 1 ? "note" : "notes"}
					</span>
				</div>
			</div>

			<PublicNotesGrid
				notes={notes}
				onAuthorFilter={(authorId) => setAuthorFilter(authorId)}
			/>

			{/* Pagination Controls */}
			{pagination && (pagination.hasPrev || pagination.hasNext) && (
				<div className="flex items-center justify-center gap-4 pt-6">
					<Button
						variant="outline"
						onClick={handlePreviousPage}
						disabled={!pagination.hasPrev}
					>
						← Previous
					</Button>

					<span className="text-sm text-muted-foreground">
						Page {pagination.page} of{" "}
						{Math.ceil(pagination.total / pagination.limit)}
					</span>

					<Button
						variant="outline"
						onClick={handleNextPage}
						disabled={!pagination.hasNext}
					>
						Next →
					</Button>
				</div>
			)}
		</section>
	);
}
