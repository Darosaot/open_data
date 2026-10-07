import { describe, expect, it } from 'vitest'
import { datasets } from '../data/datasets'
import type { CatalogFilters } from '../types'
import { filterDatasets, relevanceScore } from './search'

const filters: CatalogFilters = {
  query: '',
  countries: [],
  topics: [],
  formats: [],
  minimumQuality: 0,
  apiOnly: false,
  sort: 'relevance',
}

describe('catalogue search', () => {
  it('matches terms across titles, descriptions, and tags', () => {
    const results = filterDatasets(datasets, { ...filters, query: 'bicycle traffic' })

    expect(results[0].id).toBe('paris-bicycle-counters')
    expect(results).toHaveLength(1)
  })

  it('normalizes accented text', () => {
    const paris = datasets.find((dataset) => dataset.id === 'paris-bicycle-counters')!
    const accented = { ...paris, title: 'Qualité de l’air à Paris' }

    expect(relevanceScore(accented, 'qualite air')).toBeGreaterThan(0)
  })

  it('combines format, country, quality, and API filters', () => {
    const results = filterDatasets(datasets, {
      ...filters,
      countries: ['Europe'],
      formats: ['API'],
      minimumQuality: 95,
      apiOnly: true,
    })

    expect(results.map((dataset) => dataset.id)).toEqual([
      'eu-energy-prices',
      'eea-air-quality-hourly',
    ])
  })

  it('sorts results by most recent update', () => {
    const results = filterDatasets(datasets, { ...filters, sort: 'newest' })

    expect(results[0].updated).toBe('2026-10-06')
  })
})
