import { promoteAnonymousUser } from "@/lib/api/generated/client";
import { auth } from "@/lib/firebase/config";
import type { User } from "firebase/auth";
import {
	type AuthCredential,
	signOut as firebaseSignOut,
	linkWithCredential,
	updateProfile,
} from "firebase/auth";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type AuthStatus =
	| "loading"
	| "authenticated"
	| "anonymous"
	| "unauthenticated";

interface AuthState {
	user: User | null;
	status: AuthStatus;
}

interface AuthActions {
	setUser: (user: User | null) => void;
	setStatus: (status: AuthStatus) => void;
	signOut: () => Promise<void>;
	upgradeAnonymousAccount: (credential: AuthCredential) => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
	devtools(
		(set, get) => ({
			// State
			user: null,
			status: "loading",

			// Actions
			setUser: (user) => set({ user }),
			setStatus: (status) => set({ status }),

			signOut: async () => {
				try {
					await firebaseSignOut(auth);
					set({ user: null, status: "unauthenticated" });
				} catch (error) {
					console.error("Failed to sign out:", error);
					throw error;
				}
			},

			upgradeAnonymousAccount: async (credential) => {
				const { user } = get();
				if (!user?.isAnonymous) {
					throw new Error("User is not anonymous");
				}

				// Capture anonymous UUID before linking
				const anonymousFirebaseUuid = user.uid;

				try {
					// Link the anonymous account with the new credential
					const userCredential = await linkWithCredential(user, credential);

					// Force refresh ID token so email and claims are present immediately
					await userCredential.user.getIdToken(true);

					// Call backend to upgrade account using generated API client
					await promoteAnonymousUser({
						anonymous_firebase_uuid: anonymousFirebaseUuid,
					});

					// Mark session as regular user now
					set({ user: userCredential.user, status: "authenticated" });
				} catch (error) {
					console.error("Failed to upgrade anonymous account:", error);
					throw error;
				}
			},
		}),
		{
			name: "auth-store",
		},
	),
);
