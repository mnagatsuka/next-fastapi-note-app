export const DEFAULT_AVATAR_URL = "/default-avatar.svg";

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function getDisplayAvatar(avatarUrl?: string | null): string {
	return avatarUrl || DEFAULT_AVATAR_URL;
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return !email || emailRegex.test(email);
}

export function validateDisplayName(displayName: string): boolean {
	return displayName.trim().length > 0 && displayName.length <= 60;
}

export function validateAvatarUrl(url: string): boolean {
	if (!url) return true; // Empty URL is valid (will use default)
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
