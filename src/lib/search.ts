import type { CatalogFilters, Dataset } from '../types'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()

const searchableText = (dataset: Dataset) =>
  normalize(
    [
      dataset.title,
      dataset.description,
      dataset.publisher,
      dataset.catalog,
      dataset.country,
      dataset.topic,
      dataset.license,
      ...dataset.tags,
      ...dataset.formats,
    ].join(' '),
  )

export function relevanceScore(dataset: Dataset, query: string) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return dataset.featured ? 2 : 1

  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  const title = normalize(dataset.title)
  const tags = normalize(dataset.tags.join(' '))
  const publisher = normalize(dataset.publisher)
  const haystack = searchableText(dataset)

  return terms.reduce((score, term) => {
    if (!haystack.includes(term)) return score
    if (title.includes(term)) return score + 8
    if (tags.includes(term)) return score + 5
    if (publisher.includes(term)) return score + 3
    return score + 1
  }, 0)
}

export function filterDatasets(items: Dataset[], filters: CatalogFilters) {
  const query = normalize(filters.query)
  const queryTerms = query.split(/\s+/).filter(Boolean)

  return items
    .filter((dataset) => {
      if (!query) return true
      const haystack = searchableText(dataset)
      return queryTerms.every((term) => haystack.includes(term))
    })
    .filter(
      (dataset) =>
        filters.countries.length === 0 || filters.countries.includes(dataset.country),
    )
    .filter(
      (dataset) => filters.topics.length === 0 || filters.topics.includes(dataset.topic),
    )
    .filter(
      (dataset) =>
        filters.formats.length === 0 ||
        filters.formats.some((format) => dataset.formats.includes(format)),
    )
    .filter((dataset) => dataset.quality.overall >= filters.minimumQuality)
    .filter((dataset) => !filters.apiOnly || dataset.apiAvailable)
    .sort((a, b) => {
      if (filters.sort === 'quality') return b.quality.overall - a.quality.overall
      if (filters.sort === 'newest') return Date.parse(b.updated) - Date.parse(a.updated)
      const scoreDifference = relevanceScore(b, query) - relevanceScore(a, query)
      return scoreDifference || b.quality.overall - a.quality.overall
    })
}
