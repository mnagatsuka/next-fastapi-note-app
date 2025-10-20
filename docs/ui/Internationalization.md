# Frontend Internationalization (Next.js 15+ App Router)

This guide outlines a concise, scalable i18n setup for Next.js 15+ App Router with `next-intl`, covering both SSR and CSR. It also notes integration with Tailwind CSS, Zustand, TanStack Query, and TypeScript, while avoiding over‑engineering. It covers folder structure, middleware-based locale detection, locale-aware routing, message loading, formatting, SEO, testing, and a practical translation workflow.

If the stack changes, update this doc accordingly.

## Goals

- Provide a predictable i18n architecture for App Router.
- Keep server components compatible and tree-shakable.
- Optimize DX: simple APIs for translations, links, and formatting.
- Ensure high-quality UX: locale detection, persistence, and SEO.
- Cover SSR and CSR usage patterns (streaming/hydration).
- Keep implementation minimal; add complexity only when needed.

## Library Choice

- Recommended: `next-intl`
  - Pros: First-class App Router support, server/client APIs, middleware for detection, locale-aware navigation helpers, ICU message formatting, tree-shakable per-route messages, good TypeScript ergonomics.
  - Cons: No automatic key extraction; requires conventions for message files and namespaces.

- Alternatives (when to consider):
  - `next-i18next`: Solid with Pages Router; usable with App Router but more friction vs `next-intl` for RSC.
  - `react-intl` / FormatJS: Mature formatting; requires custom wiring for App Router and middleware.
  - `lingui`: Great developer tooling (extraction, pluralization); more setup for App Router + middleware.

## High-Level Architecture

- Routing model: `app/[locale]/...` with middleware enforcing a locale prefix and default-locale behavior.
- Message files: `messages/<locale>.json` per locale, optional namespacing by route or feature.
- Request config: `i18n/request.ts` declares how to load messages for the current request.
- Provider: `NextIntlClientProvider` wrapped in `app/[locale]/layout.tsx` for client components; server components use `getTranslations`.
- Navigation: Locale-aware `Link`/router from `next-intl/navigation` to keep URLs and state correct when switching languages.
- Persistence: Middleware + cookie to remember the user’s last-selected locale.
- Data fetching: Prefer Server Components and server `fetch`; for CSR data via TanStack Query, include the locale in query keys/headers and hydrate per-locale.
- State: Use Zustand for UI state; do not duplicate the locale in client state—derive from `useLocale()` and the cookie.

### CSR vs SSR at a Glance

- SSR/RSC first to avoid shipping messages to the client and to benefit from streaming.
- CSR only where needed for interactivity; use `useTranslations` inside client components wrapped by `NextIntlClientProvider`.
- If hydrating TanStack Query, scope dehydrated state and query keys by locale.

## Folder Structure

Suggested minimal layout:

```
frontend/
  app/
    [locale]/
      layout.tsx
      page.tsx
      (routes ...)
  i18n/
    request.ts
    config.ts
  messages/
    en.json
    ja.json
  middleware.ts
```

Notes:
- Add more granular message files if helpful, e.g., `messages/en/navigation.json` and load per route. Start simple, refactor as needed.
- Keep all locale-specific UI strings in message files; do not hardcode translatable strings in code.

## Step-by-Step Implementation

### 1) Install dependency

```bash
npm install next-intl
# or: pnpm add next-intl / yarn add next-intl
```

### 2) Define i18n config

Create `i18n/config.ts`:

```ts
// i18n/config.ts
export const locales = ["en", "ja"] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = "en";

// If you support RTL languages later (e.g., "ar"), update this helper.
export function isRtl(locale: string) {
  return ["ar", "he", "fa", "ur"].includes(locale);
}
```

Type safety for messages (optional but recommended):

```ts
// i18n/types.ts
// Derive a Messages type from the base locale for safer t("...") usage.
import en from "../messages/en.json" assert {type: "json"};

export type Messages = typeof en;
export type Namespaces = keyof Messages; // e.g., "Home" | "Cart" | ...
```

### 3) Request-time message loading

Create `i18n/request.ts` to teach `next-intl` how to load messages for the active locale:

```ts
// i18n/request.ts
import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({locale}) => ({
  // If you organize per namespace, import the specific files needed here.
  // Example simple setup: one file per locale.
  messages: (await import(`../messages/${locale}.json`)).default
}));
```

### 4) Middleware for locale detection and prefixing

Create `middleware.ts` in the project root:

```ts
// middleware.ts
import createMiddleware from "next-intl/middleware";
import {locales, defaultLocale} from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  // Prefer as-needed to omit the prefix for the default locale.
  localePrefix: "as-needed",
  localeDetection: true
});

export const config = {
  // Skip next internals and assets.
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
```

