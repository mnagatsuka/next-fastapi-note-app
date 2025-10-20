import type { Comment } from "@/lib/api/generated/schemas";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
	comments: Comment[];
	isLoading?: boolean;
	className?: string;
}

export function CommentList({
	comments,
	isLoading = false,
	className = "",
}: CommentListProps) {
	if (isLoading) {
		return (
			<div className={`space-y-4 ${className}`}>
				{/* Loading skeleton */}
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
						<div className="flex items-center gap-2 mb-2">
							<div className="h-4 w-24 bg-muted-foreground/20 rounded" />
							<div className="h-3 w-16 bg-muted-foreground/20 rounded" />
						</div>
						<div className="space-y-2">
							<div className="h-4 w-full bg-muted-foreground/20 rounded" />
							<div className="h-4 w-3/4 bg-muted-foreground/20 rounded" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (comments.length === 0) {
		return (
			<div className={`text-center py-8 text-muted-foreground ${className}`}>
				<p>No comments yet. Be the first to comment!</p>
			</div>
		);
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{comments.map((comment) => (
				<CommentItem key={comment.id} comment={comment} />
			))}
		</div>
	);
}
