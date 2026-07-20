---
name: Milarex Digital Strategy
description: A cinematic board-level command deck for the 2026–2030 digital roadmap.
colors:
  deep-water-ink: "#02060D"
  milarex-navy: "#00284D"
  navy-surface: "#021526"
  navy-raised: "#03203B"
  navigation-teal: "#2EC5C5"
  signal-green: "#34D399"
  signal-gold: "#D6BF91"
  mist: "#9DB4CC"
  paper: "#F2F7FC"
typography:
  display:
    fontFamily: "Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(2.5rem, 2rem + 2vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(1.625rem, 1.4rem + 0.9vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.55vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(0.8125rem, 0.75rem + 0.35vw, 1rem)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.34em"
rounded:
  control: "8px"
  panel: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  panel:
    backgroundColor: "{colors.navy-surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.navigation-teal}"
    textColor: "{colors.deep-water-ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "{colors.navy-raised}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
---

# Design System: Milarex Digital Strategy

## 1. Overview

**Creative North Star: "The Digital Command Deck"**

The presentation behaves like a command deck built for consequential decisions: a deep-water field, exact information layers, restrained signals, and deliberate moments of elevation. The three-dimensional world establishes scale while concise two-dimensional panels keep the board narrative readable.

The system is confident, precise, and cinematic. It must never resemble a generic AI dashboard or a template-generated presentation deck. Every visual layer should either orient the audience, reveal evidence, or clarify a decision.

**Key Characteristics:**
- Deep navy and near-black surfaces with scarce teal and gold signals.
- Editorial serif display type paired with utilitarian sans-serif body copy.
- Full-viewport compositions organized around one board-level message.
- Detail revealed through interaction rather than permanent visual clutter.
- Responsive sizing based on viewport-aware `clamp()` scales.

## 2. Colors

Deep Water & Signal Gold uses dark maritime depth as the field, teal for active navigation, and gold for strategic emphasis.

### Primary
- **Milarex Navy:** The identity color for substantial branded surfaces and architecture layers.
- **Navigation Teal:** The active-state signal for orientation, links, and interactive focus.

### Secondary
- **Signal Gold:** Reserved for slide numbers, decisions, and moments of strategic consequence.
- **Signal Green:** Operational success and healthy-state feedback only.

### Neutral
- **Deep Water Ink:** The default full-viewport background.
- **Navy Surface:** The standard panel layer above the background.
- **Navy Raised:** Interactive or selected surfaces.
- **Mist:** Supporting labels and secondary explanatory copy.
- **Paper:** Primary text, headings, and high-contrast marks.

### Named Rules

**The Signal Scarcity Rule.** Teal and gold are signals, not decoration; never spread either color evenly across a slide.

**The Deep Water Rule.** Major surfaces stay within the ink-to-navy range so diagrams, type, and 3D content remain the focus.

## 3. Typography

**Display Font:** Georgia (with Cambria and Times New Roman fallbacks)  
**Body Font:** Inter (with system UI and sans-serif fallbacks)

**Character:** The serif display face gives strategic statements authority; the sans-serif body face keeps dense architecture, initiative, and roadmap content operationally clear.

### Hierarchy
- **Display** (400, fluid 40–56px, 1.1): Hero statements and the primary message of a slide.
- **Headline** (400, fluid 26–32px, 1.25): Compact slide titles and major panel headings.
- **Title** (500–600, 18–24px, 1.3): Section headings inside diagrams and panels.
- **Body** (400, fluid 18–22px, 1.55): Explanations and board-level narrative, capped at readable line lengths.
- **Label** (500, fluid 13–16px, 0.34em tracking): Short navigational labels and slide eyebrows only.

### Named Rules

**The Authority Pairing Rule.** Serif carries strategic meaning; sans-serif carries evidence, metadata, and interaction.

**The Kicker Restraint Rule.** Widely tracked uppercase type is limited to short navigational labels and must never become body copy.

## 4. Elevation

The system is flat at rest and lifted on interaction. Depth comes first from tonal layering and scene composition; shadows appear only when a panel, initiative, menu, or modal is actively elevated.

### Shadow Vocabulary
- **Panel Lift** (`0 24px 80px -24px rgba(0,0,0,0.75)`): Modal surfaces and deliberately floating interactive panels.
- **Interactive Lift** (`0 8px 24px rgba(0,0,0,0.35)`): Hovered rows, selected nodes, and temporary focus states.

### Named Rules

**The State-Lift Rule.** A resting surface is tonal and flat; a shadow communicates interaction, selection, or modal priority.

## 5. Components

### Buttons
- **Shape:** Precise, gently curved controls (8px radius); pills are reserved for toggles and compact chips.
- **Primary:** Navigation teal on deep ink with compact 10px × 16px padding.
- **Hover / Focus:** Increase contrast and expose a clear teal focus ring; use fast opacity or transform transitions.
- **Secondary / Ghost:** Navy-raised surface with paper text and a subtle light border when separation is needed.

### Chips
- **Style:** Compact pill geometry, navy-raised background, mist text, and a quiet border.
- **State:** Selected chips use navigation teal or signal gold only when the selection has strategic meaning.

### Cards / Containers
- **Corner Style:** Controlled curvature (16px radius maximum).
- **Background:** Translucent navy surface over deep-water ink.
- **Shadow Strategy:** Flat at rest; use Panel Lift or Interactive Lift only in the states defined above.
- **Border:** Hairline white at low opacity for structure, never a colored side stripe.
- **Internal Padding:** 16–24px, reduced responsively when viewport height is constrained.

### Navigation
- **Style:** Minimal, viewport-fixed controls with paper text, mist supporting labels, and teal active states. The Milarex emblem reveals the slide menu; navigation must stay subordinate to slide content.

### Architecture Nodes

Application and process nodes use navy tonal layers, concise sans-serif labels, and direct hover-revealed connections. Persistent connector clutter is prohibited; selected relationships must attach cleanly to node borders and distribute across available ports.

## 6. Do's and Don'ts

### Do:
- **Do** keep the deep-water field dominant and reserve teal and gold for meaningful signals.
- **Do** use viewport-aware sizing so each slide remains legible at presentation resolutions.
- **Do** make interactions reveal relationships and detail without obscuring the board-level takeaway.
- **Do** provide reduced-motion behavior for every non-essential animation already present in the system.
- **Do** preserve the serif-for-strategy and sans-for-evidence hierarchy.

### Don't:
- **Don't** make the presentation resemble a generic AI dashboard or a template-generated presentation deck.
- **Don't** use gradient text, decorative glassmorphism, colored side stripes, or repeated identical card grids.
- **Don't** leave decorative connections, glows, or shadows visible when they communicate no state.
- **Don't** exceed a 16px radius on panels; large bubble-like cards undermine precision.
- **Don't** use gold and teal as interchangeable decoration; each must retain its signal role.
