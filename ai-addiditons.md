Integrated the repo around the existing App Router + shared layout instead of replacing it.
  The new secure admin stack is in place with middleware.js:1, lib/auth.js:1, app/api/auth/
  [...nextauth]/route.js:1, app/api/stories/route.js:1, and app/api/admin/stories/route.js:1. I
  also added Prisma + SQLite with prisma/schema.prisma:1, prisma.config.ts:1, prisma/seed.js:1,
  and a shared Prisma client in lib/prisma.js:1. Admin UI is live at app/admin/login/
  page.jsx:1, app/admin/dashboard/page.jsx:1, and app/admin/stories/[id]/edit/page.jsx:1.

  The landing page is now the new Nicetown-Tioga experience in app/page.jsx:1 with the required
  two-column structure, exact community quotes, and the 5 resident user stories. /voices now
  fetches live stories from the API through app/voices/VoicesClient.jsx:1, and I updated the
  shared provider wiring in app/layout.jsx:1 and pages/_app.js:1 so the existing mixed app/
  pages repo can use sessions safely.

  Verification passed with npm run build. Prisma migration and seed also ran successfully.

  If you want a fixed password instead of the generated one, set ADMIN_PASSWORD and rerun npm
  run prisma:seed. Prisma 7 required the prisma.config.ts + SQLite adapter adjustment per the
  official docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference and
  https://www.prisma.io/docs/orm/overview/databases/sqlite#using-the-better-sqlite3-driver-adapter


• Integrated the AQO admin system into the existing repo and aligned it with what was already there instead of duplicating the old stack.

  The core changes are in prisma/schema.prisma, lib/auth.js, lib/admin-system.js, and app/admin/dashboard/page.jsx. I expanded Prisma to include roles, moderated
  stories, solutions, events, event requests, opportunities, interests, notifications, activity logs, delete requests, hero slides, and homepage content. Auth now
  uses real role-based session data for ADMIN, ADMIN_ASSISTANT, and USER, and middleware/admin APIs enforce permissions on the backend.

  I also replaced the static public flows with API-backed pages:
  app/voices/VoicesClient.jsx,
  app/solutions/page.jsx,
  app/events/page.jsx,
  app/get-involved/page.jsx.
  The admin dashboard now handles moderation, CRUD, delete-request review, homepage slide/content editing, and assistant-vs-admin behavior.

  Verification:

  - npx prisma validate passed
  - prisma migrate dev applied 20260514215300_complete_admin_system
  - npm run prisma:seed passed
  - npm run build passed

  Seeded accounts:

  - admin@airqualityorange.org with generated password: ughi3hrI63vUB7P5eDdP9_MSfqTwSVcY
  - assistant@airqualityorange.org with password: assistant-demo-password
  - user@airqualityorange.org with password: user-demo-password
      

  Known limits:

  - Notifications are in-app/database-backed; email sending is not wired yet.
  - Homepage editing is functional but the non-hero sections are managed as JSON in the dashboard rather than polished per-section editors.
  - Auth still rides on NextAuth’s credentials/session flow, with /api/auth/register added for user signup.

  If you want, I can do a second pass to polish the dashboard UX and replace the raw JSON homepage editor with dedicated forms.

  ntegrated the fixes into the current repo without forcing the Tailwind/lowercase-role version onto this codebase.

  The main changes are in app/admin/dashboard/page.jsx, app/admin/assistant/page.jsx, app/admin/login/page.jsx, components/admin/Admin.module.css, and app/
  globals.css. I added the contrast fixes, reorganized the admin UI into a tabbed dashboard, split assistants into their own route, and cleaned up the login page
  styling and flow.

  On auth, I kept the repo’s existing Prisma/NextAuth setup but tightened the session config in lib/auth.js: jwt sessions now have maxAge, admin access flags are
  preserved more reliably, and the login page redirects assistants to /admin/assistant and admins to /admin/dashboard after sign-in. I also updated app/api/admin/
  dashboard/route.js so the dashboard gets the payload shape it needs: stats, pending stories, event requests, deletion requests, and activity log entries.

  I also fixed the build issue caused by Next trying to prerender DB-backed public API routes by marking them dynamic in:
  app/api/stories/route.js,
  app/api/solutions/route.js,
  app/api/events/route.js,
  app/api/opportunities/route.js,
  app/api/homepage-content/route.js,
  and app/api/homepage-slides/route.js.

  Verification:

  - npx tsc --noEmit passed
  - npm run build passed

  One important note: your suggested snippets used lowercase roles like "admin" and "assistant", but this repo uses uppercase enum roles: ADMIN, ADMIN_ASSISTANT,
  USER. I adapted everything to the existing schema so login and route protection stay consistent.

