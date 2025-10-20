import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type AuthModalType = "login" | "signup" | null;

interface AuthModalState {
	currentModal: AuthModalType;
	isAnonymousUpgrade: boolean;
}

interface AuthModalActions {
	openModal: (
		modal: "login" | "signup",
		options?: { isAnonymousUpgrade?: boolean },
	) => void;
	closeModal: () => void;
	syncWithUrl: (searchParams: URLSearchParams) => void;
	updateUrl: (searchParams: URLSearchParams, pathname: string) => void;
}

export type AuthModalStore = AuthModalState & AuthModalActions;

export const useAuthModalStore = create<AuthModalStore>()(
	devtools(
		(set, get) => ({
			// State
			currentModal: null,
			isAnonymousUpgrade: false,

			// Actions
			openModal: (modal, options = {}) => {
				set({
					currentModal: modal,
					isAnonymousUpgrade: options.isAnonymousUpgrade || false,
				});

				// Update URL
				const url = new URL(window.location.href);
				url.searchParams.set("auth", modal);
				if (options.isAnonymousUpgrade) {
					url.searchParams.set("upgrade", "true");
				}
				window.history.replaceState({}, "", url.pathname + url.search);
			},

			closeModal: () => {
				set({ currentModal: null, isAnonymousUpgrade: false });

				// Remove auth params from URL
				const url = new URL(window.location.href);
				url.searchParams.delete("auth");
				url.searchParams.delete("upgrade");
				window.history.replaceState({}, "", url.pathname + url.search);
			},

			syncWithUrl: (searchParams) => {
				const authParam = searchParams.get("auth");
				const upgradeParam = searchParams.get("upgrade");

				if (authParam === "login" || authParam === "signup") {
					set({
						currentModal: authParam,
						isAnonymousUpgrade: upgradeParam === "true",
					});
				} else {
					set({ currentModal: null, isAnonymousUpgrade: false });
				}
			},

			updateUrl: (searchParams, pathname) => {
				const { currentModal, isAnonymousUpgrade } = get();

				const url = new URL(window.location.href);

				if (currentModal) {
					url.searchParams.set("auth", currentModal);
					if (isAnonymousUpgrade) {
						url.searchParams.set("upgrade", "true");
					}
				} else {
					url.searchParams.delete("auth");
					url.searchParams.delete("upgrade");
				}

				window.history.replaceState({}, "", pathname + url.search);
			},
		}),
		{
			name: "auth-modal-store",
		},
	),
);
