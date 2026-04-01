# AQO Interactive Map — Milestone Plan
**Air Quality Orange (AQO) | Philadelphia Environmental Justice Project**
**Founded by Eboni Zamani**
*Created: 2026-03-29*

---

## Overview

This plan breaks the AQO Interactive Map into 9 milestones. Each milestone has:
- A clear goal (what "done" looks like)
- Concrete initiatives (what to actually do)
- Blockers to resolve before starting
- A success check (how you know it worked)

Complete milestones in order. Each one unlocks the next.

---

## The Single Most Important First Step

> Install Unreal Engine 5 + the Cesium plugin, get your Google Maps API key,
> and confirm Philadelphia loads on screen.

Everything else — scans, stories, web frontend, community involvement —
depends on this working first.

---

## Milestone 1 — Environment Setup

### Initiatives,
- [ ] Download the **Epic Games Launcher** (free at unrealengine.com)
- [ ] Install **Unreal Engine 5** through the launcher v khronos pbr netruarl (choose the latest stable versi
on)
- [ ] Inside the launcher, go to the Marketplace and install **Cesium for Unreal** (free)
- [ ] Create a free account at **cesium.com/ion** and save your Ion Access Token
- [ ] Create a **Google Cloud Project**:
  - Go to console.cloud.google.com
  - Create a new project named "AQO-Interactive"
  - Enable billing (credit card required, but usage stays in free tier)
  - Enable the **Map Tiles API**
  - Generate an **API Key** and copy it somewhere safe
- [ ] Watch the Philadelphia Cesium demo before opening Unreal:
  https://www.youtube.com/watch?v=3_5DZ97VMBc

### Blockers to Resolve First
- Google Maps API key requires a credit card on file — do this early, approval can take a few minutes
- Unreal Engine 5 is a large download (~60GB) — start it and let it run overnight if needed

### Success Check
All four of these are true:
1. Unreal Engine 5 opens without errors
2. Cesium plugin is listed under Edit → Plugins → Cesium
3. You have a Cesium Ion token saved
4. You have a Google Maps API key saved

---

## Milestone 2 — Load Philadelphia Into Cesium
**Goal:** You can see Nicetown, Philadelphia in photorealistic 3D inside Unreal Engine.

### Initiatives
- [ ] Open Unreal Engine 5 and create a new **Blank project** (no starter content needed)
- [ ] Enable the Cesium for Unreal plugin (Edit → Plugins → search "Cesium" → enable → restart)
- [ ] Follow the Cesium Quickstart guide: https://cesium.com/learn/unreal/unreal-quickstart/
- [ ] Add a **CesiumGeoreference** actor to the scene
- [ ] Set its coordinates to Nicetown Park:
  ```
  Latitude:  40.01999
  Longitude: -75.15540
  Height:    400
  ```
- [ ] Add **Google Photorealistic 3D Tiles** using your Google Maps API key
  - Guide: https://cesium.com/learn/unreal/unreal-photorealistic-3d-tiles/
- [ ] Add the **Dynamic Pawn** and set its starting position above Nicetown
- [ ] Press Play and fly around Nicetown/Hunting Park

### Blockers to Resolve First
- Milestone 1 must be fully complete
- API key and Ion token must be entered in Cesium plugin settings before tiles will load

### Success Check
- You press Play in Unreal Engine
- You can see Philadelphia streets, buildings, and terrain in 3D
- You can fly the camera to Nicetown Park at the correct location

---

## Milestone 3 — First RealityScan Capture
**Goal:** One real Philadelphia location exists as a 3D model inside Unreal Engine, placed at its real GPS coordinates.

### Initiatives
- [ ] Download **RealityScan** on a phone (free — iOS or Android, by Epic Games)
- [ ] Choose ONE location to scan first — keep it small:
  - A community mural
  - A garden bed or tree
  - A building corner or entrance
  - A fire hydrant or street sign
