# Testing RadiantView

## Local Dev Setup

1. Ensure PostgreSQL is running locally
2. Run `npm install` and `npx prisma migrate dev`
3. Optionally seed data: `npm run seed` (20 patients, 50 studies, 30 appointments, 25 orders)
4. Start dev server: `npm run dev` (runs on port 3000 with Turbopack)
5. If the `.next` cache gets corrupted (e.g. after running `npm run build` while dev server was running), delete `.next/` and restart the dev server

## Auth Testing

- Default test user can be created via `npm run seed` or directly in the database
- Login at `/login` with email/password credentials
- Registration at `/register` — creates user via server action, auto-logs in, redirects to `/dashboard`
- Protected routes redirect to `/login` when unauthenticated (middleware handles this)
- To verify a user was created: `PGPASSWORD=password psql -h localhost -U ubuntu -d radiantview -c "SELECT email, name, role FROM \"User\";"`

## Server Actions

- Server action files in `lib/actions/` MUST have `"use server"` directive at the top
- Without this directive, Next.js won't treat exported functions as server actions, and calls from client components will fail silently
- The error manifests as a generic catch block error (e.g. "Something went wrong") rather than the structured response

## Database

- PostgreSQL connection: `postgresql://ubuntu:password@localhost:5432/radiantview`
- Prisma ORM with schema at `prisma/schema.prisma`
- Key models: User, Patient, Study, Appointment, Order
- Clean up test data after testing to avoid polluting the database

## Known Gotchas

- Orthanc DICOM server is not available locally — the studies API falls back to database automatically
- The `.next` build cache can get corrupted if you run `npm run build` while the dev server is running — delete `.next/` and restart
- Google OAuth requires proper OAuth credentials configured — skip Google login testing unless credentials are set up
- The app uses Zod v4 (not v3) with `@hookform/resolvers` v5 — make sure these are compatible

## Devin Secrets Needed

- No secrets required for local testing (uses local PostgreSQL with password `password`)
- For Google OAuth testing: would need `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
