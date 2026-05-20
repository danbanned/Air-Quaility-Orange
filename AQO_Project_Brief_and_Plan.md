# AQO Project Brief and Plan

**Project:** Air Quality Orange (AQO)  
**Repository:** `aqo`  
**Date:** 2026-05-01

## 1. Project Summary

Air Quality Orange is a community-centered web platform focused on environmental justice in Philadelphia neighborhoods such as Nicetown, Hunting Park, and Eastwick. The current repository already supports a storytelling site with pages for the problem, history, data, map, community voices, solutions, events, and calls to action.

The core purpose of the project is to help residents, organizers, and supporters understand how air pollution, heat, and environmental racism affect local communities, while also making community-led solutions visible and actionable.

This week should focus on clarifying three things:

1. The problem AQO is solving
2. The solution AQO is building
3. The technical constraints and project plan needed to deliver it

---

## 2. Problem Statement

Communities in Nicetown, Hunting Park, and Eastwick face overlapping environmental harms:

- Poor air quality from highways, rail, industrial activity, and energy infrastructure
- High asthma and respiratory illness burdens, especially for children
- Urban heat island effects caused by low tree canopy and heavy impervious surfaces
- Long-term environmental racism shaped by redlining, disinvestment, and zoning decisions

The problem is not only pollution itself. It is also a communication and access problem:

- Important environmental data is fragmented and hard to interpret
- Community stories are often disconnected from technical data
- Residents need a clearer way to see where pollution sources, health impacts, and community solutions overlap
- Supporters and partners need a usable public-facing tool for education, advocacy, and organizing

In short, AQO needs to turn environmental injustice from an abstract issue into something visible, local, and actionable.

---

## 3. Proposed Solution

AQO’s solution is a public-facing digital platform that combines:

- Storytelling about environmental justice
- Community health and pollution data
- A neighborhood-based interactive map
- Clear pathways for action, volunteering, and community engagement

Based on the current repo, the practical near-term solution is a **web-first MVP** built with Next.js. That MVP should:

- Explain the environmental justice problem in plain language
- Show key health and pollution statistics
- Map important pollution sources and community solutions
- Highlight community voices and organizing wins
- Give users ways to get involved

The longer-term vision in the repo documentation points toward a richer geospatial experience using Cesium and potentially a more advanced 3D map workflow. That should be treated as a later phase, not the immediate requirement for this week.

---

## 4. Current Repository State

The repo already contains a usable foundation for the MVP:

- A Next.js application with routes in `app/`
- Most content rendered through `legacy-pages/`
- A shared layout with header/footer navigation
- A homepage introducing AQO’s mission and major sections
- Content pages for problem, data, solutions, history, events, voices, and involvement
- A simple embedded map interface in `components/Map/MapComponent.js`
- A Cesium-based component in `components/CesiumMap.jsx`
- Static environmental datasets and story-driven UI content

This means AQO is not starting from zero. The main planning task is to tighten scope, organize delivery, and decide which mapping approach is the true MVP.

---

## 5. Technical Constraints

The current codebase reveals several real constraints that should shape planning.

### A. Mixed Architecture

The app uses the Next.js `app/` router, but most actual page content is still coming from `legacy-pages/`. This is workable in the short term, but it creates maintenance complexity.

**Constraint:** Development will be slower until the team chooses whether to keep the legacy structure or fully migrate to the app router.

### B. Two Different Map Directions

The repo currently contains:

- A simple iframe/OpenStreetMap-style map component for immediate web use
- A Cesium component for a more advanced geospatial experience

**Constraint:** The team should not try to treat both as equal MVP paths. One map strategy needs to be chosen first.

Recommended MVP choice:
- Keep the simple web map as the primary deliverable
- Treat Cesium as a phase 2 enhancement after core content and UX are stable

### C. Static Data and Content

Much of the current data is hardcoded directly into components.

**Constraint:** This is fine for a demo or early milestone, but it does not scale well for updates, fact-checking, or community review.

### D. Dependency on External Map/Data Services

The Cesium work depends on:

- Cesium runtime assets being copied into `public/cesium`
- A `NEXT_PUBLIC_CESIUM_TOKEN`
- External tile and map services

**Constraint:** Advanced mapping features will break or degrade if tokens, asset copying, or third-party services are not configured correctly.

### E. Content Accuracy and Trust

AQO is an environmental justice project. Content quality matters as much as technical quality.

**Constraint:** Data points, community narratives, and claims should be reviewed before public launch. Incorrect or outdated statistics would damage trust.

### F. Limited Backend/Workflow Infrastructure

The repo currently reads like a frontend-heavy MVP.

