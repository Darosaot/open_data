export type DistributionStatus = 'live' | 'slow' | 'unchecked'

export interface Distribution {
  format: string
  url: string
  size?: string
  status: DistributionStatus
}

export interface DatasetField {
  name: string
  type: string
  description: string
}

export interface QualityScore {
  overall: number
  metadata: number
  freshness: number
  accessibility: number
  openness: number
}

export interface Dataset {
  id: string
  title: string
  description: string
  publisher: string
  catalog: string
  country: string
  countryCode: string
  flag: string
  topic: string
  tags: string[]
  formats: string[]
  license: string
  updated: string
  updateFrequency: string
  spatialCoverage: string
  recordCount?: string
  quality: QualityScore
  featured?: boolean
  apiAvailable: boolean
  sourceUrl: string
  distributions: Distribution[]
  schema: DatasetField[]
  sampleRows: Record<string, string | number>[]
}

export interface CatalogFilters {
  query: string
  countries: string[]
  topics: string[]
  formats: string[]
  minimumQuality: number
  apiOnly: boolean
  sort: 'relevance' | 'quality' | 'newest'
}

export interface CatalogProvider {
  search(filters: CatalogFilters): Promise<Dataset[]>
  getById(id: string): Promise<Dataset | undefined>
}
