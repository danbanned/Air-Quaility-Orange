# AQO Interactive Map — Technical Documentation
**Air Quality Orange (AQO) | Philadelphia Environmental Justice Project**
**Founded by Eboni Zamani**

---

## Table of Contents
1. [What Is the AQO Interactive Map?](#1-what-is-the-aqo-interactive-map)
2. [The Three Core Tools — How They Work Together](#2-the-three-core-tools--how-they-work-together)
3. [Clarification: "Nauo" / Naming Note](#3-clarification-nauo--naming-note)
4. [Project Files — What Each One Does](#4-project-files--what-each-one-does)
5. [How the Files Connect to Each Other](#5-how-the-files-connect-to-each-other)
6. [Cesium vs. Other Coding Languages & Tools](#6-cesium-vs-other-coding-languages--tools)
7. [Milestone Plan (Coming Next)](#7-milestone-plan-coming-next)

---

## 1. What Is the AQO Interactive Map?

The AQO Interactive Map is a **real-world, geospatial, interactive experience** built inside Unreal Engine. It allows users to:

- Walk through a digital recreation of Nicetown, Hunting Park, and Eastwick in Philadelphia
- See real air quality data layered over the real-world geography
- Interact with community stories, health data, and environmental history
- Visualize what a cleaner Philadelphia could look like

Think of it as **Google Earth meets a documentary meets a video game** — but built specifically to tell the story of environmental racism and community power in Philadelphia.

---

## 2. The Three Core Tools — How They Work Together

```
RealityScan → Cesium → Unreal Engine → AQO Interactive Map
```

Each tool plays a specific role. Here is how they connect:

---

### Cesium for Unreal
**Role: The Earth Layer**

Cesium is a **geospatial platform** that brings real-world planet data into Unreal Engine. It is not a programming language — it is a plugin and a data service.

What Cesium provides:
- Photorealistic 3D tiles of the entire planet (from Google Maps or Cesium Ion)
- Real terrain elevation — hills, valleys, rivers
- Real building geometry of Philadelphia
- A coordinate system tied to actual latitude/longitude on Earth
- Streaming — it only loads what the camera can see, so performance stays fast

In the AQO project, Cesium is what makes the map **real**. When you set the Dynamic Pawn coordinates to:
```
Latitude:  40.01999
Longitude: -75.15540
```
You are literally placing the camera at Nicetown Park in Philadelphia. The buildings, streets, and terrain around it are loaded from satellite and map data in real time.

**Cesium is the foundation that everything else is placed on top of.**

---

### RealityScan (and Reality Capture)
**Role: The Scanner — Bringing Real Objects Into the Digital World**

RealityScan is an app (by Epic Games, the same company that makes Unreal Engine) that uses **photogrammetry** — you take dozens of photos of a real object or location from different angles, and the software stitches them into a detailed 3D mesh.

What RealityScan provides for AQO:
- Scanned 3D models of real locations in Nicetown/Hunting Park (community gardens, murals, storefronts, street corners)
- Real textures and geometry captured from the actual neighborhood
- Models that can be exported and placed directly into Unreal Engine on top of the Cesium map

**Workflow example:**
1. A community member or volunteer walks through Hunting Park with a phone or camera
2. They scan the SEPTA bus depot, a block of rowhouses, or a community garden using RealityScan
3. The scan gets processed into a 3D model (`.glb`, `.obj`, or `.fbx` file)
4. That model gets imported into Unreal Engine and placed at the correct GPS coordinates via Cesium

RealityScan answers: **"What does this specific real place actually look like?"**

---

### Unreal Engine 5
**Role: The Engine — Where Everything Comes Together**

Unreal Engine is a **real-time 3D rendering and game engine**. It is the software where you build the actual interactive experience. Everything else feeds into it.

What Unreal Engine does for AQO:
- Renders the Cesium globe and photorealistic tiles
- Hosts and displays the RealityScan 3D models placed at real coordinates
- Powers player movement (the Dynamic Pawn — the camera you fly or walk with)
- Handles interactions: clicking on a building to read its pollution history, watching a video play on a wall, triggering a story popup
- Plays video files (community testimonials, documentary clips)
- Manages UI overlays — air quality data visualizations, legend panels, neighborhood labels
- Connects the "bridge" between the web app frontend (Replit/Base44) and the 3D world

**Blueprint** is Unreal Engine's visual scripting system — it lets you write logic (like "when the player walks near this marker, show this popup") without writing raw code. It is similar to a flowchart where each box is an action or condition.

---

### How All Three Work Together — Full Picture

```
REAL WORLD
    ↓
RealityScan captures a real Philadelphia location as a 3D model
    ↓
The 3D model is exported and cleaned up
    ↓
Unreal Engine imports the model
    ↓
Cesium provides the real Philadelphia terrain and map tiles as the base
    ↓
The 3D model is placed at its exact real GPS coordinates on the Cesium globe
    ↓
Unreal Engine adds interaction: click, walk, play video, read data
    ↓
User opens the AQO web app or experience
    ↓
They are inside a real, interactive, story-driven version of Nicetown
```

---

## 3. Clarification: "Nauo" / Naming Note

In your notes you referenced **"naqo"** — this may be:
- A shorthand name for the **AQO project itself** internally
- A reference to **Nauo** or another photogrammetry/capture tool not yet specified
- A typo or autocorrect of another tool (Reality Capture, Polycam, Luma AI, etc.)

**Luma AI** (mentioned in your resources) is another option that works similarly to RealityScan — it uses **NeRF (Neural Radiance Field)** technology to reconstruct 3D scenes from video. It has a plugin for Unreal Engine 5.1.

If "naqo" refers to a specific tool, clarify and this doc will be updated. For now, RealityScan and Luma AI are both documented as the capture/scan layer.

---

## 4. Project Files — What Each One Does

### `Prototype-AQO-replit`
**What it is:** An early web-based prototype of the AQO experience, built on Replit.

**What it does:**
- Serves as the public-facing entry point — the website or web app users visit
- Likely contains the UI layer: navigation menus, intro screens, data panels, neighborhood selector
- May include a map viewer (possibly using CesiumJS, the web version of Cesium)
- Handles the user's browser experience before or alongside the Unreal Engine component

**Connection to the goal:**
This is the "front door" of the interactive map. A user visits this URL, sees the AQO interface, and either views data directly in the browser or is launched into the Unreal Engine experience.

**Connection to other files:**
- Sends/receives data to/from the Unreal Engine build via the "bridge" (API or WebSocket)
- Shares visual design language with Base44
- References the same coordinate data (Nicetown lat/long) as the Cesium setup

---

### `Prototype-AQO-Base44`
**What it is:** A second prototype, likely built on Base44 (a no-code/low-code app builder).

**What it does:**
- Provides an alternative or complementary UI layer
- May handle community story cards, data dashboards, or the "index" of environmental justice stories
- Could be the mobile-friendly version or the data backend that powers the storytelling layer

**Connection to the goal:**
This may serve as the **content management layer** — where community stories, health statistics, and neighborhood data are organized and displayed, separate from the 3D map itself.

**Connection to other files:**
- Works alongside the Replit prototype — one may handle 3D/map, the other handles stories/data
- Feeds structured content (stories, names, statistics) that get displayed as overlays inside Unreal Engine

---

### `AQO-(W)Cesium-Setup-Instructions`
**What it is:** The technical setup document for integrating Cesium into the Unreal Engine project.

**What it does:**
- Documents step-by-step how to install and configure the Cesium for Unreal plugin
- Contains the Google Maps API key setup instructions (Google Cloud Project, billing, restrictions)
- Defines the Dynamic Pawn coordinates for Nicetown Park
- Records which 3D tile sets are being used (Cesium World Terrain, Google Photorealistic 3D Tiles)

**Connection to the goal:**
This is the **technical foundation document** — without this setup, the 3D map of Philadelphia cannot load. It is the first thing a developer does when opening the Unreal Engine project.

**Connection to other files:**
- Directly configures the Unreal Engine project that hosts the RealityScan models
- The API key it references allows the photorealistic tiles that make the Replit prototype's map look real
- Sets up the coordinate origin that all scanned models are placed relative to

---

### The Unreal Engine Project (`.uproject` file)
**What it is:** The core Unreal Engine project file — the "main" file that opens the entire 3D world.

**What it does:**
- Contains all Blueprints (the visual logic scripts for player movement, popups, video playback)
- Imports and positions the RealityScan 3D models at Cesium coordinates
- Runs the Cesium plugin that streams Philadelphia's terrain and buildings
- Manages the in-world UI: data overlays, neighborhood markers, story triggers
- Contains the "bridge" — the connection between this 3D world and the web frontend (Replit/Base44)

**Connection to the goal:**
This is the **core of the interactive map**. Everything else supports this file.

---

### The "Bridge" (Communication Layer)
**What it is:** Not a single file, but a communication system — referenced in your notes as two-way (send and receive).

**What it does:**
- Sends data from the web app (Replit/Base44) into Unreal Engine — e.g., "user selected Hunting Park, zoom there"
- Receives data from Unreal Engine back to the web app — e.g., "user is now standing at this GPS coordinate"
- Similar to how Unity uses a bridge to communicate with web or mobile app layers

**Technology options:**
- WebSocket connection
- REST API calls
- Unreal Engine's Pixel Streaming (streams the Unreal Engine scene as a video to the browser, with inputs sent back)

---

## 5. How the Files Connect to Each Other

```
User (Browser)
     ↓
Prototype-AQO-replit  ←→  Prototype-AQO-Base44
(Web UI / Map View)        (Stories / Data / Content)
     ↓ ↑
  [BRIDGE — WebSocket / Pixel Streaming / API]
     ↓ ↑
Unreal Engine Project (.uproject)
  ├── Cesium Plugin → Loads Philadelphia terrain + buildings
  ├── RealityScan Models → Real scanned locations placed at GPS coordinates
  ├── Blueprints → Player movement, interactions, video playback
  └── UI Overlays → Air quality data, neighborhood labels, story popups

All coordinate data anchored by:
AQO-(W)Cesium-Setup-Instructions
(Lat: 40.01999, Long: -75.15540 — Nicetown Park)
```

---

## 6. Cesium vs. Other Coding Languages & Tools

Cesium is not a programming language — it is a **platform and plugin**. But it relates to familiar tools in clear ways:

| Cesium Concept | Similar to... | Why |
|---|---|---|
| CesiumJS (web version) | Three.js, Leaflet, Mapbox GL | JavaScript-based 3D/map renderer running in a browser |
| Cesium for Unreal (plugin) | Unity's terrain system | Streams real-world data into a game engine |
| Cesium Ion (cloud data) | AWS S3 / CDN | Cloud-hosted 3D tile server you stream from |
| Tileset (3D Tiles format) | JSON / gLTF | A streaming format for geospatial 3D data |
| Blueprint (Unreal scripting) | Unity's Visual Scripting / Scratch | Node-based visual logic — no raw code needed |
| Blueprint (under the hood) | C++ | Blueprints compile down to C++ at runtime |
| Dynamic Pawn | A Camera Controller in Unity | The object that defines where the "player" is in the world |
| Photorealistic 3D Tiles | Google Street View in 3D | Satellite + photogrammetry data rendered as 3D geometry |

### CesiumJS Similarities to Web Languages
If you have used JavaScript before, CesiumJS will feel familiar:
```javascript
// CesiumJS — placing a point on the map at Nicetown Park
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(-75.15540, 40.01999),
  point: { pixelSize: 10, color: Cesium.Color.ORANGE }
});
```
This is the same pattern as placing a marker in Mapbox, Google Maps API, or Leaflet — just with full 3D terrain instead of a flat map.

### How Blueprint Compares to Code
Blueprint is Unreal's visual version of C++ or Unity's C#. Writing:
```
[On Begin Overlap] → [Play Sound] → [Show UI Widget]
```
...in Blueprint is the same as writing:
```csharp
// Unity C#
void OnTriggerEnter(Collider other) {
  audioSource.Play();
  uiPanel.SetActive(true);
}
```

You are writing the same logic — Blueprint just uses connected boxes instead of text.

---

## 7. Milestone Plan (Coming Next)

The full milestone-by-milestone development plan will be documented separately once the tool/technology foundation above is confirmed and understood.

The milestones will cover:
1. Environment setup (Unreal Engine, Cesium plugin, API keys)
2. Loading Philadelphia into Cesium
3. First RealityScan capture and import
4. Building the player experience (movement, navigation)
5. Adding community stories and data overlays
6. Web frontend (Replit/Base44) integration
7. Bridge / two-way communication
8. Community testing and feedback
9. Public launch

---

*Document created: 2026-03-27*
*Project: Air Quality Orange (AQO) Interactive Map*
*Founder: Eboni Zamani*
