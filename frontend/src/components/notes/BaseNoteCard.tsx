"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { type ReactNode, useState } from "react";

interface BaseNoteCardProps {
	id: string;
	title?: string | null;
	content: string;
	updatedAt: string;
	linkHref: string;
	children?: ReactNode;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	className?: string;
}

export function BaseNoteCard({
	id,
	title,
	content,
	updatedAt,
	linkHref,
	children,
	onEdit,
	onDelete,
	className = "",
}: BaseNoteCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);

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
			onDelete?.(id);
		} catch (error) {
			setIsDeleting(false);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onEdit?.(id);
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

	const getWordCount = (text: string) => {
		return text.split(/\s+/).filter(Boolean).length;
	};

	return (
		<Link href={linkHref} className="group">
			<Card
				className={`h-full transition-all hover:shadow-md group cursor-pointer border-border/50 hover:border-border ${className}`}
			>
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0">
							<CardTitle className="text-base font-medium line-clamp-2 group-hover:text-accent-foreground leading-snug">
								{title || "Untitled"}
							</CardTitle>
						</div>

						<div className="flex items-start gap-2 flex-shrink-0">
							{/* Actions - only shown when edit/delete handlers are provided */}
							{(onEdit || onDelete) && (
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
						{getPreview(content)}
					</p>

					{/* Footer with metadata */}
					<div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
						<div className="flex items-center gap-2.5">
							{/* Custom metadata from children */}
							{children}

							{/* Default updated date */}
							<time dateTime={updatedAt}>Updated {formatDate(updatedAt)}</time>
						</div>

						{/* Word count */}
						<span>{getWordCount(content)} words</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
