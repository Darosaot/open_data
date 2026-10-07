import { datasets } from '../data/datasets'
import { filterDatasets } from '../lib/search'
import type { CatalogFilters, CatalogProvider, Dataset } from '../types'

export class CatalogDataProvider implements CatalogProvider {
  private loaded: Dataset[] | null = null
  public mode: 'demo' | 'harvested' = 'demo'
  public snapshot = {
    mode: 'demo' as 'demo' | 'harvested',
    datasetCount: datasets.length,
    connectedSources: 0,
    attemptedSources: 0,
  }

  private async load() {
    if (this.loaded) return this.loaded

    try {
      const catalogUrl = new URL('catalog.json', document.baseURI).toString()
      const response = await fetch(catalogUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(`catalog.json returned ${response.status}`)
      const remote = await response.json()
      if (Array.isArray(remote) && remote.length > 0) {
        let connectedSources = 0
        let attemptedSources = 0
        try {
          const statusResponse = await fetch(new URL('harvest-status.json', document.baseURI).toString(), { cache: 'no-store' })
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            const sourceStatuses = Array.isArray(status.sources) ? status.sources : []
            attemptedSources = sourceStatuses.length
            connectedSources = sourceStatuses.filter((source: { status?: string }) => source.status === 'ok').length
          }
        } catch {
          // A catalogue can still be used if the status sidecar is unavailable.
        }
        this.loaded = remote as Dataset[]
        this.mode = 'harvested'
        this.snapshot = { mode: 'harvested', datasetCount: this.loaded.length, connectedSources, attemptedSources }
        return this.loaded
      }
    } catch {
      // Local development and test runs intentionally fall back to demo records.
    }

    this.loaded = datasets
    this.snapshot = { mode: 'demo', datasetCount: datasets.length, connectedSources: 0, attemptedSources: 0 }
    return this.loaded
  }

  async search(filters: CatalogFilters) {
    return filterDatasets(await this.load(), filters)
  }

  async getById(id: string) {
    return (await this.load()).find((dataset) => dataset.id === id)
  }
}

export const catalogProvider = new CatalogDataProvider()
