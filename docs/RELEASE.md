# AUREL — public release, 3 October 2026

Published to public GitHub and Cloudflare Workers, matching the existing collection's hosting. William explicitly authorized both. The other seventeen projects were preserved.

- Live site: https://18-aurel.williamking.workers.dev
- Public source: https://github.com/WilliamHenryKing/18-aurel (`main`)
- Application source commit: `53ca7560e4b9d94c66efe3f3cf6b055e8ddf06b5`
- Cloudflare version: `99201c85-d965-4178-a2e5-68392f7978dc`
- Build timestamp: `2026-10-03T15:11:02.493Z`
- Live verification timestamp: `2026-10-03T15:13:00.653Z`

The public GitHub `main` initially matched the application source above. Subsequent documentation-only commits save these receipts and media; the deployed application remains the recorded source commit. `/release.json` exposes the build identity.

Production typecheck, Biome and Vite build passed. The complete local Chrome journey passed 71 checks, with no browser/network errors or detected axe violations in the tested states. Reduced motion, no-WebGL fallback, gallery/detail routes, menus, material/daylight controls and local brief downloads were exercised. See [VERIFICATION.md](VERIFICATION.md) and its JSON receipts.

Live verification matched SHA-256 bytes for all 24 deployable public files checked (HTML, JS, CSS, images, fonts, licenses and release metadata). Platform `_headers` rules and hidden Vite manifests are not public asset checks. Unknown document paths returned HTTP 404. Live Chrome desktop 1440 × 900 and phone 390 × 844 showed no horizontal overflow or page errors. Screenshots were captured, not continuous recorded viewing. See [live-report.json](live-report.json).

## Maintain and redeploy

Edit project-local source/content and assets, run `bun run check` and the browser journey, review the result, then commit source before building the release. Run `bun run build`, `bunx --no-install wrangler deploy`, and `bun run verify:release -- https://18-aurel.williamking.workers.dev`. Record the new source commit and Cloudflare version here. Wrangler uses the existing signed-in account; no credentials are stored in this repository. Build and browser work is scheduled sequentially on this machine.

## Scope and limits

These brands and architectural projects are fictional portfolio concepts. Imagery provenance is in ASSETS.md. Briefs download locally; no email delivery, CMS/admin service or real client commission is implied. Responsive browser emulation is not physical-device testing. Scene counts and sampled paint times are not a frame-rate or Core Web Vitals certification. Visual self-review is complete; user/client acceptance remains unclaimed.
