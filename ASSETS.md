# AUREL assets and provenance

Recorded 3 October 2026. All runtime files are local to this project. No external image, font or analytics requests are made by the running website.

## Original architectural images

Created using the built-in OpenAI ImageGen tool for this commission on 3 October 2026. Root supplied locally optimised WebP versions. These depict fictional concepts and are not photographs of completed commissions.

| Files in `public/images/` | Subject | Use |
| --- | --- | --- |
| `aurel-hero.webp`, `aurel-hero-mobile.webp` | Warm-lit volcanic-stone residence, glazing, courtyard and reflecting pool at dusk | Main hero and Dune House study |
| `stair-hall.webp`, `stair-hall-small.webp`, `stair-hall-mobile.webp` | Travertine stair, bronze rail, smoked oak and slit skylight | Quiet Gallery study and studio |
| `joinery-detail.webp`, `joinery-detail-small.webp` | Walnut cabinet, bronze pull and vein-cut travertine in raking light | Walnut Room study and material editorial |

## Licensed photographic reference

`sanctuary.webp` and `sanctuary-small.webp` are a local WebP adaptation of **Modern bedroom with wooden accents and natural light**, by **Marcel Strauß** (`@martzzl`).

- Original photo page: https://unsplash.com/photos/modern-bedroom-with-wooden-accents-and-natural-light-CMHgRFDANH8
- Original CDN source verified from that official page: https://images.unsplash.com/photo-1765547090903-348b711f0eee
- Downloaded with `auto=format&fit=crop&w=1600&q=85&fm=webp` and `w=800` for the small copy.
- Photo page explicitly states free use under the Unsplash License. Page and licence checked live 3 October 2026: https://unsplash.com/license
- Saved licence notice: `public/images/LICENSE-Unsplash.txt`.
- The Inner Sanctuary study's visible image disclosure credits the photographer and explicitly says the existing space is not an AUREL design.

The licence allows downloading, adapting and using images including commercially, subject to its restrictions. The image is used as an illustrative mood reference, not offered for standalone resale. No endorsement, model/property release, architecture authorship or client relationship is claimed. Previously considered timber-atrium and kitchen reference images were rejected and removed from the project.

## Fonts

- **Cormorant Garamond**, copyright 2015 the Cormorant Project Authors. Official family: https://fonts.google.com/specimen/Cormorant+Garamond ; source project: https://github.com/CatharsisFonts/Cormorant . SIL OFL 1.1 notice downloaded from https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/OFL.txt and retained as `public/fonts/OFL-Cormorant-Garamond.txt`.
- Roman 400 and 500 came from the official Google Fonts CSS response to `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap`. Original 400 binary: `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf`; 500: `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_s06GnM.ttf`.
- Italic 400 came from the official CSS response to `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&display=swap`. Original italic binary: `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jDOjw.ttf`. Downloaded TTF files were converted to WOFF2 containers with FontTools; glyph designs were not modified. Local files are `cormorant-garamond-0.woff2`, `cormorant-garamond-1.woff2`, `cormorant-italic.woff2`.
- **Manrope**, copyright 2018 The Manrope Project Authors. Official family: https://fonts.google.com/specimen/Manrope ; source: https://github.com/googlefonts/manrope . SIL OFL 1.1. `manrope-latin.woff2` and its original `OFL-Manrope.txt` were copied as independent files from the collection's 17 SIGNAL checkout, not imported at runtime or symlinked. This exact file is 24,836 bytes. Hash recorded in the manifest.

## Original code-native artwork

The AUREL wordmark treatment, favicon, CSS material swatches and pavilion fallback are original code-native artwork. The Three.js pavilion geometry, seeded procedural stone texture, material arrangement and lighting are authored for this project. The PMREM environment is generated at runtime from Three.js's MIT-licensed `RoomEnvironment` helper; no HDR or external model assets are used. Dependency licences remain in the pinned local packages.

`tools/asset-manifest.json` records local paths, byte sizes and SHA-256 hashes. Refresh it after replacing an asset. Root's generated image originals are maintained outside the deployable runtime; this project contains the supplied delivery variants.

<!-- BEGIN ARCHITECTURE WORLD RENDERS -->
## Original Blender architectural worlds — 3 October 2026

| Delivery files in `public/images/` | Source composition |
| --- | --- |
| `aurel-world.webp`, `aurel-world-mobile.webp` | Wide view of the authored full-scale architectural world |
| `aurel-timber-study.webp`, `aurel-timber-study-mobile.webp` | Material/detail view of the same world |

These are locally rendered fictional Blender scenes. Geometry, placement, cameras and light composition are authored for this portfolio; photographed PBR maps and the environment are [Poly Haven CC0 assets](https://polyhaven.com/license), with the exact authors, download URLs and SHA-256 hashes in `assets/source/texture-manifest.json`. The editable packed source is `assets/source/architecture-world.blend`; project-local reconstruction tools and the used-asset attribution table are documented in [RENDERING.md](docs/RENDERING.md).

Settled throw geometry is preserved in `tools/worlds/cloth/aurel.json`, together with its recorded gravity/cloth-bake metadata. The editable simulation study is `assets/source/cloth-study.blend` and the reconstruction script is `tools/bake-cloth.py`. Cloth simulation is separate from CUDA image rendering. The external simulation cache is not included by this packaging step; the settled JSON and editable setup are included. See `docs/render/cloth.json` and the cache boundary in `docs/RENDERING.md`.

The final Cycles frames were rendered at 3200 × 2000 with CUDA GPU compute and OptiX denoising. Actual settings and machine-guard records are in `docs/render/`. Surface UV crops, recolouring and straight-through glass shadow transport are documented rendering adaptations. WebP encoding, website integration and browser/live verification are separate from source packaging. No claim of completed architecture, photographic capture or user acceptance is made. All earlier generated and licensed image provenance above remains applicable to those older files.
<!-- END ARCHITECTURE WORLD RENDERS -->
