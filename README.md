# Metadata Hub

Static web app for data management — **Data Catalog**, **Data Dictionary** and **Data Lineage**
(asset-level and column-level). There is no database: YAML is the only source of truth.

## Run locally
Open `public/index.html` in a browser (or `npx serve public`).

## Deploy (GitHub Pages)
Every push to `main` runs `.github/workflows/pages.yml`, which builds `public/index.html`
and publishes `public/` to https://zenaki.github.io/Data-Management-Hub/.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Structure
- `src/Main.dc.html` – app source (template + logic).
- `scripts/build.js` – turns the source into `public/index.html`.
- `public/dc-runtime.js` – small template runtime (holes, `sc-for`, `sc-if`) on React 18.
- `public/vendor/` – React 18.3.1 production builds (no CDN needed).
- `samples/` – sample data: `metadata-hub-sample.zip` (multi-file with `main.yaml`),
  `metadata-hub-sample.yaml` (single file) and `project/` (the same files unzipped).

## YAML format (v2)
`main.yaml` is the entry point and pulls in other files with `include:` (relative paths,
`*` / `**` globs, nested includes allowed). Any file may contain `asset_types`, `assets`
and `lineage`. Unknown keys on an asset go into `properties`. Column lineage lives on each
field as `expression` + `sources: [asset.id.column]`. See `samples/project/`.
