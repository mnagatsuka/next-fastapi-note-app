"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalOverlayProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function ModalOverlay({ isOpen, onClose, children }: ModalOverlayProps) {
	// Handle ESC key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			// Prevent body scroll
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// Focus trap
	useEffect(() => {
		if (!isOpen) return;

		const focusableElements =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const modal = document.querySelector("[data-modal]") as HTMLElement;
		if (!modal) return;

		const firstFocusableElement = modal.querySelector(
			focusableElements,
		) as HTMLElement;
		const focusableContent = modal.querySelectorAll(focusableElements);
		const lastFocusableElement = focusableContent[
			focusableContent.length - 1
		] as HTMLElement;

		// Focus first element
		firstFocusableElement?.focus();

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstFocusableElement) {
					lastFocusableElement?.focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === lastFocusableElement) {
					firstFocusableElement?.focus();
					e.preventDefault();
				}
			}
		};

		document.addEventListener("keydown", handleTabKey);
		return () => document.removeEventListener("keydown", handleTabKey);
	}, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClose();
					}
				}}
				aria-hidden="true"
			/>

			{/* Modal Content */}
			<dialog
				className="relative z-10 w-full max-w-md mx-4 md:mx-0 bg-transparent border-none p-0 m-0"
				data-modal
				open={isOpen}
				aria-modal="true"
			>
				{children}
			</dialog>
		</div>,
		document.body,
	);
}
