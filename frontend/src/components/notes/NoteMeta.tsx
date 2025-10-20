interface NoteMetaProps {
	createdAt: string;
	updatedAt: string;
	content: string;
}

export function NoteMeta({ createdAt, updatedAt, content }: NoteMetaProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Estimate reading time (average 200 words per minute)
	const estimateReadingTime = (text: string) => {
		const wordCount = text.trim().split(/\s+/).length;
		const minutes = Math.ceil(wordCount / 200);
		return minutes;
	};

	const readingTime = estimateReadingTime(content);
	const showUpdated = createdAt !== updatedAt;

	return (
		<aside className="mt-10 sm:mt-12 border-t border-border/60 pt-8">
			<div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
				<div>
					<span className="font-medium">Created:</span> {formatDate(createdAt)}
				</div>
				{showUpdated && (
					<div>
						<span className="font-medium">Updated:</span>{" "}
						{formatDate(updatedAt)}
					</div>
				)}
				<div>
					<span className="font-medium">Reading time:</span> {readingTime} min
				</div>
			</div>
		</aside>
	);
}
