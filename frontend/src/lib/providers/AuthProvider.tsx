"use client";

import {
	authenticateAnonymous,
	loginRegularUser,
} from "@/lib/api/generated/client";
import { auth } from "@/lib/firebase/config";
import { type AuthStatus, useAuthStore } from "@/lib/stores/auth-store";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { setUser, setStatus } = useAuthStore();
	const bridgeRef = useRef<{ uid?: string; isAnon?: boolean }>({});

	const bridgeAuthState = useCallback(
		async (u: User) => {
			try {
				const token = await u.getIdToken();
				if (
					bridgeRef.current.uid === u.uid &&
					bridgeRef.current.isAnon === u.isAnonymous
				)
					return;
				bridgeRef.current = { uid: u.uid, isAnon: u.isAnonymous };

				if (u.isAnonymous) {
					await authenticateAnonymous();
					setStatus("anonymous");
				} else {
					await loginRegularUser();
					setStatus("authenticated");
				}
			} catch {
				setStatus(u.isAnonymous ? "anonymous" : "authenticated");
			}
		},
		[setStatus],
	);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (u) => {
			if (!u) {
				setUser(null);
				setStatus("unauthenticated");
				bridgeRef.current = {};
				return;
			}
			setUser(u);
			await bridgeAuthState(u);
		});
		return () => unsub();
	}, [bridgeAuthState, setUser, setStatus]);

	return <>{children}</>;
}

// Export hook for backward compatibility
export function useAuth() {
	return useAuthStore();
}

export type { AuthStatus };
