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
- Typed provider boundary ready for a live catalogue adapter

## Data source

The app currently uses `src/data/datasets.ts`, a deliberately labelled demo
catalogue containing representative public datasets. It does not claim that these
records are a complete or live mirror of data.europa.eu.

To connect a live source, implement the `CatalogProvider` interface in
`src/services/catalog.ts`. Keep normalized records in the `Dataset` shape so the
UI does not need to know whether results came from data.europa.eu, CKAN, or another
national portal.
