# Frontend Deployment (Vercel CLI) — Simplified

Minimal steps to deploy the Next.js app with Vercel CLI.

## Prerequisites
- Vercel account and access to the project
- Backend deployed via SAM to get the Function URL
- Node.js and pnpm installed

## 1) Link the Project (root → frontend)
```bash
# From repo root
pnpm add -D vercel
pnpm vercel link    # select the existing Vercel project
# When asked for the project root, choose: frontend
```

## 2) Set Environment Variables (Vercel → Project Settings)
Scope each to Development / Preview / Production as needed.

Client (NEXT_PUBLIC_*)
- NEXT_PUBLIC_API_BASE_URL: FastAPI Function URL (from SAM output)
- NEXT_PUBLIC_API_TIMEOUT: Optional, defaults to 30000
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: Development only (e.g., 127.0.0.1:9099)

Server/Build
- APP_ENV: staging or production (controls CSP and headers)

Tip
- You can pull envs locally for verification:
  - pnpm vercel env pull .env.development
  - pnpm vercel env pull .env.staging --environment=preview
  - pnpm vercel env pull .env.production --environment=production

Why no origin allowlists?
- The backend Function URL is configured to allow all origins (no credentials), so preview URLs work without updates.

## 3) Deploy
```bash
cd frontend

# Preview deployment
pnpm vercel --target=preview

# Production deployment
pnpm vercel --prod
```

#### Set env vars on Vercel console >> [Settings](https://vercel.com/{TeamName}/{ProjectName}/settings/environment-variables)

Note: Secrets should be **ENABLED** `Sensitive` Option on Vercel Console

Or pull from Vercel

```
# Pull env vars to local files (Note: This will **OVERWRITE** local env file)
pnpm vercel env pull .env.development
pnpm vercel env pull .env.staging --environment=preview
pnpm vercel env pull .env.production --environment=production
```

## Post-Deployment Checks
- Open your Vercel URL and verify pages load.
- Confirm API calls use `NEXT_PUBLIC_API_BASE_URL` and succeed (Function URL).
- In staging/production, CSP is applied; ensure APP_ENV is set correctly.

Tip: For Vercel Preview deployments, set `NODE_ENV=staging` in Project Settings → Environment Variables so CSP is applied in preview builds.

## Troubleshooting
- Missing env vars: ensure correct scope (Development/Preview/Production) and redeploy.
- 401 from API: sign in with Firebase and confirm the backend has credentials configured.
- CORS errors: verify you’re calling the Function URL and headers are correct.

## References
- Backend deployment: docs/deployment/backend-deployment-guideline.md
- Env examples: frontend/.env.example
