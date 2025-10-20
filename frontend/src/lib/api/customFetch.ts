import { auth } from "@/lib/firebase/config";

// API configuration
// Use server-side API_BASE_URL for SSR, fallback to client-side NEXT_PUBLIC_API_BASE_URL for client-side
const API_BASE_URL =
	process.env.API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	"http://localhost:8000";
const API_TIMEOUT = Number.parseInt(
	process.env.API_TIMEOUT || process.env.NEXT_PUBLIC_API_TIMEOUT || "30000",
	10,
);

// Helper function to check if endpoint requires authentication
function isPrivateEndpoint(url: string): boolean {
	// Parse URL safely to inspect pathname and avoid false positives (e.g., '/memes')
	try {
		const { pathname } = new URL(url, "http://local");
		if (pathname === "/me" || pathname.startsWith("/me/")) return true;
		if (pathname === "/auth" || pathname.startsWith("/auth/")) return true;
		return false;
	} catch {
		// Fallback for unexpected inputs
		return url.includes("/me") || url.includes("/auth/");
	}
}

// Orval-compatible customFetch function with Firebase auth integration
export const customFetch = async <T>(
	url: string,
	options: RequestInit = {},
): Promise<T> => {
	// Build full URL
	const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

	// Setup headers
	const headers = new Headers(options.headers);

	// Add Content-Type for JSON requests
	if (
		!headers.has("Content-Type") &&
		options.body &&
		typeof options.body === "string"
	) {
		headers.set("Content-Type", "application/json");
	}

	// Handle authentication - always send token if available, required for private endpoints
	const currentUser = auth.currentUser;
	if (currentUser) {
		const token = await currentUser.getIdToken();
		headers.set("Authorization", `Bearer ${token}`);
	} else if (isPrivateEndpoint(url)) {
		const error = new Error("Missing auth: user not initialized") as Error & {
			status: number;
			code: string;
		};
		error.status = 401;
		error.code = "MISSING_AUTH_TOKEN";
		throw error;
	}

	// Setup request timeout - use existing signal if provided
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

	// Combine existing signal with timeout signal
	const existingSignal = options.signal;
	if (existingSignal?.aborted) {
		throw new Error("Request was aborted");
	}

	const combinedSignal = controller.signal;
	if (existingSignal) {
		existingSignal.addEventListener("abort", () => controller.abort());
	}

	try {
		const response = await fetch(fullUrl, {
			...options,
			headers,
			signal: combinedSignal,
		});

		clearTimeout(timeoutId);

		// Handle non-ok responses
		if (!response.ok) {
			let errorMessage = response.statusText;
			let errorCode: string | undefined;

			try {
				const contentType = response.headers.get("content-type");
				if (contentType?.includes("application/json")) {
					const errorData = await response.json();
					errorMessage =
						errorData.message || errorData.error?.message || errorMessage;
					errorCode = errorData.code || errorData.error?.code;
				}
			} catch {
				// Use default error message if parsing fails
			}

			const error = new Error(
				`HTTP ${response.status}: ${errorMessage}`,
			) as Error & {
				status: number;
				code?: string;
			};
			error.status = response.status;
			if (errorCode) error.code = errorCode;

			throw error;
		}

		// Parse response based on content type
		const contentType = response.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			return await response.json();
		}

		if (contentType?.includes("text/")) {
			return (await response.text()) as unknown as T;
		}

		return response as unknown as T;
	} catch (error: unknown) {
		clearTimeout(timeoutId);

		if (error instanceof Error && error.name === "AbortError") {
			const timeoutError = new Error(
				`Request timeout after ${API_TIMEOUT}ms`,
			) as Error & {
				status: number;
				code: string;
			};
			timeoutError.status = 408;
			timeoutError.code = "TIMEOUT";
			throw timeoutError;
		}

		throw error;
	}
};
