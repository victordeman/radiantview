# Testing RadiantView

## Local Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`:
   - `DATABASE_URL` — PostgreSQL connection string (use PgBouncer port 6543 for Supabase)
   - `DIRECT_URL` — Direct PostgreSQL connection (port 5432 for Supabase)
   - `AUTH_SECRET` / `NEXTAUTH_SECRET` — NextAuth secret
   - `NEXT_PUBLIC_APP_URL` — App URL (e.g., `http://localhost:3000`)
3. Push schema: `npx prisma db push`
4. Seed data: `npm run seed` (destructive — deletes all existing data first)
5. Start dev server: `npm run dev` (runs on port 3000 with Turbopack)

## Test Accounts

Create test users via the `/register` page or directly in the database:
- Email: `viewertest@test.com` / Password: `password123` / Role: `TECHNOLOGIST`
- Initials displayed: "VT" (from name "Viewer Tester")

## Devin Secrets Needed

- `DATABASE_URL` — Supabase PgBouncer connection string
- `DIRECT_URL` — Supabase direct connection string
- `AUTH_SECRET` — NextAuth secret for session signing

## Key Testing Areas

### Authentication & Logout
- Logout uses a **server action** (`logoutUser()` in `lib/actions/auth.ts`) that calls the server-side `signOut({ redirectTo: "/login" })` from `@/auth`
- Do NOT use client-side `signOut()` from `next-auth/react` — it causes `MissingCSRF` errors with NextAuth v5
- Test both logout paths: topbar avatar dropdown "Log out" and sidebar footer "Logout" button
- After logout, verify session is destroyed by navigating to `/dashboard` — should redirect to `/login`

### Avatar Dropdown
- Uses `useSession()` from `next-auth/react` to get user info
- Requires `SessionProvider` wrapper in root layout (`components/providers.tsx`)
- `DropdownMenuLabel` MUST be wrapped in `DropdownMenuGroup` (Base UI requirement — `MenuPrimitive.GroupLabel` needs `MenuPrimitive.Group` parent)
- This same pattern applies to ALL dropdown menus in the app (viewer toolbar, topbar)

### Guided Tour (driver.js)
- Floating `?` button at bottom-right corner opens tour menu
- 6 tours available: Full Platform, Worklist, Patients, Scheduling, Orders, Viewer
- Cross-page navigation uses `router.push()` + `setTimeout(800ms)` — may fail on slow connections
- Tour targets use `data-tour` attributes on UI elements
- Dark-themed popovers with hardcoded hex colors (`#0f172a`, `#2dd4bf`)

### Seed Data
- `npm run seed` generates: 40 patients, 100 studies, 60 appointments, 50 orders
- Script runs `deleteMany()` on all tables first — destructive by design
- Verify data appears on: `/dashboard` (worklist), `/patients` (cards), `/scheduling` (calendar), `/orders` (table)

## Common Issues

- **Registration fails on Vercel**: Check that `DATABASE_URL` and `DIRECT_URL` are set in Vercel environment variables and that Prisma migrations have been run against the production database
- **DropdownMenu crash**: If you see "MenuGroupRootContext is missing", wrap `DropdownMenuLabel` in `DropdownMenuGroup`
- **CSRF errors on logout**: Use server action approach, not client-side `signOut()`
- **Lint warnings**: The `next lint` command is deprecated in Next.js 16; use ESLint CLI directly

## Tech Stack Notes

- Next.js 15 (App Router) with Turbopack
- Tailwind CSS v4 (uses `@theme` directive, not `tailwind.config.js`)
- shadcn/ui with Base UI primitives (not Radix)
- NextAuth v5 with JWT strategy and Prisma adapter
- PostgreSQL via Supabase with PgBouncer
