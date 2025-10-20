import { LatestNotesSection } from "@/components/notes/LatestNotesSection";
import { Suspense } from "react";

export default function HomePage() {
	return (
		<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
			<div className="space-y-8">
				<section className="text-center py-12 sm:py-16">
					<h1 className="text-4xl sm:text-5xl font-bold mb-6">Simple Notes</h1>
					<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Discover and read the latest public notes from our community. Create
						your own private notebook to start writing your thoughts.
					</p>
				</section>

				<Suspense
					fallback={
						<div className="text-center py-8">
							<div className="text-muted-foreground">Loading notes...</div>
						</div>
					}
				>
					<LatestNotesSection limit={12} />
				</Suspense>
			</div>
		</main>
	);
}
