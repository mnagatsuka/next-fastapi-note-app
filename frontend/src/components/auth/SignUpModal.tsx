"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	loginRegularUser,
	updateUserProfile,
} from "@/lib/api/generated/client";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
	EmailAuthProvider,
	createUserWithEmailAndPassword,
	linkWithCredential,
	updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModalOverlay } from "./ModalOverlay";

interface SignUpModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToLogin: () => void;
	isAnonymousUpgrade?: boolean;
}

export function SignUpModal({
	isOpen,
	onClose,
	onSwitchToLogin,
	isAnonymousUpgrade = false,
}: SignUpModalProps) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const { status, user, upgradeAnonymousAccount } = useAuthStore();

	const validateForm = () => {
		if (!email || !password || !displayName) {
			setError("All fields are required.");
			return false;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return false;
		}

		if (!acceptTerms) {
			setError("Please accept the terms and privacy policy.");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isLoading || !validateForm()) return;

		setIsLoading(true);
		setError("");

		try {
			if (isAnonymousUpgrade && user?.isAnonymous) {
				// Upgrade anonymous account
				const credential = EmailAuthProvider.credential(email, password);
				await upgradeAnonymousAccount(credential);

				// Update display name on the current (now-linked) user
				if (auth.currentUser) {
					await updateProfile(auth.currentUser, { displayName });
				}

				// Update profile on backend using generated API client
				await updateUserProfile({ displayName });
			} else {
				// Create new account
				const credential = await createUserWithEmailAndPassword(
					auth,
					email,
					password,
				);

				// Update display name
				await updateProfile(credential.user, { displayName });

				// Register with backend using generated API client
				await loginRegularUser();

				// Update profile using generated API client
				await updateUserProfile({ displayName });
			}

			// Success - close modal and refresh current view to reflect new auth state/profile
			onClose();
			try {
				router.refresh();
			} catch {}
			setEmail("");
			setPassword("");
			setDisplayName("");
			setAcceptTerms(false);
		} catch (error: unknown) {
			// Handle specific Firebase errors
			if (error && typeof error === "object" && "code" in error) {
				const firebaseError = error as { code: string; message: string };
				if (firebaseError.code === "auth/email-already-in-use") {
					setError("An account with this email already exists.");
				} else if (firebaseError.code === "auth/invalid-email") {
					setError("Invalid email address.");
				} else if (firebaseError.code === "auth/weak-password") {
					setError("Password is too weak. Please choose a stronger password.");
				} else if (firebaseError.code === "auth/credential-already-in-use") {
					setError("This email is already linked to another account.");
				} else {
					setError("Account creation failed. Please try again.");
				}
			} else {
				setError("Account creation failed. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		onClose();
		setEmail("");
		setPassword("");
		setDisplayName("");
		setAcceptTerms(false);
		setError("");
	};

	return (
		<ModalOverlay isOpen={isOpen} onClose={handleClose}>
			<Card className="w-full">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">
						{isAnonymousUpgrade ? "Upgrade Account" : "Create Account"}
					</CardTitle>
					{isAnonymousUpgrade && (
						<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm">
							<p className="text-blue-800 dark:text-blue-200">
								📝 Your notes will be preserved when you upgrade your account.
							</p>
						</div>
					)}
				</CardHeader>

				<CardContent className="space-y-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="displayName" className="text-sm font-medium">
								Display Name
							</label>
							<input
								id="displayName"
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								required
								disabled={isLoading}
								placeholder="How should we address you?"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="signup-email" className="text-sm font-medium">
								Email
							</label>
							<input
								id="signup-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="signup-password" className="text-sm font-medium">
								Password
							</label>
							<input
								id="signup-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
								required
								disabled={isLoading}
								minLength={6}
							/>
							<p className="text-xs text-muted-foreground">
								Minimum 6 characters
							</p>
						</div>

						<div className="flex items-start space-x-2">
							<input
								id="terms"
								type="checkbox"
								checked={acceptTerms}
								onChange={(e) => setAcceptTerms(e.target.checked)}
								className="mt-1"
								required
								disabled={isLoading}
							/>
							<label
								htmlFor="terms"
								className="text-sm text-muted-foreground leading-relaxed"
							>
								I agree to the{" "}
								<a
									href="/terms"
									target="_blank"
									className="text-foreground hover:underline"
									rel="noreferrer"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									target="_blank"
									className="text-foreground hover:underline"
									rel="noreferrer"
								>
									Privacy Policy
								</a>
							</label>
						</div>

						{error && (
							<div className="text-sm text-destructive text-center">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading
								? isAnonymousUpgrade
									? "Upgrading..."
									: "Creating Account..."
								: isAnonymousUpgrade
									? "Upgrade Account"
									: "Create Account"}
						</Button>
					</form>

					<div className="border-t pt-4 text-center">
						<p className="text-sm text-muted-foreground mb-2">
							Already have an account?
						</p>
						<Button
							variant="outline"
							onClick={onSwitchToLogin}
							className="w-full"
							disabled={isLoading}
						>
							Sign In
						</Button>
					</div>

					<div className="text-center">
						<Button
							variant="ghost"
							onClick={handleClose}
							className="text-sm"
							disabled={isLoading}
						>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</ModalOverlay>
	);
}
