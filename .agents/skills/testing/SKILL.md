# RadiantView Testing Skills

## Local Development Setup

```bash
# Install dependencies
npm install

# Start dev server (Turbopack)
npm run dev
# Runs at http://localhost:3000
```

## Database Setup (PostgreSQL)

```bash
# Ensure PostgreSQL is running
sudo systemctl start postgresql

# Create database if not exists
sudo -u postgres createdb radiantview 2>/dev/null || true

# Set password for ubuntu user (use a local dev password)
sudo -u postgres psql -c "ALTER USER ubuntu WITH PASSWORD '<LOCAL_DEV_PASSWORD>';"

# Push Prisma schema to database
npx prisma db push

# Seed demo data (20 patients, 50 studies, 30 appointments, 25 orders)
npm run seed
```

## Environment Variables

Required `.env` for local testing:
```
DATABASE_URL="postgresql://ubuntu:<LOCAL_DEV_PASSWORD>@localhost:5432/radiantview"
AUTH_SECRET="<generate-a-random-secret>"
NEXTAUTH_SECRET="<generate-a-random-secret>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Authentication for Testing

### Known Issue: Registration Server Action
The `/register` page's `registerUser` server action fails silently with "Something went wrong." This is likely a Zod v3/v4 compatibility issue.

### Workaround: Create Test User via Prisma
Create a test user directly in the database using a Node script with bcryptjs to hash the password, then use `prisma.user.upsert` to create a user with role RADIOLOGIST. Log in at `/login` with the created credentials.

## Route Protection

Protected routes (redirect to `/login` if unauthenticated):
- `/dashboard`, `/patients`, `/scheduling`, `/orders`
- `/reports`, `/viewer`, `/analytics`, `/admin`

## Orthanc / DB Fallback

The studies API falls back to the database when Orthanc is unavailable (ECONNREFUSED). This is expected behavior for local testing without an Orthanc server.

## Lint & Build

```bash
npm run lint
npm run build
```
