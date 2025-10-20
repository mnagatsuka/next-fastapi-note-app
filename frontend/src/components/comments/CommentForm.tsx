"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
	CreatePrivateNoteCommentBody,
	CreatePublicNoteCommentBody,
} from "@/lib/api/generated/schemas";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useState } from "react";

interface CommentFormProps {
	noteId: string;
	isPrivateNote?: boolean;
	onSubmit: (
		data: CreatePublicNoteCommentBody | CreatePrivateNoteCommentBody,
	) => void;
	isSubmitting?: boolean;
	className?: string;
}

const MAX_COMMENT_LENGTH = 1000;

export function CommentForm({
	noteId,
	isPrivateNote = false,
	onSubmit,
	isSubmitting = false,
	className = "",
}: CommentFormProps) {
	const [content, setContent] = useState("");
	const { status, user } = useAuthStore();
	const { openModal } = useAuthModalStore();

	const isAuthenticated = status === "authenticated" || status === "anonymous";
	const remainingChars = MAX_COMMENT_LENGTH - content.length;
	const canSubmit =
		content.trim().length > 0 &&
		content.length <= MAX_COMMENT_LENGTH &&
		!isSubmitting;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!canSubmit) return;

		onSubmit({ content: content.trim() });
		setContent("");
	};

	// Show sign-in prompt for unauthenticated users
	if (!isAuthenticated) {
		return (
			<div className={`text-center py-6 bg-muted/30 rounded-lg ${className}`}>
				<p className="text-muted-foreground mb-3">Sign in to post comments</p>
				<div className="flex gap-2 justify-center">
					<Button
						variant="outline"
						onClick={() => openModal("login")}
						size="sm"
					>
						Sign In
					</Button>
					<Button onClick={() => openModal("signup")} size="sm">
						Sign Up
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
			<div className="space-y-2">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write a comment..."
					className="min-h-[100px] resize-none"
					maxLength={MAX_COMMENT_LENGTH}
					disabled={isSubmitting}
				/>
				<div className="flex justify-between items-center text-xs text-muted-foreground">
					<span>
						Commenting as{" "}
						<strong>{user?.displayName || user?.email || "Anonymous"}</strong>
					</span>
					<span className={remainingChars < 50 ? "text-warning" : ""}>
						{remainingChars} characters remaining
					</span>
				</div>
			</div>

			<div className="flex justify-end">
				<Button type="submit" disabled={!canSubmit} size="sm">
					{isSubmitting ? "Posting..." : "Post Comment"}
				</Button>
			</div>
		</form>
	);
}
