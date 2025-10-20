"use client";

import { ProfileSection } from "@/components/profile/ProfileSection";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AccountPage() {
	const { status } = useAuthStore();
	const router = useRouter();

	// Redirect to home if user is not authenticated
	useEffect(() => {
		if (status !== "loading" && status !== "authenticated") {
			router.push("/");
		}
	}, [status, router]);

	if (status === "loading") return <div>Loading account…</div>;

	// Will be redirected by useEffect, but show loading state during redirect
	if (status !== "authenticated") return <div>Redirecting...</div>;

	return (
		<main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
			<div className="space-y-8 sm:space-y-10">
				<div className="space-y-4">
					<h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
					<p className="text-base text-muted-foreground">
						Manage your profile and account preferences.
					</p>
				</div>
				<ProfileSection />
			</div>
		</main>
	);
}
