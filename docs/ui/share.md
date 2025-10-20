# 📱 Web Share API Implementation Guide (Next.js 15 + App Router)

This guide shows how to implement a **Share button** in a Next.js 15 App Router app that works on both **Smartphone (SP)** and **PC**.  
It uses:

- **Next.js 15 (App Router)**
- **Zustand** (optional, for toast state or feedback)
- **Tailwind CSS** (styling)
- **Vercel** (hosting)

The button will:
- Use the **Web Share API** if available (`navigator.share`)  
- Fall back to **Clipboard API** (`navigator.clipboard`) on unsupported browsers


## 1. Utility: Share or Copy Link

Create `app/lib/share.ts`:

```ts
// app/lib/share.ts
export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export function canUseWebShare(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof (navigator as any).share === "function";
}

export async function shareOrCopyLink(payload: SharePayload): Promise<"shared" | "copied"> {
  const url = payload.url ?? (typeof window !== "undefined" ? window.location.href : "");
  const title = payload.title ?? (typeof document !== "undefined" ? document.title : "");
  const text = payload.text ?? "";

  if (canUseWebShare()) {
    try {
      await (navigator as any).share({ title, text, url });
      return "shared";
    } catch {
      // If user cancels, fall back to copy
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  throw new Error("No share/copy mechanism available.");
}
````


## 2. Share Button Component

Create `app/components/ShareButton.tsx`:

```tsx
"use client";

import * as React from "react";
import { shareOrCopyLink, canUseWebShare, SharePayload } from "@/app/lib/share";

type Props = {
  payload?: SharePayload;
  className?: string;
  labelShare?: string;
  labelCopy?: string;
  onDone?: (result: "shared" | "copied") => void;
};

export default function ShareButton({
  payload,
  className = "",
  labelShare = "Share",
  labelCopy = "Copy link",
  onDone,
}: Props) {
  const [isSharingAvailable, setIsSharingAvailable] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<"shared" | "copied" | null>(null);

  React.useEffect(() => {
    setIsSharingAvailable(canUseWebShare());
  }, []);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await shareOrCopyLink(payload ?? {});
      setLastResult(result);
      onDone?.(result);
    } finally {
      setBusy(false);
    }
  };

  const label = isSharingAvailable ? labelShare : labelCopy;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm
                  border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.99]
                  disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      aria-busy={busy}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
        <path d="M13 5l7 7-7 7M20 12H4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      {label}
      {lastResult && (
        <span className="ml-2 text-xs text-neutral-500">
          {lastResult === "shared" ? "Shared!" : "Copied!"}
        </span>
      )}
    </button>
  );
}
```


## 3. Usage in a Page

In `app/page.tsx`:

```tsx
import ShareButton from "@/app/components/ShareButton";

export default function HomePage() {
  const payload = {
    title: "My Great Page",
    text: "Check this out",
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Hello</h1>
      <ShareButton
        payload={payload}
        labelShare="Share"
        labelCopy="Copy link"
        onDone={(r) => console.log("share result:", r)}
      />
    </main>
  );
}
```


## 4. Notes & Best Practices

* **HTTPS is required** for Web Share API and Clipboard API (Vercel is HTTPS by default).
* Web Share works **only in response to user gestures** (e.g., button click).
* Desktop support varies; fallback ensures consistent UX.
* You can integrate **Zustand** or a toast library for better feedback instead of inline text.
* If you want to **respect “Cancel”** without copying automatically, remove the clipboard fallback in the `catch` block.
