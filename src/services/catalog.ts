import { datasets } from '../data/datasets'
import { filterDatasets } from '../lib/search'
import type { CatalogFilters, CatalogProvider } from '../types'

export class LocalCatalogProvider implements CatalogProvider {
  async search(filters: CatalogFilters) {
    return filterDatasets(datasets, filters)
  }

  async getById(id: string) {
    return datasets.find((dataset) => dataset.id === id)
  }
}

export const catalogProvider = new LocalCatalogProvider()
