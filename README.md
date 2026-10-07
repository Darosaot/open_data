# OpenEU Lens

A quality-aware discovery interface for European open data. The current MVP ships
with a small, representative demo catalogue so that search, filtering, dataset
previews, quality signals, and developer examples work without external services.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Hosted version

The `main` branch deploys automatically to GitHub Pages:

<https://darosaot.github.io/open_data/>

The workflow lives in `.github/workflows/deploy-pages.yml`. It builds with the
`pages` Vite mode so asset paths work under the repository subpath.

## Checks

```bash
npm test
npm run build
```

## What is implemented

- Full-text search across dataset titles, descriptions, publishers, and keywords
- Country, topic, format, and minimum-quality filters
- Relevance, quality, and recency sorting
- Dataset detail panel with provenance, quality breakdown, sample data, and schema
- Copyable cURL, Python, and JavaScript examples
- Responsive, keyboard-friendly interface
- Build-time harvesting from 18 European catalogue/API endpoints
- A daily GitHub Actions refresh with per-source failure isolation
- Normalized DCAT-style metadata and heuristic quality scoring
- Demo-data fallback when a portal is unavailable

## Data source

The deployed build runs `npm run harvest` before Vite builds the site. The first
source wave includes data.europa.eu, national CKAN portals (Belgium, Austria,
Finland, Portugal, Germany, Switzerland, Ireland, Greece, the Netherlands,
Denmark, Czechia, Slovenia and Cyprus), dane.gov.pl, data.gouv.fr, and
OpenDataSoft catalogues including Paris. Each source is best-effort and recorded
in `public/harvest-status.json`; a failed portal does not block the rest.

Local development uses `src/data/datasets.ts` when `public/catalog.json` is not
present. The generated catalogue is ignored by Git because it is a deployment
artifact, not source code.

The normalized provider lives in `src/services/catalog.ts` and keeps the UI
independent of whether records came from data.europa.eu, CKAN, or another national
portal. Add future connectors in `scripts/harvest.mjs` without changing the UI.
