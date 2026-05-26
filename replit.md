# VisaVantage

A dual-sided marketplace connecting international students (Stamp 2, Stamp 1G, Graduate Visa) with part-time jobs and micro-internships from SMEs in Ireland and the UK.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed demo data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/visa-vantage)
- API: Express 5 (artifacts/api-server, port 8080, path /api)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at lib/api-spec/openapi.yaml)
- Auth: JWT (SESSION_SECRET), bcrypt for passwords, roles: STUDENT | EMPLOYER | ADMIN
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle schema files (users, profiles, jobs, applications, micro-internships, cv, notifications)
- `lib/api-zod/` — Generated Zod schemas from OpenAPI
- `lib/api-client-react/` — Generated React Query hooks + custom-fetch with auth token injection
- `artifacts/api-server/src/routes/` — Express route handlers (auth, jobs, applications, micro-internships, cv, notifications, dashboard, admin)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware (requireAuth, requireRole, optionalAuth)
- `artifacts/visa-vantage/src/pages/` — React pages (home, jobs, micro-internships, student/employer dashboards, admin, applications, profile)
- `artifacts/visa-vantage/src/lib/auth.tsx` — AuthContext + token management via localStorage
- `scripts/src/seed.ts` — Demo data seed script

## Architecture decisions

- JWT stored in localStorage as `visa_vantage_token`, sent as `Authorization: Bearer` header via `setAuthTokenGetter` in `lib/api-client-react`
- Platform fee for micro-internships is 20% computed server-side on create
- CV scoring is heuristic-based (skill overlap with job description), not AI, since no OpenAI integration configured
- Visa eligibility stored as `text[]` array in Postgres; queried with Drizzle `inArray` for batch lookups (never `ANY()` with dynamic params)
- All routes under `/api`, all frontend under `/`

## Product

- **Students**: Browse visa-filtered jobs and micro-internships, apply with cover letters, track application status, build CV, view dashboard
- **Employers**: Post jobs with visa eligibility settings, review applications, update candidate status, post micro-internships with 20% platform fee
- **Admin**: View platform stats (users, jobs, applications), manage and verify employer accounts
- Demo accounts available after seeding (see seed script output)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After modifying `lib/db` schema, always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- Do NOT use `sql\`col = ANY(${array})\`` in Drizzle — use `inArray(col, array)` instead
- `bcrypt` (native) works in api-server; use `bcryptjs` (pure JS) in scripts since native bindings aren't compiled there
- Seed script uses `onConflictDoNothing()` so it's safe to run multiple times

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
