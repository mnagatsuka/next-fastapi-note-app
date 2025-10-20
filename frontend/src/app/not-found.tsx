import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
			<h1 className="text-2xl font-semibold">Page Not Found</h1>
			<p className="text-sm text-muted-foreground max-w-prose">
				The page you’re looking for doesn’t exist. It might have been moved or
				deleted.
			</p>
			<Button asChild>
				<Link href="/">Go to Home</Link>
			</Button>
		</div>
	);
}
