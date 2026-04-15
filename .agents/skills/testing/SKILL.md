# Testing RadiantView Locally

## Dev Server
```bash
npm run dev
# Runs at http://localhost:3000 with Turbopack
```

## Database
- Local PostgreSQL connection uses credentials from `.env` file (`DATABASE_URL`)
- Seed demo data: `npm run seed` (creates 20 patients, 50 studies, 30 appointments, 25 orders)
- Existing seed user: `test@radiantview.com`

## Test User Creation
For testing registration, create users via the `/register` page or directly in the database:
```bash
# Query users (use credentials from .env DATABASE_URL)
psql $DATABASE_URL -c "SELECT email, name, role FROM \"User\";"
```

Cleanup test users after testing:
```bash
psql $DATABASE_URL -c "DELETE FROM \"User\" WHERE email='testuser@test.com';"
```

## Registration Flow
1. Navigate to `/register`
2. Fill: Full Name, Email, Password (min 6 chars), Role (RADIOLOGIST/CLINICIAN/TECH/ADMIN)
3. On success: auto-signs in via NextAuth credentials provider, redirects to `/dashboard`
4. On duplicate email: shows "Email already in use!" error banner
5. On server error: shows "Registration failed. Please try again later."

## Key Architecture Notes
- Server actions in `lib/actions/` must have `"use server"` directive at top of file
- Client components (pages with forms, hooks) use `"use client"` directive
- Registration calls `registerUser` server action which returns `{ error: string }` or `{ success: string }`
- The client component in `app/register/page.tsx` handles the response and displays errors or redirects

## Auth
- NextAuth.js with credentials provider
- Auth config in `auth.config.ts` and `auth.ts`
- Protected routes under `app/(authenticated)/` layout group
- Login page: `/login`, Register page: `/register`

## Vercel Deployment Notes
- `DATABASE_URL` must be set in Vercel environment variables
- Prisma migrations must be run against the production database
- Orthanc is not available in production — the studies API falls back to database queries
- No CI is configured; lint and build must be verified locally before pushing

## Lint & Build
```bash
npm run lint    # ESLint
npm run build   # Next.js production build with Turbopack
```
