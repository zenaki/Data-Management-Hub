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
- `src/Main.dc.html` – viewer source; `src/Editor.dc.html` – diagram editor source.
- `scripts/build.js` – turns the source into `public/index.html`.
- `public/dc-runtime.js` – small template runtime (holes, `sc-for`, `sc-if`) on React 18.
- `public/vendor/` – React 18.3.1 production builds (no CDN needed).
- `samples/airflow-bigquery-sample.zip` – Airflow-centric sample (folder `samples/airflow-bigquery/`):
  DAG + Variables → Task Group → Task → BigQuery, two DAGs sharing a variable and a mart table.
- `samples/` – sample data: `metadata-hub-sample.zip` (multi-file with `main.yaml`),
  `metadata-hub-sample.yaml` (single file) and `project/` (the same files unzipped).

## Diagram Editor (`editor.html`)
Draw the diagram yourself and save the layout with the data:
- Import / export `.zip` (with `main.yaml`) or a single `.yaml`; *Load sample* opens `samples/airflow-bigquery-sample.zip`.
- Palette: add any asset type; with a container selected the new asset goes inside it.
- Drag an asset's header to move it; drop it inside a container to set `parent`. Drag a container to move it
  with its contents, drag its corner to resize it.
- Drag the teal dot onto another asset to add a lineage relation; drag a column's purple dot onto a column of
  another asset to add it to that column's `sources`.
- Side panel: rename (references are updated), type, parent, owner, properties, columns, expressions, sources,
  relations. Undo / redo, auto-layout, snap to grid, zoom and pan.
- Positions are exported as `layout.yaml` (`layout.nodes.<id>: {x, y, w, h}`). The viewer's Data Lineage
  shows them in the **Editor layout** view.

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
