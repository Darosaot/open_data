import { ArrowUpRight, Braces, CalendarDays, Database, MapPin } from 'lucide-react'
import type { Dataset } from '../types'
import { QualityRing } from './QualityRing'

interface DatasetCardProps {
  dataset: Dataset
  onSelect: (dataset: Dataset) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${date}T12:00:00Z`),
  )

export function DatasetCard({ dataset, onSelect }: DatasetCardProps) {
  return (
    <article className="dataset-card">
      <button className="dataset-card__main" onClick={() => onSelect(dataset)}>
        <div className="dataset-card__source-row">
          <span className="country-mark" aria-label={dataset.country}>
            {dataset.flag}
          </span>
          <span>{dataset.publisher}</span>
          <span className="dot" aria-hidden="true" />
          <span>{dataset.country}</span>
          {dataset.apiAvailable && (
            <span className="api-badge">
              <Braces size={12} /> API
            </span>
          )}
        </div>

        <div className="dataset-card__title-row">
          <div>
            <h3>{dataset.title}</h3>
            <p>{dataset.description}</p>
          </div>
          <QualityRing score={dataset.quality.overall} />
        </div>

        <div className="dataset-card__meta">
          <span>
            <CalendarDays size={14} /> Updated {formatDate(dataset.updated)}
          </span>
          <span>
            <MapPin size={14} /> {dataset.spatialCoverage}
          </span>
          {dataset.recordCount && (
            <span>
              <Database size={14} /> {dataset.recordCount}
            </span>
          )}
        </div>

        <div className="dataset-card__footer">
          <div className="format-list">
            {dataset.formats.slice(0, 4).map((format) => (
              <span key={format}>{format}</span>
            ))}
          </div>
          <span className="view-link">
            Inspect dataset <ArrowUpRight size={15} />
          </span>
        </div>
      </button>
    </article>
  )
}
