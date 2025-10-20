import Link from "next/link";

export function Footer() {
	return (
		<footer className="mt-auto border-t bg-background/80">
			<div className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-center text-sm text-muted-foreground">
					<Link href="/" className="transition-colors hover:text-foreground">
						Simple Notes
					</Link>
				</div>
			</div>
		</footer>
	);
}
