# Paper Form Scanner

An offline-first mobile workspace that helps loan officers scan handwritten paper forms, review extracted details, and confirm verified applications.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/paper-form/app/` — Expo Router screens for Home, Forms, Sync, Settings, Scan, and Review.
- `artifacts/paper-form/contexts/AppContext.tsx` — local form state and AsyncStorage persistence.
- `artifacts/paper-form/components/AppUi.tsx` — shared status pills, form cards, document preview, and action primitives.
- `artifacts/paper-form/constants/colors.ts` — the mobile theme tokens.

## Architecture decisions

- The first build is local-first: records are persisted with AsyncStorage so scanning and review work without a backend.
- Scans keep their original URI attached to the local record; confirmation only changes the verified status.
- Required fields are checked before confirmation, and users must explicitly acknowledge reviewing against the original scan.
- The Sync tab makes pending work visible instead of hiding offline state behind technical errors.

## Product

- Dashboard with today's totals, recent forms, and a prominent scan action.
- Camera/gallery capture with multi-page local form saving.
- Searchable/filterable form list with clear sync and review states.
- Original document view alongside editable extracted fields.
- Confirmation guardrails and an offline sync status view.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
