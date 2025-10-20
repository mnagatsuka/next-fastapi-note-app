import { type NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
	const nonce = crypto.randomUUID();
	const isDev = process.env.NODE_ENV === "development";
	const isStaging = process.env.APP_ENV === "staging";

	// Different CSP strategies for different environments
	let scriptSrc = "";
	if (isDev) {
		// Development: strict but with eval for HMR
		scriptSrc = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;
	} else {
		// Staging/Production: more permissive for Vercel
		scriptSrc = `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:${isStaging ? " https://vercel.live" : ""}`;
	}

	const connectSrc = `connect-src 'self' https://firebasestorage.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com${isDev ? " http://localhost:8000 http://localhost:9099 ws://localhost:3001" : ""} ${isStaging || !isDev ? "https://*.lambda-url.ap-northeast-1.on.aws wss://*.execute-api.ap-northeast-1.amazonaws.com wss://ws-us3.pusher.com https://sockjs-us3.pusher.com" : ""}`;

	const csp = [
		"default-src 'self'",
		scriptSrc,
		connectSrc,
		`frame-src 'self'${isStaging || !isDev ? " https://vercel.live" : ""}`,
		"img-src 'self' data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
		"style-src 'self' 'unsafe-inline'", // practical with Tailwind
		"font-src 'self'",
		"frame-ancestors 'none'",
		"object-src 'none'",
		"base-uri 'self'",
	].join("; ");

	const res = NextResponse.next();
	res.headers.set("Content-Security-Policy", csp);

	// Permissions Policy - Control browser features
	const permissionsPolicy = [
		"camera=()",
		"microphone=()",
		"geolocation=()",
		"fullscreen=(self)",
		"payment=()",
		"usb=()",
		"display-capture=()",
		"accelerometer=()",
		"ambient-light-sensor=()",
		"autoplay=(self)",
		"battery=()",
		"gyroscope=()",
		"magnetometer=()",
		"midi=()",
		"picture-in-picture=(self)",
		"sync-xhr=()",
		"web-share=(self)",
	].join(", ");

	res.headers.set("Permissions-Policy", permissionsPolicy);

	// Store nonce for use in pages
	res.headers.set("x-nonce", nonce);

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
