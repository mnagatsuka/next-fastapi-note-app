"use client";

import type { ReactNode } from "react";

interface BaseNotesGridProps {
	children: ReactNode;
	isEmpty: boolean;
	emptyTitle: string;
	emptyDescription: string;
	className?: string;
}

export function BaseNotesGrid({
	children,
	isEmpty,
	emptyTitle,
	emptyDescription,
	className = "",
}: BaseNotesGridProps) {
	if (isEmpty) {
		return (
			<div className={`text-center py-16 sm:py-20 ${className}`}>
				<div className="text-5xl sm:text-6xl mb-6">📝</div>
				<h3 className="text-xl sm:text-2xl font-medium mb-4">{emptyTitle}</h3>
				<p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
					{emptyDescription}
				</p>
			</div>
		);
	}

	return (
		<div
			className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}
		>
			{children}
		</div>
	);
}