─ Worked for 6m 58s ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Current login credentials

- admin@airqualityorange.org
  password: ughi3hrI63vUB7P5eDdP9_MSfqTwSVcY
- assistant@airqualityorange.org
  password: assistant-demo-password
- user@airqualityorange.org
  password: user-demo-password
  
  All 11 route files fixed. Here's the summary:
#	File	Pattern
1	admin/stories/[id]/approve/route.js	await params → approveStory(id, ...)
2	admin/stories/[id]/reject/route.js	await params → rejectStory(id, ...)
3	admin/stories/[id]/route.js	await params → updateStory(id, ...)
4	admin/homepage-slides/[id]/route.js	await params → prisma.heroSlide.update({ where: { id } })
5	admin/opportunities/[id]/route.js	await params → prisma.opportunity.update({ where: { id } })
6	admin/event-requests/[id]/route.js	await params → prisma.eventRequest.update({ where: { id } })
7	admin/events/[id]/sponsor/route.js	await params → prisma.event.update({ where: { id } })
8	admin/events/[id]/route.js	await params → prisma.event.update({ where: { id } })
9	admin/solutions/[id]/route.js	await params → prisma.solution.update({ where: { id } })
10	admin/delete-requests/[id]/route.js	await params → 2x prisma.*({ where: { id } })
11	opportunities/[id]/interest/route.js	await params → prisma.opportunity.findUnique({ where: { id } })
Each file now does const { id } = await params at the top of the handler and uses id directly instead of params.id. This fixes the "params is a Promise" error from Next.js 16's async params API — the root cause of your "StoryWhereUniqueInput needs at least one of id" Prisma error.

What's Been Done
- App Router base - Root layout, providers, homepage (/) fully migrated
- API layer - 100% migrated (39 route handlers)
- Library/services - 100% migrated (prisma, auth, admin, content services)
- Admin UI - 100% migrated (5 pages + all admin API routes)
- Public pages fully migrated: /events, /get-involved, /solutions, /voices, /login, /map
- Prisma schema - 13 models, SQLite database, clean setup
What's Left
1. 7 thin-wrapper pages still using legacy code: About, AQStories, contact, data, history, problem, simple-map
2. Missing App Router infrastructure: not-found.js, error.js, loading.js
3. Google Fonts not loaded in App Router layout
4. Cleanup: Delete dead pages/ directory and unused legacy-pages/
5. Fix useRouteInfo.js - uses deprecated next/compat/router
Overall migration: ~65% complete. Want me to continue with the remaining work? If so, which area should I tackle first?

implementation.

  The main work is in components/CesiumMap.jsx:180: it now loads Google Photorealistic 3D Tiles when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is valid, falls back to OSM
  buildings if not, keeps the camera constrained to Philadelphia, adds smoother fly-in/orbit behavior, applies visual post-processing, and renders AQO stats plus
  your existing pollution/solution/heat data directly on the map. I also switched app/map/page.jsx:1 off the old legacy OSM page, marked /map as immersive in
  components/Layout/Layout.js:12, updated Cesium copy/build scripts in package.json:5, and added the map UI/Cesium CSS in styles/globals.css:33.

  Verification: npm run build passes.

  One config item is still on you: your .env.local already has NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, but it is still a placeholder value. Until you replace that with a
  real Google key with the required APIs and billing enabled, the map will intentionally fall back to OSM buildings instead of Google photorealistic tiles. I did
  not add react-intersection-observer or the optional token API route because this integration does not use them.