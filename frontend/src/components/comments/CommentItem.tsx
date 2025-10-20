import type { Comment } from "@/lib/api/generated/schemas";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
	comment: Comment;
	className?: string;
}

export function CommentItem({ comment, className = "" }: CommentItemProps) {
	const formatTimeAgo = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (error) {
			return new Date(dateString).toLocaleDateString();
		}
	};

	const isOptimistic = comment.id.startsWith("optimistic-");

	return (
		<div
			className={`bg-muted/50 rounded-lg p-4 ${isOptimistic ? "opacity-70" : ""} ${className}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<span className="font-medium text-sm">{comment.username}</span>
				<span className="text-muted-foreground text-xs">
					{formatTimeAgo(comment.createdAt)}
				</span>
				{isOptimistic && (
					<span className="text-xs text-muted-foreground/60">Posting...</span>
				)}
			</div>
			<p className="text-sm leading-relaxed whitespace-pre-wrap">
				{comment.content}
			</p>
		</div>
	);
}
