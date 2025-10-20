"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/config";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInAnonymously } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";

export function Header() {
	const { status, signOut, user } = useAuthStore();
	const { openModal } = useAuthModalStore();
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const router = useRouter();

	const handleSignOut = useCallback(async () => {
		try {
			await signOut();
			router.push("/");
		} catch (error) {
			console.error("Failed to sign out:", error);
		}
	}, [signOut, router]);

	const handleMyNotebookClick = useCallback(async () => {
		if (status === "unauthenticated") {
			setIsAuthenticating(true);
			try {
				await signInAnonymously(auth);
				// AuthProvider will handle the backend bridge call
				router.push("/me");
			} catch (error) {
				console.error("Anonymous authentication failed:", error);
			} finally {
				setIsAuthenticating(false);
			}
		} else {
			router.push("/me");
		}
	}, [status, router]);

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="text-lg font-semibold">
					Simple Notes
				</Link>
				<nav className="flex items-center gap-2 sm:gap-3">
					<Button asChild variant="ghost">
						<Link href="/">Home</Link>
					</Button>
					<Button onClick={handleMyNotebookClick} disabled={isAuthenticating}>
						{isAuthenticating ? "Loading..." : "My Notebook"}
					</Button>

					{/* Authentication buttons */}
					{status === "unauthenticated" && (
						<>
							<Button variant="ghost" onClick={() => openModal("login")}>
								Sign In
							</Button>
							<Button onClick={() => openModal("signup")}>Sign Up</Button>
						</>
					)}

					{status === "anonymous" && (
						<Button
							variant="outline"
							onClick={() => openModal("signup", { isAnonymousUpgrade: true })}
						>
							Upgrade Account
						</Button>
					)}

					{status === "authenticated" && (
						<>
							<Button variant="outline" asChild>
								<Link href="/account">Account</Link>
							</Button>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									{user?.displayName || user?.email}
								</span>
								<Button variant="ghost" size="sm" onClick={handleSignOut}>
									Sign Out
								</Button>
							</div>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
