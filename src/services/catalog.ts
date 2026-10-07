import { datasets } from '../data/datasets'
import { filterDatasets } from '../lib/search'
import type { CatalogFilters, CatalogProvider, Dataset } from '../types'

export class CatalogDataProvider implements CatalogProvider {
  private loaded: Dataset[] | null = null
  public mode: 'demo' | 'harvested' = 'demo'

  private async load() {
    if (this.loaded) return this.loaded

    try {
      const catalogUrl = new URL('catalog.json', document.baseURI).toString()
      const response = await fetch(catalogUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(`catalog.json returned ${response.status}`)
      const remote = await response.json()
      if (Array.isArray(remote) && remote.length > 0) {
        this.loaded = remote as Dataset[]
        this.mode = 'harvested'
        return this.loaded
      }
    } catch {
      // Local development and test runs intentionally fall back to demo records.
    }

    this.loaded = datasets
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
