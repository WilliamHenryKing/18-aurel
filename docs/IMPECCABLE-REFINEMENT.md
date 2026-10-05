# AUREL refinement — 3 October 2026

## Scope and identity

This is an Experience refinement of the existing AUREL site. Root ran Impeccable context for the project and reported `SCOPED_EXISTING_ALLOWED`; DESIGN.md remains the incumbent authority. No init/context command was repeated, no new product brief was invented, and no other project's files were changed during this refinement.

The retained identity is nocturnal architecture: ink, ivory and aged brass, local Cormorant Garamond and Manrope, a large residence photograph at dusk, uneven editorial project proportions, and an interactive architectural section. The large hero and invitation typography are deliberate exceptions to the generic 6rem display ceiling. They are not an exception to readable body copy, useful controls or the -0.04em tracking floor.

## Reading completed

Read the complete installed `.agents/skills/impeccable/SKILL.md` and all 24 command references in bounded chunks: craft, shape, init, document, extract, audit, polish, bolder, quieter, distill, harden, onboard, animate, colorize, typeset, layout, delight, overdrive, clarify, adapt, optimize, critique, live and generate. Truncated reads of document and clarify were repeated in full. Craft-floor was read immediately before implementation. Reading these references did not invoke their workflows or duplicate the root's context decision.