- [ ] Go to that location and scan it (the app walks you through it step by step)
- [ ] Export the scan from RealityScan — it saves as a `.glb` or `.usdz` file
- [ ] Import the model into your Unreal Engine project (drag into Content Browser)
- [ ] Place the model in the scene at or near its real GPS location using Cesium coordinates
- [ ] Review the Reality Capture → Cesium → Unreal workflow:
  https://cesium.com/blog/2021/03/11/reality-capture-models-arriving-in-cesium-for-unreal/

### Optional — Luma AI (Alternative to RealityScan)
If RealityScan does not produce good results, try **Luma AI**:
- Record a slow 360° video walk around the subject on your phone
- Upload to lumalabs.ai — it generates a 3D model using NeRF technology
- Download the Luma AI Unreal Engine plugin: https://docs.lumalabs.ai/9DdnisfQaLN1sn

### Blockers to Resolve First
- Milestone 2 must be complete so you have a scene to place the model into
- Outdoor scanning works best in overcast light (not direct sun or night)

### Success Check
- A scanned 3D model of a real Nicetown/Hunting Park location is visible in Unreal Engine
- It is placed at approximately the correct GPS coordinates on the Cesium map
- It looks recognizable — a viewer would know what they are looking at

---

## Milestone 4 — Player Experience & Navigation
**Goal:** A user with no gaming experience can navigate the map intuitively.

### Initiatives
- [ ] Configure the **Dynamic Pawn** for smooth flight navigation over the neighborhood
- [ ] Add **location markers** at the key AQO stops (see list below)
- [ ] Build a simple **click-to-travel** system in Blueprint:
  - User clicks a marker → camera flies smoothly to that location
- [ ] Add boundary limits so users cannot accidentally fly off into the ocean
- [ ] Test with someone who has never used Unreal Engine or a game controller
- [ ] Add basic on-screen controls guide ("Click to move", "Scroll to zoom")

### Key Map Stops to Mark
| Location | Significance |
|---|---|
| Nicetown Park | AQO home base, community organizing |
| Wayne Junction | Industrial activity, pollution source |
| SEPTA Midvale Plant | Natural gas plant, emissions source |
| Roosevelt Extension | Heavy vehicle traffic corridor |
| Hunting Park | Urban heat island, SEPTA bus depot fire site |
| PES Refinery Site | Where Philly Thrive won — formerly 72% of city's toxic emissions |
| Furtick Farms | Community-led environmental stewardship |

