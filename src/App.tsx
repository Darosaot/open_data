import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Braces,
  Github,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { DatasetCard } from './components/DatasetCard'
import { DatasetDrawer } from './components/DatasetDrawer'
import { Filters } from './components/Filters'
import { datasets } from './data/datasets'
import { catalogProvider } from './services/catalog'
import type { CatalogFilters, Dataset } from './types'

const defaultFilters: CatalogFilters = {
  query: '',
  countries: [],
  topics: [],
  formats: [],
  minimumQuality: 0,
  apiOnly: false,
  sort: 'relevance',
}

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

function App() {
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters)
  const [results, setResults] = useState<Dataset[]>(datasets)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let active = true
    catalogProvider.search(filters).then((items) => active && setResults(items))
    return () => {
      active = false
    }
  }, [filters])

  const countries = useMemo(() => unique(datasets.map((dataset) => dataset.country)), [])
  const topics = useMemo(() => unique(datasets.map((dataset) => dataset.topic)), [])
  const formats = useMemo(
    () =>
      unique(datasets.flatMap((dataset) => dataset.formats)).filter((format) =>
        ['API', 'CSV', 'GeoJSON', 'JSON', 'RDF', 'XLSX'].includes(format),
      ),
    [],
  )

  const activeFilterCount =
    filters.countries.length +
    filters.topics.length +
    filters.formats.length +
    Number(filters.minimumQuality > 0) +
    Number(filters.apiOnly)

  const resetFilters = useCallback(
    () => setFilters((current) => ({ ...defaultFilters, query: current.query })),
    [],
  )

  const useSuggestion = (query: string) => {
    setFilters((current) => ({ ...current, query }))
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="OpenEU Lens home">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>OpenEU <strong>Lens</strong></span>
        </a>

        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Main navigation">
          <a href="#catalogue" onClick={() => setMenuOpen(false)}>Explore</a>
          <a href="#methodology" onClick={() => setMenuOpen(false)}>Methodology</a>
          <a
            href="https://github.com/Darosaot/open_data"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            <Github size={16} /> GitHub
          </a>
        </nav>

        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__glow hero__glow--one" />
          <div className="hero__glow hero__glow--two" />
          <div className="hero__content">
            <div className="eyebrow"><Sparkles size={14} /> A clearer view of public data</div>
            <h1>Find European data<br /><em>you can actually use.</em></h1>
            <p className="hero__lede">
              Search public datasets across Europe, compare their quality, preview the data,
              and start building—all in one place.
            </p>

            <label className="hero-search">
              <Search size={21} />
              <span className="sr-only">Search datasets</span>
              <input
                type="search"
                aria-label="Search datasets"
                value={filters.query}
                placeholder="Try “air quality”, “bicycle traffic” or “energy prices”"
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
              {filters.query && (
                <button
                  onClick={() => setFilters({ ...filters, query: '' })}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
              <span className="search-shortcut">⌘ K</span>
            </label>

            <div className="suggestions">
              <span>Explore:</span>
              {['clean air', 'public transport', 'energy prices'].map((suggestion) => (
                <button key={suggestion} onClick={() => useSuggestion(suggestion)}>
                  {suggestion} <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>

          <div className="hero__stats" aria-label="Prototype highlights">
            <div><strong>{datasets.length}</strong><span>curated examples</span></div>
            <div><strong>{countries.length}</strong><span>country views</span></div>
            <div><strong>4</strong><span>quality dimensions</span></div>
            <div><strong>1</strong><span>consistent interface</span></div>
          </div>
        </section>

        <div className="demo-banner">
          <span>Prototype</span>
          This build uses a small representative catalogue. Scores and preview rows are illustrative;
          authoritative records remain with each publisher.
        </div>

        <section className="catalogue-section" id="catalogue">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Catalogue</span>
              <h2>Explore open datasets</h2>
            </div>
            <p>Quality signals help you spend less time checking metadata and more time using data.</p>
          </div>

          <div className="catalogue-layout">
            <Filters
              filters={filters}
              countries={countries}
              topics={topics}
              formats={formats}
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              onChange={setFilters}
              onReset={resetFilters}
            />

            {filtersOpen && <button className="filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />}

            <div className="results">
              <div className="results__toolbar">
                <div>
                  <strong>{results.length} dataset{results.length === 1 ? '' : 's'}</strong>
                  <span>{filters.query ? ` matching “${filters.query}”` : ' in this prototype'}</span>
                </div>
                <div className="results__actions">
                  <button className="mobile-filter-button" onClick={() => setFiltersOpen(true)}>
                    <SlidersHorizontal size={15} /> Filters
                    {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
                  </button>
                  <label className="sort-control">
                    <span>Sort by</span>
                    <select
                      value={filters.sort}
                      onChange={(event) =>
                        setFilters({ ...filters, sort: event.target.value as CatalogFilters['sort'] })
                      }
                    >
                      <option value="relevance">Relevance</option>
                      <option value="quality">Quality score</option>
                      <option value="newest">Recently updated</option>
                    </select>
                  </label>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="active-filters">
                  {[...filters.countries, ...filters.topics, ...filters.formats].map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          countries: filters.countries.filter((item) => item !== value),
                          topics: filters.topics.filter((item) => item !== value),
                          formats: filters.formats.filter((item) => item !== value),
                        })
                      }
                    >
                      {value} <X size={12} />
                    </button>
                  ))}
                  {filters.minimumQuality > 0 && (
                    <button onClick={() => setFilters({ ...filters, minimumQuality: 0 })}>
                      Quality {filters.minimumQuality}+ <X size={12} />
                    </button>
                  )}
                  {filters.apiOnly && (
                    <button onClick={() => setFilters({ ...filters, apiOnly: false })}>
                      API available <X size={12} />
                    </button>
                  )}
                </div>
              )}

              <div className="result-list">
                {results.map((dataset) => (
                  <DatasetCard key={dataset.id} dataset={dataset} onSelect={setSelectedDataset} />
                ))}
              </div>

              {results.length === 0 && (
                <div className="empty-state">
                  <span><Search size={23} /></span>
                  <h3>No datasets found</h3>
                  <p>Try a broader search or remove one of your filters.</p>
                  <button onClick={() => setFilters(defaultFilters)}>Clear search and filters</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="methodology" id="methodology">
          <div className="methodology__intro">
            <span className="section-kicker">Methodology</span>
            <h2>Useful data starts<br />with honest signals.</h2>
            <p>
              OpenEU Lens does not replace the publisher. It adds a transparent usability layer
              so you can quickly judge whether a dataset fits your project.
            </p>
          </div>
          <div className="method-grid">
            <article><span>01</span><ShieldCheck size={22} /><h3>Metadata</h3><p>Are the title, description, licence and provenance complete?</p></article>
            <article><span>02</span><Sparkles size={22} /><h3>Freshness</h3><p>Was the record updated when its stated schedule says it should be?</p></article>
            <article><span>03</span><Braces size={22} /><h3>Access</h3><p>Do download links and APIs respond in a usable, machine-readable form?</p></article>
            <article><span>04</span><ArrowRight size={22} /><h3>Openness</h3><p>Is reuse clearly allowed under a recognised open licence?</p></article>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand brand--footer" href="#top">
          <span className="brand__mark"><span /><span /><span /></span>
          <span>OpenEU <strong>Lens</strong></span>
        </a>
        <p>An independent open-source prototype. Not affiliated with the European Union.</p>
        <a href="https://github.com/Darosaot/open_data" target="_blank" rel="noreferrer">
          View source <ArrowRight size={14} />
        </a>
      </footer>

      <DatasetDrawer dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
    </div>
  )
}

export default App