For the subsequent cinematic-camera request, the six installed official GSAP skills for core, timeline, ScrollTrigger, plugins, React and performance were read in full. Root has verified seven official MIT-licensed skills in both the workspace and global skill installations, including utils. Their source is [greensock/gsap-skills](https://github.com/greensock/gsap-skills/tree/aed9cfd3277740755f6bfc1155c7aa645403b760), pinned to `aed9cfd3277740755f6bfc1155c7aa645403b760`. These are development references; the site uses its existing pinned GSAP runtime and the included ScrollTrigger and ScrollToPlugin modules. No new paid plugin or third-party runtime service is represented.

## Before and after

- Existing `output/playwright/live-desktop.png`, `live-phone.png`, `material-section.png` and `scene-desktop.png` were inspected as prior capture evidence. They are not fresh captures of this revision.
- The photographic hero and serif identity were strong. The supporting type was too small, many headings carried decorative labels, and icon glyphs varied by platform. Headings now carry their own hierarchy, copy uses 16px prose/14px metadata, and controls use a consistent original stroke SVG family with 44px targets.
- The material section previously split a small photograph from its copy and decorative swatches. It now gives a dominant 16:10 gallery to the complete room and its fluted walnut, travertine and bronze detail. The space / The detail buttons are native controls with selected states. A two-column introduction sits above, with the caption and controls below. The image reaches the edges on phones. Final local render delivery remains pending.
- Repeated section rises and hero parallax diluted the pacing. The refinement retained a restrained hero image settle and one material aperture. The later user instruction adds a sustained, purposeful camera passage to the pavilion rather than spreading entrances across the page. Other editorial sections remain visible and still. Reduced motion and the persistent motion toggle skip choreography and image/icon translation, while controls retain immediate feedback.
- The pavilion's lazy import was mounted with the homepage. It now waits for an IntersectionObserver boundary 400px before its reserved container. Direct `#/light` bypasses the boundary, preserving navigation and the existing renderer lifecycle.

## Implemented camera passage

`src/lightJourney.ts` supplies the chapter copy, five camera points, five look-target points and the narrow-screen pullback values. The paired Three.js Catmull–Rom curves take the actual perspective camera from Threshold towards Timber screen, then laterally to Water. The path remains in front of the open section. This is a realtime section study; it does not claim to reproduce the separate offline rendered interior.

`src/LightStudy.tsx` owns the labelled timeline and ScrollTrigger with a 0.55-second scrub, a brief timber-screen hold and a final water hold. One CSS sticky stage provides 115svh of travel, reduced to 88svh at widths up to 700px. No ScrollTrigger pin or wheel interception is used. Chapter captions, selected chapter buttons and a fine progress line identify the subject. ScrollToPlugin moves to a named chapter or skips to Material controls; the skip then focuses the first lighting button.

Pause camera holds the automatic path. Selecting daylight/dusk, limestone/basalt or a perspective button gives the visitor ownership; further scrolling cannot change the camera progress until Resume scroll or a chapter jump. A small pointer elevation response is enabled only after a perspective button is used. The persistent site motion toggle and operating-system reduced motion remove the scroll runway and retain immediate named compositions. Viewports below 600px tall also use the compact view selector. `useGSAP`, `matchMedia` and context-safe callbacks own timeline, trigger and programmatic-scroll cleanup. Rendering still settles to idle, pauses offscreen or while the document is hidden, and disposes GPU resources on unmount. A lost context cannot restart the rendering loop through later visibility changes.

The existing `window.__AUREL_DIAGNOSTICS__` retains actual renderer counters and adds `cameraOwner`, `journeyProgress`, `scrollProgress`, `chapter`, camera/target XYZ arrays, `journeyEnabled`, `scrollStart`, `scrollEnd`, `scrollTriggerActive` and `renderPending`. Review can locate `.study-journey`, `.study-stage`, the `Pavilion camera views` fieldset, `#aurel-light-caption`, and `.study-controls`. These are inspection surfaces, not completed interaction or performance evidence.

## Asset contract

The gallery is wired to `/images/aurel-world.webp` and `/images/aurel-world-mobile.webp` for the complete room, and `/images/aurel-timber-study.webp` and `/images/aurel-timber-study-mobile.webp` for the joinery detail. Final local CUDA renders are queued for delivery. The target master frame is 3200×2000, and the gallery uses a 16:10 composition; the delivered WebP dimensions and hashes must come from the completed asset manifest. The root owns render provenance, optimisation, asset delivery and final image inspection. No remote runtime image dependency was added. [RENDERING.md](RENDERING.md) will accompany the generated source and metadata package; it is pending at this checkpoint.

The existing pavilion remains the interactive medium, with its authored section geometry and hour/surface/perspective controls. This camera pass changes its navigation and lifecycle coordination while keeping the renderer budget and model. The still gallery is a separate architectural world, with its own source and rendering provenance.

## Verification boundary

The earlier editorial refinement passed `bun run typecheck` and `bunx biome check --write src`. The subsequent camera implementation passed `bun run typecheck` and scoped `bunx biome check src/LightStudy.tsx src/lightJourney.ts src/styles.css`. This documentation-only update runs no new tests. No production build, browser, GPU job, commit or deployment was performed by this agent for the camera pass. The first-release verification report and screenshots keep their historical scope and must not be treated as evidence for the pending integrated revision.

Root owns the sequential final build and browser review after the rendered assets arrive. Check the 320px, phone, tablet, desktop and landscape layouts; photograph loading; readable caption contrast; menu and SVG control targets; filter/detail/studio/enquiry journeys; motion toggle and operating-system reduced motion; direct `#/light`; and that the scene/Three.js chunk is absent on initial homepage load, requested near the pavilion, paused offscreen, and disposed after leaving the route. Review all three camera compositions, native-scroll progress, chapter jumps, pause/resume, manual-control ownership, skip focus and the compact short-viewport presentation. Confirm the material reveal is smooth and never leaves an image obscured.

One manual Impeccable detector run already occurred after the refined UI and world gallery were implemented. Its exact output is saved in `impeccable-detect.json`, with adjudication in [IMPECCABLE-DETECTOR.md](IMPECCABLE-DETECTOR.md). Two side-border warnings concern the geometric WebGL fallback's walls, not card accents, and were retained as a narrow functional exception. The manual detector was not rerun for the later camera work or this documentation update.

The user subsequently authorised Impeccable hooks. That permission permits their normal use; it does not establish that an automatic hook actually executed, and none is claimed here. The existing manual scan is mechanical evidence for its recorded revision only. Final render delivery, integrated browser verification, live-release verification and user acceptance remain distinct pending outcomes.

## Resumed refinement — 4 October 2026

A fresh root agent resumed this work from the cold handover. Read-only reviews of the source and the official GSAP guidance were confirmed or rejected in a running page (Chrome with software WebGL, so the busy GPU was not used). A claimed TypeScript break was not real; `bun run typecheck` passed. The following defects were real and are corrected:

- **Chapter jumps stopped short.** With `html { scroll-behavior: smooth }`, ScrollToPlugin's auto-kill read the browser's lagging smooth steps as a visitor's scroll: "Water" stopped at 41% of its path and "Threshold" did not move. The CSS rule is removed; GSAP owns programmatic smoothing. Afterwards both jumps landed on their labels.
- **Context reverts could move the page.** Chapter and skip tweens were created through `contextSafe`, so a motion change re-rendered them at their start. They now live outside the context and are killed on unmount; revert-time renders of the scroll timeline are ignored.
- **Large and short screens.** On 1080p screens the 820px stage left a dead band; the cap is now 980px. Wide canvases narrow the vertical field of view above a 2.1 aspect so the pavilion keeps its scale. Short desktop screens use lighter stage chrome.
- **Accessibility and resilience.** Material controls receive focus even if the scroll is interrupted. The perspective arrows use `aria-disabled` at their limits so focus is not dropped. Chapter jumps are announced politely. Pause/Resume uses its changing label without a contradictory `aria-pressed`. The footer motion switch keeps one accessible name with `aria-pressed`. Explanatory notes meet the 16px prose floor. A failed late chunk shows the placeholder, and a restored WebGL context rebuilds its reflection map.

Interim probes recorded exact chapter landings, skip focus, compositions at 1920×1080, 1440×900, 1366×657 and 390×844, and no page or console errors. They predate the final renders and build; they are not release QA. The detector second pass is recorded in [IMPECCABLE-DETECTOR.md](IMPECCABLE-DETECTOR.md).

## Final renders and release review — 5 October 2026

The final 3200 × 2000 CUDA masters are delivered to the render gallery as responsive WebPs (`aurel-world`, `aurel-timber-study`); the packed source, reconstruction tools and render evidence are described in [RENDERING.md](RENDERING.md). Release QA ran against the final production build in installed Chrome on the GPU, and the sampled gallery and camera screenshots were reviewed at 1440 and 390px.

- **The gallery caption waited at 35% opacity.** The material sequence faded the caption and its two view buttons up from 35% once the visitor reached the gallery, so until then they measured 2.83:1 in axe while remaining focusable. The caption now rises into place instead, holding full contrast in every state.
- **Harness timing, not product behaviour.** The root refinement harness measured the direct light route, and gallery focus after a route change, before the route's deferred scroll and focus hand-off had run (about 30ms after render). In a running page the route always settled on the study. The harness now waits, bounded, for the settled state; its assertions are unchanged.

Final receipts: 73 browser, 52 refinement and 33 camera checks against the build recorded in [RELEASE.md](RELEASE.md). The third detector pass is in [IMPECCABLE-DETECTOR.md](IMPECCABLE-DETECTOR.md).
