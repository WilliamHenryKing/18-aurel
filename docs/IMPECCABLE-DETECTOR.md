# Mechanical detector — 3 October 2026

One manual scan ran after the refined UI and world gallery were implemented. Context had reported no active automatic hook in this session. The exact output is retained in `impeccable-detect.json`; the detector was not repeatedly rerun.

Two warnings identify thick side borders on `.fallback-pavilion`. These draw the side walls of the existing geometric WebGL fallback, not an accent border on a card or list. This narrow, functional exception is retained without suppressing the rule globally. No emoji or glyph substitutes were added.

## Second pass — 4 October 2026

The camera, scrolling and accessibility corrections changed `src/LightStudy.tsx`, `src/App.tsx` and `src/styles.css`, which justified one more manual scan. Impeccable `context` reported `SCOPED_EXISTING_ALLOWED`. `impeccable detect --json src` returned the same two `side-tab` warnings on `.fallback-pavilion` and nothing else; `impeccable-detect.json` now holds this output. The functional exception above still applies.

The scan is mechanical evidence only. It does not certify visual quality, responsive behavior, keyboard access or acceptance; those need the separate browser receipts.

## Third pass — 5 October 2026

The release review changed `src/App.tsx` (the gallery caption reveal). One more manual scan of the released source returned the same two `side-tab` warnings on `.fallback-pavilion` (`styles.css` lines 715–716) and nothing else; `impeccable-detect.json` now holds this output. The functional exception above still applies.
