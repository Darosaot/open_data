import { RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { CatalogFilters } from '../types'

interface FiltersProps {
  filters: CatalogFilters
  countries: string[]
  topics: string[]
  formats: string[]
  open: boolean
  onClose: () => void
  onChange: (filters: CatalogFilters) => void
  onReset: () => void
}

interface CheckGroupProps {
  label: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
}

function CheckGroup({ label, items, selected, onToggle }: CheckGroupProps) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <div className="filter-options">
        {items.map((item) => (
          <label key={item} className="check-row">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
            />
            <span className="custom-check" aria-hidden="true" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Filters({
  filters,
  countries,
  topics,
  formats,
  open,
  onClose,
  onChange,
  onReset,
}: FiltersProps) {
  const toggle = (key: 'countries' | 'topics' | 'formats', value: string) => {
    const values = filters[key]
    onChange({
      ...filters,
      [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    })
  }

  return (
    <aside className={`filters ${open ? 'filters--open' : ''}`} aria-label="Dataset filters">
      <div className="filters__mobile-head">
        <span>
          <SlidersHorizontal size={17} /> Filters
        </span>
        <button onClick={onClose} aria-label="Close filters">
          <X size={20} />
        </button>
      </div>

      <div className="filters__heading">
        <h2>Refine results</h2>
        <button className="reset-button" onClick={onReset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <CheckGroup
        label="Country"
        items={countries}
        selected={filters.countries}
        onToggle={(item) => toggle('countries', item)}
      />
      <CheckGroup
        label="Topic"
        items={topics}
        selected={filters.topics}
        onToggle={(item) => toggle('topics', item)}
      />
      <CheckGroup
        label="Format"
        items={formats}
        selected={filters.formats}
        onToggle={(item) => toggle('formats', item)}
      />

      <fieldset className="filter-group">
        <legend>Quality score</legend>
        <div className="range-labels">
          <span>Any</span>
          <strong>{filters.minimumQuality === 0 ? 'Any' : `${filters.minimumQuality}+`}</strong>
        </div>
        <input
          className="quality-range"
          type="range"
          min="0"
          max="95"
          step="5"
          value={filters.minimumQuality}
          aria-label="Minimum quality score"
          onChange={(event) =>
            onChange({ ...filters, minimumQuality: Number(event.target.value) })
          }
        />
      </fieldset>

      <label className="switch-row">
        <span>
          <strong>API available</strong>
          <small>Only show programmable sources</small>
        </span>
        <input
          type="checkbox"
          checked={filters.apiOnly}
          onChange={(event) => onChange({ ...filters, apiOnly: event.target.checked })}
        />
        <span className="switch" aria-hidden="true" />
      </label>
    </aside>
  )
}
