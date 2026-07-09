# Milarex · Digital Architecture

Interactive 3D presentation showing the Milarex digital architecture as a journey:
cosmos → sales offices and customers → the factory in Poland → internal systems →
hybrid architecture → KPIs → governance → decision simulation → 2026–2030 roadmap.

Board-level, dark mode, Milarex branding (navy / sea / gold / green).
One continuous 3D scene + a 2D layer, driven by 11 chapters.

## Stack

- **Vite + React 18 + TypeScript**
- **react-three-fiber + drei** (3D)
- **drei CameraControls** — cinematic camera transitions
- **@react-three/postprocessing** — subtle bloom + vignette
- **Zustand** — single source of truth (chapters, mode, modals, scenario)
- **Framer Motion** — 2D layer animations
- **Tailwind CSS** — brand tokens

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production
npm run preview
```

## Controls

- **→ / Space** — next chapter · **←** — previous
- **Esc** — close modals (factory config, app preview, system panel)
- Click the progress dots (bottom) or a system in the factory scene / in the list
- The **strategic / technical** toggle (top right) reveals integrations and details

## What's "the wow"

The centerpiece is a **strategic data globe**: a dark brand-colored sphere with a
geographic grid, an atmospheric glow (fresnel shader), and stars. Locations glow
and pulse, and data flows travel along **great-circle arcs** with flowing pulses.
On every chapter the camera performs a **cinematic move** (CameraControls), and
the whole scene is tied together with a subtle **bloom**.

## Code architecture

```
src/
  data/        the data model = the single source of truth
    chapters.ts      11 chapters: camera, visible points, flows, scene, modal
    locations.ts     factory + offices + customers (lat/lng)
    systems.ts       ERP/PTS/PID/MiFo/WMS/QMS/APS/Data/AI
    dataFlows.ts     customer → office → factory flows
    kpis.ts          10 KPIs with drivers (system → KPI)
    scenarios.ts     investment scenarios + KPI deltas + roadmap
    brand.ts         palette and globe radius
    types.ts
  lib/geo.ts         lat/lng → Vector3, great-circle arcs
  store/useStore.ts  Zustand (index, mode, modal, scenario)
  three/
    Experience.tsx   Canvas + lighting + postprocessing + WebGL fallback
    CameraRig.tsx     per-chapter camera transitions
    scenes/          GlobeScene, FactoryScene
    objects/         Earth, Atmosphere, LocationMarker, DataFlowArc, PulsingDataDot
  ui/
    AppShell.tsx     composition + keyboard navigation + scene routing
    Overlay, SystemModal, ArchitectureLayers, KPIBoard,
    GovernanceCard, ScenarioPanel, RoadmapTimeline, ...
```

## How to extend it

- **Content** — edit files in `src/data/`. Adding a system = an entry in `systems.ts`
  (+ optionally in `chapters.ts` / the `FactoryScene` zone map).
- **New chapter** — add an object to `chapters.ts` (camera + scene + what's active).
- **New 3D scene** — add a component in `three/scenes/` and wire it into `SceneSwitch`.
- **Simulation** — `scenarios.ts → kpiDeltas` drives the projection in `KPIBoard`.

## App screenshots (modals)

Clicking a system card (factory scene, architecture layers, or a button in the side
panel) opens a **fullscreen modal**: a large screenshot + "what it does",
responsibilities, KPIs, and integrations (navigation between apps inside the modal).

Screenshots live in `public/screens/{system_id}.png` — currently **branded mockups**.
Swap them 1:1 for real screenshots (same file name, ~1366×830 recommended):

```
public/screens/
  mifo.png             workday_erp.png   pts.png    pid.png    wms.png
  qms_lims.png         aps.png           data_platform.png    gone_ai.png
```

Regenerating continent dots: `npm run gen:land`.

## Status / what's left to polish

- Globe (with continents), arcs, camera, postprocessing, store, and navigation — **done**.
- Factory scene: **isometric buildings** matching the real plant layout — a
  standalone Office/Lab building plus a processing hall with Receiving,
  Filleting, Slicing D, Slicing S, MAP, and Freezing, ending at Output — with
  a material flow line and clickable system cards. Use **Configure** (cogs, top
  right on the factory slide) to map each system to one or more zones; mappings
  persist in `localStorage`.
- Scenes 6–10 (architecture, KPI, governance, simulation, roadmap) are polished
  2D panels over a dimmed globe — they can be moved into 3D if needed.
- Globe camera positions were computed from the location normals; worth fine-tuning
  on the target presentation screen (16:9).
