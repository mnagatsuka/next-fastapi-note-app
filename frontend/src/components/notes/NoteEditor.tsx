"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PrivateNote } from "@/lib/api/generated/schemas";
import { useEffect, useRef, useState } from "react";

interface NoteEditorProps {
	note?: PrivateNote;
	onSave: (data: {
		title?: string | null;
		content: string;
		isPublic?: boolean;
	}) => Promise<void>;
	onCancel: () => void;
	disabled?: boolean;
	className?: string;
}

export function NoteEditor({
	note,
	onSave,
	onCancel,
	disabled = false,
	className = "",
}: NoteEditorProps) {
	const [title, setTitle] = useState(note?.title || "");
	const [content, setContent] = useState(note?.content || "");
	const [isPublic, setIsPublic] = useState(note?.isPublic ?? false);
	const [isSaving, setIsSaving] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const isEditing = Boolean(note);
	const hasUnsavedChanges =
		(title || "").trim() !== (note?.title || "").trim() ||
		content.trim() !== (note?.content || "").trim() ||
		isPublic !== (note?.isPublic ?? false);

	// Auto-focus content area for new notes, title for existing notes
	useEffect(() => {
		if (isEditing) {
			// For existing notes, focus at end of title if it exists, otherwise content
			if (title) {
				const titleInput = document.querySelector(
					'input[name="title"]',
				) as HTMLInputElement;
				titleInput?.focus();
				titleInput?.setSelectionRange(title.length, title.length);
			} else {
				textareaRef.current?.focus();
			}
		} else {
			// For new notes, focus content area only on initial mount
			textareaRef.current?.focus();
		}
	}, [isEditing, title]); // Include title dependency

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
		}
	}); // No dependency array - run on every render to handle content changes

	const handleSave = async () => {
		if (isSaving) return;
		if (!content.trim()) return;

		setIsSaving(true);
		try {
			await onSave({
				title: title.trim() || null,
				content: content.trim(),
				isPublic: isPublic,
			});
		} catch (error) {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			if (
				confirm("You have unsaved changes. Are you sure you want to cancel?")
			) {
				onCancel();
			}
		} else {
			onCancel();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Ctrl/Cmd + S to save
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			if (content.trim()) {
				handleSave();
			}
		}
		// Escape to cancel
		if (e.key === "Escape" && !isSaving) {
			handleCancel();
		}
	};

	return (
		<Card className={`max-w-4xl mx-auto ${className}`}>
			<CardHeader className="pb-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">
						{isEditing ? "Edit Note" : "New Note"}
					</h2>
					<div className="flex items-center gap-4">
						{/* Publish Toggle */}
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">Publish</span>
							<button
								type="button"
								onClick={() => setIsPublic(!isPublic)}
								disabled={disabled || isSaving}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
									isPublic
										? "bg-blue-600 focus-visible:ring-blue-600"
										: "bg-gray-200 focus-visible:ring-gray-300"
								}`}
								role="switch"
								aria-checked={isPublic}
								aria-label="Toggle publish state"
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										isPublic ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleCancel}
								disabled={disabled || isSaving}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								onClick={handleSave}
								disabled={!content.trim() || isSaving || disabled}
							>
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6" onKeyDown={handleKeyDown}>
				{/* Title input */}
				<div>
					<input
						name="title"
						type="text"
						placeholder="Note title (optional)"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full px-0 py-3 text-lg sm:text-xl font-medium bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground"
						maxLength={120}
						disabled={disabled || isSaving}
					/>
					<div className="text-xs text-muted-foreground mt-1">
						{title.length}/120 characters
					</div>
				</div>

				{/* Content textarea */}
				<div>
					<textarea
						ref={textareaRef}
						placeholder="Write your note here..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="w-full px-0 py-3 bg-transparent border-0 resize-none focus:outline-none placeholder:text-muted-foreground leading-relaxed text-base sm:text-lg"
						style={{ minHeight: "200px" }}
						disabled={disabled || isSaving}
					/>
					<div className="text-xs text-muted-foreground mt-2 flex justify-between">
						<span>{content.split(/\s+/).filter(Boolean).length} words</span>
						<span>Press Ctrl+S to save, Esc to cancel</span>
					</div>
				</div>

				{/* Unsaved changes indicator */}
				{hasUnsavedChanges && !isSaving && (
					<div className="text-xs text-amber-600 flex items-center gap-1">
						<span className="w-2 h-2 bg-amber-600 rounded-full" />
						Unsaved changes
					</div>
				)}
			</CardContent>
		</Card>
	);
}
