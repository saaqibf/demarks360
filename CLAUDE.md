# Project Instructions

## Commands

```bash
# Dev
pnpm dev

# Build
pnpm build

# Test
pnpm test              # watch mode
pnpm test:run          # single run
pnpm test:run path/to/file.test.ts  # single file

# Lint
pnpm lint

# Type check
npx tsc --noEmit

# DB
pnpm drizzle-kit generate   # create migration from schema changes
pnpm drizzle-kit migrate    # run pending migrations
```

## Architecture

Route groups in `app/`: `(public)` — marketing site, `(admin)` — Clerk-protected dashboard, `(preview)` — auth-free admin UI previews using mock data.

## Key Decisions

- Clerk `pk_test_*` only works on `localhost`. Production requires a custom domain with `pk_live_*`.
- Admin preview routes (`/preview/*`) use hardcoded mock data — they exist so the admin UI can be reviewed without auth or a custom domain.
- `lib/db/index.ts` calls `neon()` at module load time. Any API route that imports it must have `DATABASE_URL` set at build time (production env) or it will crash during static page collection.
