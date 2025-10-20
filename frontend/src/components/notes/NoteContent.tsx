interface NoteContentProps {
	content: string;
}

export function NoteContent({ content }: NoteContentProps) {
	return (
		<div className="prose prose-gray dark:prose-invert max-w-none">
			<div className="whitespace-pre-wrap text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
				{content}
			</div>
		</div>
	);
}