Behavior:
- Requests without a locale are redirected to one, using the Accept-Language header or a saved cookie.
- Default locale paths can be shown without a `/en` prefix when using `as-needed`.

### 5) App Router layout and provider

Wrap the app with `NextIntlClientProvider` in `app/[locale]/layout.tsx`:

```tsx
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getLocale} from "next-intl/server";
import type {ReactNode} from "react";
import {isRtl} from "@/i18n/config";

export const dynamic = "force-static"; // Optional: adjust to your data needs

export async function generateStaticParams() {
  // Optionally generate paths for SSG per locale if using static export.
  return [{locale: "en"}, {locale: "ja"}];
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  const activeLocale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={activeLocale} dir={isRtl(activeLocale) ? "rtl" : "ltr"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 6) Using translations in components

Server component (recommended when possible):

```tsx
// app/[locale]/page.tsx (Server Component)
import {getTranslations} from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");
  return <h1>{t("title")}</h1>;
}
```

Client component:

```tsx
"use client";
import {useTranslations, useFormatter, useLocale} from "next-intl";

export function Welcome() {
  const t = useTranslations("Home");
  const format = useFormatter();
  const locale = useLocale();

  return (
    <div>
      <p>{t("greeting", {name: "Alex"})}</p>
      <p>{format.number(123456.78, {style: "currency", currency: "USD"})}</p>
      <small>Locale: {locale}</small>
    </div>
  );
}
```

Message example (`messages/en.json`):

```json
{
  "Home": {
    "title": "Welcome",
    "greeting": "Hello, {name}!"
  }
}
```

### 7) Locale-aware navigation and links

Use helpers from `next-intl/navigation` so links and router actions preserve locale.

```ts
// lib/navigation.ts
import {createSharedPathnamesNavigation} from "next-intl/navigation";
import {locales, defaultLocale} from "@/i18n/config";

