"use client";

import { LoginModal } from "@/components/auth/LoginModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AuthModalContent({ children }: { children: React.ReactNode }) {
	const searchParams = useSearchParams();
	const {
		currentModal,
		isAnonymousUpgrade,
		syncWithUrl,
		openModal,
		closeModal,
	} = useAuthModalStore();

	// Handle URL query parameters
	useEffect(() => {
		syncWithUrl(searchParams);
	}, [searchParams, syncWithUrl]);

	const switchToLogin = () => {
		openModal("login", { isAnonymousUpgrade });
	};

	const switchToSignup = () => {
		openModal("signup", { isAnonymousUpgrade });
	};

	return (
		<>
			{children}

			{/* Render modals */}
			<LoginModal
				isOpen={currentModal === "login"}
				onClose={closeModal}
				onSwitchToSignup={switchToSignup}
				isAnonymousUpgrade={isAnonymousUpgrade}
			/>

			<SignUpModal
				isOpen={currentModal === "signup"}
				onClose={closeModal}
				onSwitchToLogin={switchToLogin}
				isAnonymousUpgrade={isAnonymousUpgrade}
			/>
		</>
	);
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={null}>
			<AuthModalContent>{children}</AuthModalContent>
		</Suspense>
	);
}

// Export hook for backward compatibility
export function useAuthModal() {
	return useAuthModalStore();
}
