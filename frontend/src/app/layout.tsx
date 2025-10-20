import "@/styles/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/lib/providers";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
	title: "Simple Note App",
	description: "Public notes and a private, anonymous-friendly notebook.",
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="flex min-h-dvh flex-col bg-background text-foreground">
				<AppProviders>
					<Header />
					{children}
					<Footer />
				</AppProviders>
			</body>
		</html>
	);
}