### Blockers to Resolve First
- Milestones 1 and 2 must be complete
- Decide navigation style: fly (bird's eye) or walk (street level) or both

### Success Check
- A first-time user can open the experience and navigate to all 7 locations without help
- The camera movement feels smooth, not jarring
- No crashes or loading failures during navigation

---

## Milestone 5 — Community Stories & Data Overlays
**Goal:** Users can interact with real data and real stories at each map location.

### Initiatives
- [ ] Write the script for each of the 7 map stops — plain text first, before touching Unreal:
  - What does the user see?
  - What story is told here?
  - What data point is highlighted?
  - What action can the user take (watch video, read more, link to organization)?
- [ ] Design popup cards in **Unreal's UMG (Widget Blueprint)** system:
  - Location name
  - 2–3 sentence story
  - One key statistic (e.g., "21% childhood asthma rate")
  - Photo or video embed
  - Link to community organization
- [ ] Set up **trigger zones** in Blueprint — when the player enters an area, the popup appears
- [ ] Add **video playback** for community testimonials at relevant stops
  - Reference: https://docs.unrealengine.com/5.2/en-US/play-a-video-file-in-unreal-engine/
- [ ] Pull content from the Base44 prototype into these cards

### Key Data Points to Visualize
| Statistic | Location |
|---|---|
| 19140 ZIP — highest childhood asthma hospitalization rate in Philadelphia | Nicetown |
| 21% childhood asthma rate — 3x national average | City-wide overlay |
| Black children 10x more likely to die from asthma than White children | City-wide overlay |
| 125 premature deaths/year linked to air pollution | City-wide overlay |
| 41% of Black residents in highest cancer risk neighborhoods | City-wide overlay |
| Philadelphia received "F" grade for ozone and particle pollution (2025) | City-wide overlay |
| PES Refinery was responsible for 72% of city's toxic emissions before closure | PES Site |

### Blockers to Resolve First
- Write the scripts BEFORE building UI — content drives design, not the other way around
- Community partners (Eboni Zamani, Philly Thrive, Furtick Farms) should review stories before they go live

### Success Check
- All 7 map stops have working popups with story, data, and media
- Video plays correctly at relevant stops
- A community member reviews the content and confirms it is accurate and respectful

---

## Milestone 6 — Web Frontend Integration
**Goal:** Users access the AQO experience through a web browser, not by downloading software.

### Initiatives

**Decision to make first:**

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **Pixel Streaming** | Unreal Engine runs on a server, streams the 3D view as video to any browser | Works on any device, no download | Requires cloud server hosting, more complex |
| **Standalone App** | Users download and install the Unreal Engine build | Better performance, works offline | Requires download, limits accessibility |
| **CesiumJS Web Version** | Rebuild the map view in the browser using CesiumJS (JavaScript) | Fully in-browser, lightweight | Separate from Unreal, less immersive |

**Recommended for AQO:** Pixel Streaming — it keeps the experience fully accessible in a browser
with no downloads, which is critical for community members who may not have gaming hardware.

- [ ] Set up **Unreal Pixel Streaming** following Epic's documentation
- [ ] Deploy the Pixel Streaming server to a cloud host (AWS, Azure, or Google Cloud)
- [ ] Connect the **Replit frontend** to the Pixel Streaming output
- [ ] Embed the 3D stream inside the AQO web interface
- [ ] Make sure the **Base44 content layer** (stories, data) is accessible from the web interface

### Blockers to Resolve First
- The Pixel Streaming decision must be made before building the frontend
- Cloud hosting requires a budget decision — Pixel Streaming on a server has ongoing costs

### Success Check
- A user opens the AQO website on a laptop or phone browser
- They see the interactive Philadelphia map without downloading anything
- Navigation and popups work the same as in the Unreal Engine desktop version

---

## Milestone 7 — The Bridge (Two-Way Communication)
**Goal:** The web frontend and Unreal Engine talk to each other in real time.

### What the Bridge Does
- Web app tells Unreal: "User selected Hunting Park — fly there"
- Unreal tells web app: "User is now standing at this GPS coordinate — show the matching story card"
- Web app sends user inputs (button clicks, menu selections) into the 3D world
- Unreal sends the player's current location back out to the web interface

### Initiatives
- [ ] Choose the bridge technology:
  - **WebSocket** (recommended) — real-time, two-way, lightweight
  - **REST API** — simpler but one-directional per call
  - **Pixel Streaming Data Channel** — built into Pixel Streaming, easiest if using that approach
- [ ] Build the **send channel**: web app → Unreal Engine
  - Example: clicking "Go to Hunting Park" on the website triggers the camera to fly there in Unreal
- [ ] Build the **receive channel**: Unreal Engine → web app
  - Example: as the player moves through the map, the website sidebar updates with the current neighborhood name and data
- [ ] Test both directions with real interactions from the 7 map stops
- [ ] Document the message format so future developers can extend it

### Reference
Your notes mention: *"Like Unity, our Unreal Engine might use 2 bridges — one to send and one to receive, both connected."*
This is exactly the WebSocket pattern — one socket handles both directions, or two separate channels can be set up for clarity.

### Blockers to Resolve First
- Milestone 6 must be complete (web frontend must exist to connect to)
- Bridge technology choice determines what code gets written

### Success Check
- Clicking a neighborhood name on the website moves the camera in Unreal
- Walking to a location in Unreal updates the story panel on the website
- No lag or disconnect issues during a 10-minute session

---

## Milestone 8 — Community Testing & Feedback
**Goal:** Real community members from Nicetown and Hunting Park have used the experience and given feedback.

### Initiatives
- [ ] Identify 5–10 community testers:
  - Residents of Nicetown or Hunting Park
  - Members of Philly Thrive, Furtick Farms, or Philadelphia More Beautiful Committee
  - AQO team members and volunteers
- [ ] Run a **structured test session** — give testers specific tasks:
  - "Find out what happened at the PES Refinery"
  - "See the asthma rate for your ZIP code"
  - "Watch the community testimony at Hunting Park"
- [ ] Record what confuses people, what they click first, what they miss entirely
- [ ] Review all story content with community partners for accuracy and tone
- [ ] Make a prioritized list of changes based on feedback

### Questions to Answer During Testing
- Is the navigation intuitive for someone who does not play video games?
- Does the data feel accurate and not exploitative?
- Are the community stories told in the community's own voice?
- Does the experience feel empowering or overwhelming?
- Is it accessible on the devices community members actually own?

### Blockers to Resolve First
- Milestones 1–7 must produce a working, accessible experience before testing
- Community partners must be briefed on the project before being asked to test

### Success Check
- At least 5 community members complete a full session
- Feedback is documented and prioritized
- Content has been reviewed and approved by AQO and community partners

---

## Milestone 9 — Public Launch
**Goal:** The AQO Interactive Map is live, accessible to the public, and actively used in the community.

### Initiatives
- [ ] Apply all feedback from Milestone 8
- [ ] Final content review with Eboni Zamani and AQO team
- [ ] Set up a permanent domain and hosting for the web experience
- [ ] Ensure Pixel Streaming server can handle multiple simultaneous users
- [ ] Create a **launch event** — a community gathering in Nicetown or Hunting Park where the map is shown publicly for the first time
- [ ] Prepare materials for educators, organizers, and press:
  - One-page project summary
  - How to use the map (simple guide)
  - Links to community organizations featured in the experience
- [ ] Submit the project to environmental justice networks, digital storytelling organizations, and Philadelphia media

### Blockers to Resolve First
- All prior milestones complete and stable
- Community sign-off on all content
- Hosting budget confirmed and server tested under load

### Success Check
- The experience is live at a public URL
- Community members can access it from their own devices
- The launch is documented and shared with AQO's network

---

## Summary Table

| # | Milestone | Key Deliverable | Depends On |
|---|---|---|---|
| 1 | Environment Setup | Unreal + Cesium installed, API keys in hand | Nothing |
| 2 | Load Philadelphia | Nicetown visible in 3D in Unreal Engine | Milestone 1 |
| 3 | First RealityScan | One scanned real location in the map | Milestone 2 |
| 4 | Player Navigation | Users can fly to all 7 stops | Milestones 1–2 |
| 5 | Stories & Data | Popups, video, and data at all 7 stops | Milestone 4 |
| 6 | Web Frontend | Accessible in a browser, no download | Milestone 5 |
| 7 | The Bridge | Web and Unreal communicate in real time | Milestone 6 |
| 8 | Community Testing | Real feedback from Nicetown residents | Milestone 7 |
| 9 | Public Launch | Live, public, stable | Milestone 8 |

---

## Do These Three Things This Week

1. **Install Unreal Engine 5** — start the download today, it takes time
2. **Get your Google Maps API key** — takes 15 minutes, requires a credit card
3. **Write the scripts for the 7 map stops** — no software needed, just a document

These three actions cost nothing and unblock everything else.

---

*Document created: 2026-03-29*
*Project: Air Quality Orange (AQO) Interactive Map*
*Founder: Eboni Zamani*
*Companion document: AQO_Interactive_Map_Technical_Guide.md*
