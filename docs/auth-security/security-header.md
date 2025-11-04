# Security Headers Guideline

Target: **Next.js (App Router, Vercel)**
Purpose: Protect end users by attaching appropriate security headers to responses.

**Note**

* The security headers covered here are **interpreted by browsers**.
* **They are not required for API responses (JSON, etc.)**, as browsers do not evaluate them.
* Therefore, these headers only need to be configured on the **Next.js frontend**.


## Target Headers and Recommended Values

| Header                        | Purpose                                 | Applies to                               | Recommended Value                     |
| ----------------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------- |
| **Strict-Transport-Security** | Enforce HTTPS                           | ✅ Next.js (production only)              | `max-age=31536000; includeSubDomains` |
| **X-Content-Type-Options**    | Prevent MIME sniffing                   | ✅ Next.js                                | `nosniff`                             |
| **X-Frame-Options**           | Prevent clickjacking (iframe embedding) | ✅ Next.js (or use CSP `frame-ancestors`) | `DENY`                                |
| **Referrer-Policy**           | Control referrer information            | ✅ Next.js                                | `strict-origin-when-cross-origin`     |
| **Content-Security-Policy**   | Restrict script/connection sources      | ✅ Next.js (environment-specific)         | See sample below                      |
| **Permissions-Policy**        | Control browser feature access          | ✅ Next.js (restrictive by default)       | See sample below                      |


## Next.js Implementation Examples

### Common Headers (excluding CSP)

```ts
// next.config.ts
// Prefer explicit app environment over NODE_ENV for security toggles
const isProd = process.env.APP_ENV === 'production'

const securityHeaders = [
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

export default {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}
```

### CSP (nonce pattern) + Permissions Policy

```ts
// middleware.ts
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
```


## Rationale for Recommended Values

* **HSTS**: Enforce HTTPS in production. Use `preload` only if all subdomains are HTTPS.
* **nosniff**: Always include to prevent MIME type sniffing.
* **X-Frame-Options / frame-ancestors**: Protect against clickjacking. Prefer `DENY`. If embedding is required, use CSP `frame-ancestors`.
* **Referrer-Policy**: Balance privacy and usability. `strict-origin-when-cross-origin` is the standard default.
* **CSP**: Environment-specific approach - strict nonce pattern for development, more permissive for Vercel deployment. Include only the external resources you truly need (Firebase, AWS Lambda, Pusher).
* **Permissions-Policy**: Restrictive by default, denying access to sensitive browser APIs unless explicitly needed. Allows only essential features like fullscreen, autoplay, picture-in-picture, and web-share.


## Verification

```bash
# Frontend - Check all security headers
curl -sI https://your-frontend.vercel.app | grep -iE 'strict|nosniff|frame|referrer|csp|permissions'
```

Automated testing with Playwright or similar tools is also recommended.


## Minimal Required Set

* **Strict-Transport-Security** (production only)
* **X-Content-Type-Options: nosniff**
* **Referrer-Policy: strict-origin-when-cross-origin**
* **X-Frame-Options: DENY** (or CSP `frame-ancestors`)
* **Content-Security-Policy** (environment-specific)
* **Permissions-Policy** (restrictive browser feature control)
