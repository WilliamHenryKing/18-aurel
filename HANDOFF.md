# Current release — 3 October 2026

**Complete, public and live:** [AUREL](https://18-aurel.williamking.workers.dev) · [source](https://github.com/WilliamHenryKing/18-aurel). All 71 local browser checks and 24 live asset hashes passed; desktop and phone live checks were clean. Exact application commit, Cloudflare version, limits and maintenance commands are in [docs/RELEASE.md](docs/RELEASE.md). Documentation commits after this release do not change its application identity.

## Earlier implementation handoff (historical)

# AUREL handoff — 3 October 2026

## Implemented

- Complete React/Vite portfolio with home, filtered work index, four detail views, studio/process, local enquiry brief and unknown-route view.
- Original ImageGen hero, stair and joinery artwork; one licensed Unsplash bedroom reference; local OFL serif, italic and sans fonts.
- GSAP scoped entrances, reveals and hero scroll treatment; native scrolling, reduced-motion default and saved motion toggle.
- Independent direct Three.js pavilion with hour/material/view interaction, PMREM material lighting, one shadow light, instanced screen, capped DPR, offscreen/hidden pause, on-demand frame scheduling, fallback and disposal.
- Responsive layout rules through desktop, tablet, phone and 320px; useful native buttons, visible focus, mobile menu, skip-to-content and download status.
- Project-local package lock, source, runtime assets, design guide and provenance record.

## Checks completed by implementation agent

`bun install` completed locally. `bun run typecheck` passed. `bun run format` passed with zero findings after accessibility fixes. Source photography and font files were inspected and licence/source URLs verified. The latest original joinery image has been wired after the first passing check and is pending the root's next rebuild.

Root reported the full initial `bun run check` passed. Root owns build/browser/visual QA in the shared sequential resource queue; the implementation agent did not start a server, browser, GPU render or production build. Browser results and screenshots are not inferred from source checks. Add root's final evidence here or link its verification document before claiming release completion.

## Browser review targets

1. Home at desktop, tablet, phone and 320px: hero crop/title, no horizontal overflow, all local images and fonts loaded, readable header and footer.
2. Every hash route and native history; mobile menu opens/closes/Escape; visible keyboard focus.
3. Work discipline filters update visible studies and announce the count.
4. Light pavilion: daylight/dusk and limestone/basalt visibly differ; left/right views stop at five angles. Inspect `window.__AUREL_DIAGNOSTICS__` for real render counts and settled/offscreen/hidden frame behaviour. Check a forced no-WebGL scenario and route-away disposal.
5. Reduced motion and footer motion control: no entrance/parallax when off; switching material/hour still updates to a stable frame.
6. Enquiry brief download includes the selected space, atmosphere and notes. No send/network/personal-data flow is present.
7. Console, failed requests, accessibility scan and actual visual review. Screenshots are sampled observations, not continuous-viewing or broad-device certification.

## Authority and release

The user explicitly authorised public GitHub and Cloudflare publication matching the prior collection. Root manages credentials, remote creation, deployment and live verification. No external messaging or Upwork edits are included. Project deployment config is `wrangler.jsonc`; public origin and commit/release evidence must be filled in after actual successful publication.

## Editing map

- `src/content.ts`: studies and process content.
- `src/App.tsx`: page composition, hash navigation, motion orchestration and local brief download.
- `src/LightStudy.tsx`: original scene, material/hour/view state, rendering lifecycle and diagnostics.
- `src/styles.css`: independent visual system and breakpoints.
- `ASSETS.md`, `public/fonts/OFL-*.txt`, `public/images/LICENSE-Unsplash.txt`, `tools/asset-manifest.json`: provenance.

The collection root is not a Git repository. Keep this checkout attached to its independent `.repositories/18-aurel` anchor. Do not import runtime code/assets or node_modules from adjacent projects.
