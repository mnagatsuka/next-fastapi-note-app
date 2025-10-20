"use client";

import { Button } from "./button";

interface FloatingActionButtonProps {
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}

export function FloatingActionButton({
	onClick,
	children,
	className = "",
}: FloatingActionButtonProps) {
	return (
		<Button
			onClick={onClick}
			className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 ${className}`}
			size="default"
		>
			{children}
		</Button>
	);
}