export const {
  Link, // Locale-aware Link
  redirect, // Locale-aware redirect
  usePathname,
  useRouter
} = createSharedPathnamesNavigation({
  locales: [...locales],
  localePrefix: "as-needed",
  defaultLocale
});
```

Then import `Link` from `lib/navigation` in your components.

### 8) SEO: metadata, hreflang, and sitemaps

- Set page metadata using translations:

```ts
// app/[locale]/(routes)/example/page.tsx
import {getTranslations} from "next-intl/server";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: "Meta"});
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        en: "/en/example",
        ja: "/ja/example"
      }
    }
  };
}
```

- Expose hreflang via `alternates.languages` (shown above). Ensure canonical URLs omit default-locale prefix if using `as-needed`.
- Sitemaps: expose both localized paths. Example in `app/sitemap.ts` returning entries for `/en/...` and `/ja/...`.
- Open Graph/Twitter: map locales to appropriate tags; if needed, map to regional codes (e.g., `en_US`, `ja_JP`).

### 9) Persisting user language and switcher UI

- The middleware stores a locale cookie. Provide a language switcher that updates the URL and cookie.

```tsx
"use client";
import {usePathname, useRouter} from "@/lib/navigation";
import {useLocale} from "next-intl";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function change(to: string) {
    router.replace(pathname, {locale: to});
  }

  return (
    <select value={locale} onChange={(e) => change(e.target.value)}>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

### 10) Formatting, plurals, and dates

- Use `useFormatter()` for numbers, dates, lists, and relative time.
- Use ICU message syntax for plurals and select:

```json
{
  "Cart": {
    "items": "{count, plural, =0 {No items} one {# item} other {# items}}"
  }
}
```

```tsx
const t = useTranslations("Cart");
<p>{t("items", {count})}</p>
```

### 11) Dynamic routes

- App Router exposes `params.locale`. Server functions like `generateStaticParams` and `generateMetadata` receive `params` with the locale; pass it to `getTranslations` when needed.
- For shared components, rely on `useLocale()` and `useTranslations()`.

## Styling with Tailwind CSS

- Direction: Set `dir` on `<html>`; Tailwind utilities follow logical flow. Prefer logical CSS where feasible.
- RTL tweaks: Target with `[dir="rtl"]` as needed; keep overrides minimal.
- Typography: Validate per-locale wrapping if using `@tailwindcss/typography`.

## State with Zustand

- Do not store the active locale in Zustand. Source of truth is middleware + URL + `useLocale()`.
- If UI state depends on locale, compute from `useLocale()` or pass it in; avoid duplication.

## Data with TanStack Query

- Query keys: Include the active locale, e.g., `["notes", locale]`, to prevent cross-locale cache bleed.
- Requests: Send locale via `Accept-Language` or a header so the backend can localize server-owned content.
- Hydration: If dehydrating on the server, ensure the state is per-locale.

Minimal CSR example:

```tsx
"use client";
import {useQuery} from "@tanstack/react-query";
import {useLocale} from "next-intl";

export function NotesList() {
  const locale = useLocale();
  const {data} = useQuery({
    queryKey: ["notes", locale],
    queryFn: () => fetch(`/api/notes?locale=${locale}`).then((r) => r.json())
  });
  return <ul>{data?.map((n: any) => <li key={n.id}>{n.title}</li>)}</ul>;
}
```

## Best Practices

- Message keys: Stable, namespaced by feature or route (e.g., `Home.title`).
- No string concatenation: Use placeholders and rich text options from `next-intl`.
- Keep messages minimal: Avoid HTML; when necessary, use rich text rendering via `t.rich`.
- Load only what you need: If messages grow, split by namespace and import per route in `i18n/request.ts`.
- Default-locale strategy: Prefer `localePrefix: "as-needed"` to keep clean URLs for the default locale.
- Accessibility: Translate `aria-*`, `alt`, titles, and visible text.
- RTL readiness: Use `dir` attribute and CSS logical properties.
- Avoid overdevelopment: Prefer conventions and minimal providers; keep the surface small.
- Error strategy: Configure sensible fallbacks for missing keys (consider surfacing warnings in dev).

## Testing Strategy

- Unit: Test helpers that map locales, formatters, and language switcher behavior.
- E2E (Playwright):
  - Assert localized routes: `/en/...` and `/ja/...` render.
  - Verify metadata titles/per-locale content.
  - Test locale persistence after switch + reload.
- Visual: Run per-locale snapshots to catch layout regressions (especially for RTL).
- Pseudolocalization: Add a dev-only locale (e.g., `zz`) that elongates strings to uncover truncation and overflow.

## Translation Workflow

1. Authoring
   - Add keys to the relevant namespace file, e.g., `messages/en.json`.
   - Use interpolation and ICU rules; avoid composing sentences in code.

2. Synchronization
   - Keep all locale files in sync. Consider a simple CI script that compares keys across files and fails on drift.

3. Handoff to translators
   - Provide JSON files with context comments (consider adding a parallel `*.notes.md` or inline comments in a separate metadata map since JSON lacks comments).
   - Include screenshots and character limits for sensitive UI.

4. Review & QA
   - Run the app in each locale and verify pluralization, truncation, and metadata.
   - Use pseudolocalization locale to reveal layout issues.

5. Continuous updates
   - Add keys instead of reusing differently; mark deprecated keys and remove after translations catch up.

## Performance Considerations

- Server-first: Prefer server components with `getTranslations` so messages don’t ship to the client unnecessarily.
- Code-splitting: Import only the namespaces needed per route in `i18n/request.ts`.
- Caching: Use standard Next.js caching (static rendering, revalidation) where possible; messages are typically static assets.

## Interop With Backend

- UI strings live in the frontend. If the backend (FastAPI) returns localized content, pass the active locale in requests via header or query param and let the backend format server-owned content.
- Keep the locale truth centralized: the frontend locale drives outbound requests unless a route explicitly overrides it.

## Maintenance Checklist

- Adding a new locale:
  - Add to `locales` in `i18n/config.ts`.
  - Add `<locale>.json` under `messages/`.
  - Update language switcher options and SEO `alternates` where needed.
- Adding a new page/feature:
  - Create or extend a namespace; add keys to all locales.
  - Use server components for static content; client components only when necessary.
- Quality gates:
  - CI key parity check.
  - E2E tests for key flows in each locale.

## Appendix: Example Key Parity Script (optional)

Add a simple Node script to verify keys match between locales.

```ts
// scripts/check-i18n-parity.ts
import fs from "node:fs";
import path from "node:path";

function flattedKeys(obj: any, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) return flattedKeys(v, key);
    return [key];
  });
}

function read(locale: string) {
  const p = path.join(process.cwd(), "messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const locales = ["en", "ja"]; // keep in sync with i18n/config.ts
const [base, ...rest] = locales;
const baseKeys = new Set(flattedKeys(read(base)));

let ok = true;
for (const loc of rest) {
  const keys = new Set(flattedKeys(read(loc)));
  for (const k of baseKeys) if (!keys.has(k)) { console.error(`[missing] ${loc}: ${k}`); ok = false; }
  for (const k of keys) if (!baseKeys.has(k)) { console.error(`[extra]   ${loc}: ${k}`); ok = false; }
}

if (!ok) process.exit(1);
console.log("i18n key parity OK");
```

Run in CI before build to ensure translations don’t drift.

---

This setup balances DX, performance, and SEO for localized apps on Next.js App Router. Extend with extraction tooling or TMS integration as the project grows.
