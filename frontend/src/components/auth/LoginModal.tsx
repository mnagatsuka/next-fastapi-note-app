"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginRegularUser } from "@/lib/api/generated/client";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModalOverlay } from "./ModalOverlay";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSwitchToSignup: () => void;
	isAnonymousUpgrade?: boolean;
}

export function LoginModal({
	isOpen,
	onClose,
	onSwitchToSignup,
	isAnonymousUpgrade = false,
}: LoginModalProps) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showForgotPassword, setShowForgotPassword] = useState(false);

	const { status } = useAuthStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isLoading) return;

		setIsLoading(true);
		setError("");

		try {
			// Sign in with Firebase
			await signInWithEmailAndPassword(auth, email, password);

			// Validate with backend using generated API client
			await loginRegularUser();

			// Success - close modal and refresh to reflect updated auth/profile
			onClose();
			try {
				router.refresh();
			} catch {}
			setEmail("");
			setPassword("");
		} catch (error: unknown) {
			// Handle specific Firebase errors
			if (error && typeof error === "object" && "code" in error) {
				const firebaseError = error as { code: string; message: string };
				if (firebaseError.code === "auth/user-not-found") {
					setError("No account found with this email address.");
				} else if (firebaseError.code === "auth/wrong-password") {
					setError("Incorrect password. Please try again.");
				} else if (firebaseError.code === "auth/invalid-email") {
					setError("Invalid email address.");
				} else if (firebaseError.code === "auth/too-many-requests") {
					setError("Too many failed attempts. Please try again later.");
				} else {
					setError("Login failed. Please check your credentials and try again.");
				}
			} else {
				setError("Login failed. Please check your credentials and try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async () => {
		if (!email) {
			setError("Please enter your email address first.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const { sendPasswordResetEmail } = await import("firebase/auth");
			await sendPasswordResetEmail(auth, email);
			setShowForgotPassword(true);
		} catch (error: unknown) {
			if (error && typeof error === "object" && "code" in error) {
				const firebaseError = error as { code: string; message: string };
				if (firebaseError.code === "auth/user-not-found") {
					setError("No account found with this email address.");
				} else {
					setError("Failed to send reset email. Please try again.");
				}
			} else {
				setError("Failed to send reset email. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		onClose();
		setEmail("");
		setPassword("");
		setError("");
		setShowForgotPassword(false);
	};

	return (
		<ModalOverlay isOpen={isOpen} onClose={handleClose}>
			<Card className="w-full">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">
						{showForgotPassword ? "Reset Password" : "Welcome Back"}
					</CardTitle>
					{status === "anonymous" && (
						<p className="text-sm text-muted-foreground">
							Sign in to upgrade your anonymous account and preserve your notes.
						</p>
					)}
				</CardHeader>

				<CardContent className="space-y-4">
					{showForgotPassword ? (
						<div className="space-y-4">
							<div className="text-center text-sm text-muted-foreground">
								Check your email for a password reset link.
							</div>
							<Button
								variant="outline"
								onClick={() => setShowForgotPassword(false)}
								className="w-full"
							>
								Back to Login
							</Button>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
									required
									disabled={isLoading}
								/>
							</div>

							{error && (
								<div className="text-sm text-destructive text-center">
									{error}
								</div>
							)}

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Signing in..." : "Sign In"}
							</Button>

							<div className="text-center">
								<button
									type="button"
									onClick={handleForgotPassword}
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									disabled={isLoading}
								>
									Forgot password?
								</button>
							</div>
						</form>
					)}

					<div className="border-t pt-4 text-center">
						<p className="text-sm text-muted-foreground mb-2">
							Don't have an account?
						</p>
						<Button
							variant="outline"
							onClick={onSwitchToSignup}
							className="w-full"
							disabled={isLoading}
						>
							Create Account
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
