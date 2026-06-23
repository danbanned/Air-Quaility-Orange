# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Air Quality Orange is a Next.js community engagement platform focused on environmental justice in Philadelphia neighborhoods (Nicetown, Hunting Park, Eastwick). It combines 3D geospatial mapping, community storytelling, event management, and live environmental data.

## Commands

```bash
npm run dev              # Start dev server (also copies Cesium assets)
npm run build            # Prisma generate + copy Cesium + Next.js build
npm start                # Production server

npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Run interactive schema migration
npm run prisma:seed      # Seed demo users (admin, assistant, user accounts)
npm run copy-cesium      # Copy Cesium static assets to public/
```

There are no test commands configured.

## Architecture

**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Prisma (LibSQL/Turso), NextAuth.js, Zustand, SWR, Cesium.js, Chart.js, Google APIs (Maps, Air Quality, Weather, Geocoding)

### Directory Layout

```
app/
├── api/           ~30 API route handlers
├── admin/         Admin dashboard pages
└── (pages)/       ~15 public-facing pages

components/
├── homepageLayouts/   4 switchable homepage templates
├── CesiumMap.jsx      3D map (dynamically imported, SSR disabled)
└── environment/       AQI/weather overlay components

lib/
├── auth.js            NextAuth config, role helpers
├── prisma.js          Prisma client with Turso adapter
├── hooks/             Custom React hooks (useEnvironmentData, useGeocoding, etc.)
├── services/          External API wrappers (environment, geocoding, places)
└── store/             Zustand environmentStore

prisma/
├── schema.prisma      12 data models
└── migrations/        5 migrations (run sequentially)
```

### Key Architectural Decisions

**Database:** Turso (edge SQLite via `@prisma/adapter-libsql`). Local dev uses `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Schema changes require `prisma:migrate` then `prisma:generate`.

**Cesium.js:** Must copy static assets to `public/` before building (`copy-cesium` script). Always import CesiumMap with `dynamic(..., { ssr: false })` — it breaks SSR.

**Environmental Data Pipeline:** Google Air Quality + Weather APIs → `/api/aqi-weather` route (15-minute server TTL) → Zustand `environmentStore` (client-side cache with localStorage persistence). Fallback values: AQI=75, temp=24°C.

**Homepage Layout System:** Four switchable templates (Default, Compact, StoryFocused, DataHeavy) stored in the `HomePageContent` DB model. Admins switch via `/admin/homepage-editor`. All templates consume the same `slides`, `homeContent`, and `stories` props.

**Auth:** Credentials-based JWT via NextAuth (24h session). Roles: `ADMIN` (full access), `ADMIN_ASSISTANT` (limited), `USER` (community). All admin actions are written to `ActivityLog`. Password hashing with bcryptjs (12 rounds).

**Story Moderation Flow:** User submits → `PENDING` → Admin approves/rejects → `APPROVED`/`REJECTED`/`ARCHIVED`.

### Data Models (12)

`User`, `Story`, `Solution`, `Event`, `Opportunity`, `Location`, `HeroSlide`, `HomePageContent`, `SystemSetting`, `ActivityLog`, `Notification`, `DeleteRequest`

## Required Environment Variables

```
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
```

Optional seed passwords: `ADMIN_PASSWORD`, `ADMIN_ASSISTANT_PASSWORD`, `USER_PASSWORD`

## Gotchas

- Cesium.js is AGPL-licensed — verify compliance for commercial deployment.
- `npm run build` will fail if `copy-cesium` hasn't run or Prisma client isn't generated; the build script chains these automatically.
- The Google Maps API key must have Air Quality, Weather, Geocoding, and Maps JavaScript APIs enabled.