**Constraint:** There is no obvious content management system, admin workflow, or backend pipeline yet for managing stories, events, or verified datasets.

---

## 6. Core Feature List

The core feature list should stay focused on the web MVP.

### Must-Have Features

- Homepage introducing AQO and the mission
- Problem page explaining air pollution, heat, and environmental racism
- Data page with key health and environmental metrics
- Interactive map showing pollution sources, heat zones, and community solutions
- Solutions page highlighting active community responses
- Community voices/storytelling page
- Get involved and contact pathways

### Should-Have Features

- Cleaner source attribution for all statistics
- Better map interactions with filter controls and richer location cards
- Consistent reusable content model for stories, locations, and metrics
- Mobile polish and accessibility review

### Nice-to-Have Features

- Cesium-powered 3D map experience
- Multimedia storytelling with video/audio
- Search, personalization, or saved user journeys
- Admin/content editing workflow

---

## 7. Recommended Roadmap

## Phase 1: Define and Stabilize the MVP

Goal: align the team around what AQO is shipping first.

- Finalize the product statement: AQO is a web-first environmental justice storytelling and mapping platform
- Choose the primary map implementation for MVP
- Audit all current copy, data points, and feature claims
- Decide which pages are launch-critical and which can wait

## Phase 2: Clean Up the Foundation

Goal: make the current repo easier to maintain.

- Standardize routing between `app/` and `legacy-pages/`
- Consolidate duplicate or experimental map components
- Move hardcoded data into structured data files where possible
- Confirm environment variable and Cesium asset setup

## Phase 3: Ship the Core Public Experience

Goal: deliver a coherent and usable AQO site.

- Refine homepage messaging and calls to action
- Finalize problem, data, solutions, voices, and map content
- Improve map labels, filters, and explanation text
- Verify mobile responsiveness and basic accessibility

## Phase 4: Add Depth and Credibility

Goal: strengthen trust and usefulness.

- Add cited data sources per page
- Expand community story content
- Add richer map overlays and neighborhood-specific context
- Create a repeatable content update process

## Phase 5: Explore Advanced Mapping

Goal: evaluate whether Cesium or 3D geospatial storytelling is worth the extra complexity.

- Decide whether Cesium materially improves the user experience
- Prototype one polished geospatial story flow
- Measure performance, usability, and maintenance cost
- Only then decide whether to invest in a broader 3D map roadmap

---

## 8. Trello Board Structure

The project plan can be represented as a Trello board with the following columns.

### List 1: Backlog

- Audit all existing pages and components
- Verify statistics and source list
- Decide MVP map strategy
- Define launch audience and use cases
- Identify missing community story content

### List 2: This Week

- Write project brief and scope statement
- Finalize problem/solution framing
- Document technical constraints
- Create core feature list
- Build first project roadmap
- Create Trello board from approved tasks

### List 3: In Progress

- Refactor legacy/app routing overlap
- Improve interactive map UX
- Organize static data into reusable files

### List 4: Review

- Review copy for tone and clarity
- Review data claims for accuracy
- Review map locations for correctness
- Review mobile layout and navigation

### List 5: Done

- Homepage structure created
- Problem/data/solutions pages created
- Base map experience implemented
- Initial AQO planning docs created

---

## 9. Suggested Trello Cards

Here is a practical starter card list.

### Product and Scope

- Define AQO MVP in one sentence
- Choose MVP audience: residents, partners, or general public
- Decide whether Cesium is MVP or phase 2

### Content

- Review all current environmental statistics
- Add citations to each key data point
- Finalize community voice/story content
- Rewrite pages for consistency and clarity

### Design and UX

- Improve homepage CTA hierarchy
- Make map instructions clearer
- Ensure mobile readability across all sections
- Improve navigation between story, data, and map pages

### Engineering

- Consolidate page architecture
- Remove or isolate unused experimental map files
- Centralize data in shared modules
- Document env vars and setup steps

### Launch Readiness

- Accessibility pass
- Content accuracy review
- Device/browser smoke test
- Final stakeholder review

---

## 10. Recommended Priorities for This Week

If this week is specifically about planning, these should be the immediate outputs:

1. Approve the problem statement and solution statement
2. Lock the MVP scope to the current web platform
3. Choose one map strategy for the first release
4. Produce a core feature list
5. Create a Trello board using the roadmap above

That gives the team a realistic plan instead of trying to solve content, geospatial engineering, and advanced platform design all at once.

---

## 11. One-Sentence Positioning Statement

Air Quality Orange is a web-based environmental justice platform that helps Philadelphia communities understand pollution, health impacts, and local solutions through storytelling, data, and interactive mapping.

