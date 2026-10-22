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

## Lineage features
- **DAG containers** (default): every Airflow DAG is a collapsible container with lanes for
  variables/connections, sources & storage, task groups → tasks, BigQuery (project → dataset → objects)
  and ML/artifacts. Assets used by several DAGs appear in each. *Open all* / *Close all*.
- **Flat graph**: layered left-to-right view with `+N` expand buttons and a per-layer limit.
- Column-level lineage with expressions; columns classified as Source / Passthrough / Rename / Transformed,
  descriptions inherited through passthrough and rename columns.
- Related-only view with upstream/downstream depth, filters (type, domain, relation; hide or highlight),
  colour by type or domain, minimap, zoom/pan, click a line for relation details.
- Detail panel (asset, column, relation) with paths to source; Impact table with CSV download.
- Connect mode to draw new relations; export the diagram as SVG or PNG.
- Import OpenLineage RunEvents (`.json` / `.jsonl`) alongside YAML — see `samples/openlineage-sample.json`.
- Validation report in Import / Export (missing source columns, unknown assets, cycles, missing owners).

## YAML format (v2)
`main.yaml` is the entry point and pulls in other files with `include:` (relative paths,
`*` / `**` globs, nested includes allowed). Any file may contain `asset_types`, `assets`
and `lineage`. Unknown keys on an asset go into `properties`. Column lineage lives on each
field as `expression` + `sources: [asset.id.column]`. See `samples/project/`.
