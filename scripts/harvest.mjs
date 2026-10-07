import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const outputFile = resolve(root, 'public/catalog.json')
const statusFile = resolve(root, 'public/harvest-status.json')
const limit = Number(process.env.HARVEST_LIMIT ?? 100)
const maxRecords = Number(process.env.HARVEST_MAX_RECORDS ?? 0)
const timeoutMs = Number(process.env.HARVEST_TIMEOUT_MS ?? 10000)

const countryInfo = {
  BE: ['Belgium', 'BE'],
  AT: ['Austria', 'AT'],
  FI: ['Finland', 'FI'],
  PT: ['Portugal', 'PT'],
  DE: ['Germany', 'DE'],
  CH: ['Switzerland', 'CH'],
  IE: ['Ireland', 'IE'],
  GR: ['Greece', 'GR'],
  NL: ['Netherlands', 'NL'],
  DK: ['Denmark', 'DK'],
  CZ: ['Czechia', 'CZ'],
  SI: ['Slovenia', 'SI'],
  CY: ['Cyprus', 'CY'],
  PL: ['Poland', 'PL'],
  FR: ['France', 'FR'],
  EU: ['Europe', 'EU'],
  BG: ['Bulgaria', 'BG'],
  HR: ['Croatia', 'HR'],
  EE: ['Estonia', 'EE'],
  IT: ['Italy', 'IT'],
  LV: ['Latvia', 'LV'],
  LT: ['Lithuania', 'LT'],
  LU: ['Luxembourg', 'LU'],
  MT: ['Malta', 'MT'],
  RO: ['Romania', 'RO'],
  SK: ['Slovakia', 'SK'],
  IS: ['Iceland', 'IS'],
  ES: ['Spain', 'ES'],
}

const sources = [
  { key: 'eu', name: 'data.europa.eu', kind: 'europa', countryCode: 'EU', url: process.env.DATA_EUROPA_API ?? 'https://data.europa.eu/api/hub/search/datasets' },
  { key: 'be', name: 'data.gov.be', kind: 'ckan', countryCode: 'BE', url: 'https://data.gov.be/api/3/action/package_search' },
  { key: 'at', name: 'data.gv.at', kind: 'ckan', countryCode: 'AT', url: 'https://www.data.gv.at/katalog/api/3/action/package_search' },
  { key: 'fi', name: 'avoindata.fi', kind: 'ckan', countryCode: 'FI', url: 'https://www.avoindata.fi/data/api/3/action/package_search' },
  { key: 'pt', name: 'dados.gov.pt', kind: 'ckan', countryCode: 'PT', url: 'https://dados.gov.pt/api/3/action/package_search' },
  { key: 'de', name: 'GovData Germany', kind: 'ckan', countryCode: 'DE', url: 'https://www.govdata.de/ckan/api/3/action/package_search' },
  { key: 'ch', name: 'opendata.swiss', kind: 'ckan', countryCode: 'CH', url: 'https://opendata.swiss/api/3/action/package_search' },
  { key: 'ie', name: 'data.gov.ie', kind: 'ckan', countryCode: 'IE', url: 'https://data.gov.ie/api/3/action/package_search' },
  { key: 'gr', name: 'data.gov.gr', kind: 'ckan', countryCode: 'GR', url: 'https://data.gov.gr/api/3/action/package_search' },
  { key: 'nl', name: 'data.overheid.nl', kind: 'ckan', countryCode: 'NL', url: 'https://data.overheid.nl/api/3/action/package_search' },
  { key: 'dk', name: 'opendata.dk', kind: 'ckan', countryCode: 'DK', url: 'https://www.opendata.dk/api/3/action/package_search' },
  { key: 'cz', name: 'opendata.cz', kind: 'ckan', countryCode: 'CZ', url: 'https://www.opendata.cz/api/3/action/package_search' },
  { key: 'si', name: 'podatki.gov.si', kind: 'ckan', countryCode: 'SI', url: 'https://podatki.gov.si/api/3/action/package_search' },
  { key: 'cy', name: 'data.gov.cy', kind: 'ckan', countryCode: 'CY', url: 'https://data.gov.cy/api/3/action/package_search' },
  { key: 'bg', name: 'data.egov.bg', kind: 'ckan', countryCode: 'BG', url: 'https://data.egov.bg/api/3/action/package_search' },
  { key: 'hr', name: 'data.gov.hr', kind: 'ckan', countryCode: 'HR', url: 'https://data.gov.hr/ckan/api/3/action/package_search' },
  { key: 'ee', name: 'avaandmed.eesti.ee', kind: 'ckan', countryCode: 'EE', url: 'https://avaandmed.eesti.ee/api/3/action/package_search' },
  { key: 'it', name: 'dati.gov.it', kind: 'ckan', countryCode: 'IT', url: 'https://www.dati.gov.it/opendata/api/3/action/package_search' },
  { key: 'lv', name: 'data.gov.lv', kind: 'ckan', countryCode: 'LV', url: 'https://data.gov.lv/dati/lv/api/3/action/package_search' },
  { key: 'lt', name: 'data.gov.lt', kind: 'ckan', countryCode: 'LT', url: 'https://data.gov.lt/api/3/action/package_search' },
  { key: 'lu', name: 'data.public.lu', kind: 'ckan', countryCode: 'LU', url: 'https://data.public.lu/api/3/action/package_search' },
  { key: 'mt', name: 'data.gov.mt', kind: 'ckan', countryCode: 'MT', url: 'https://data.gov.mt/api/3/action/package_search' },
  { key: 'ro', name: 'data.gov.ro', kind: 'ckan', countryCode: 'RO', url: 'https://data.gov.ro/api/3/action/package_search' },
  { key: 'sk', name: 'data.gov.sk', kind: 'ckan', countryCode: 'SK', url: 'https://data.gov.sk/api/3/action/package_search' },
  { key: 'is', name: 'gogn.island.is', kind: 'ckan', countryCode: 'IS', url: 'https://gogn.island.is/api/3/action/package_search' },
  { key: 'pl', name: 'dane.gov.pl', kind: 'dane', countryCode: 'PL', url: 'https://api.dane.gov.pl/1.4/datasets' },
  { key: 'fr', name: 'data.gouv.fr', kind: 'gouv', countryCode: 'FR', url: 'https://www.data.gouv.fr/api/1/datasets/' },
  { key: 'ods', name: 'OpenDataSoft public catalogues', kind: 'ods', countryCode: 'EU', url: 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets' },
  { key: 'paris', name: 'Paris Open Data', kind: 'ods', countryCode: 'FR', url: 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets' },
  { key: 'brussels', name: 'Brussels Open Data', kind: 'ods', countryCode: 'BE', url: 'https://opendata.brussels.be/api/explore/v2.1/catalog/datasets' },
  { key: 'barcelona', name: 'Barcelona Open Data', kind: 'ods', countryCode: 'ES', url: 'https://opendata-ajuntament.barcelona.cat/api/explore/v2.1/catalog/datasets' },
]

const stripMarkup = (value) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])
const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

function cleanDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10)
}

function normalizeFormat(value) {
  const format = String(value ?? '').trim().toUpperCase()
  if (!format) return ''
  if (format.includes('CSV')) return 'CSV'
  if (format.includes('JSON')) return 'JSON'
  if (format.includes('GEOJSON')) return 'GeoJSON'
  if (format.includes('EXCEL') || format.includes('SPREADSHEET') || format.includes('XLS')) return 'XLSX'
  if (format.includes('XML')) return 'XML'
  if (format.includes('RDF') || format.includes('TURTLE')) return 'RDF'
  if (format.includes('SHAPE')) return 'SHP'
  if (format.includes('API') || format.includes('REST')) return 'API'
  return format.slice(0, 12)
}

function inferTopic(text) {
  const value = String(text).toLowerCase()
  if (/air|climate|emission|environment|water|biodivers|pollution|weather/.test(value)) return 'Environment'
  if (/transport|traffic|road|rail|bike|cycling|mobility|charging/.test(value)) return 'Transport'
  if (/energy|electricity|gas|power|renewable/.test(value)) return 'Energy'
  if (/health|hospital|disease|care|medical/.test(value)) return 'Health'
  if (/budget|finance|tax|spend|economic|business/.test(value)) return 'Economy'
  if (/culture|museum|heritage|tourism|library/.test(value)) return 'Culture'
  if (/building|address|city|municip|region|geospatial|land/.test(value)) return 'Regions & cities'
  return 'Government'
}

function countryFor(source) {
  const [country, code] = countryInfo[source.countryCode] ?? countryInfo.EU
  return { country, countryCode: code, flag: code }
}

function resourcesFor(record) {
  const resources = asArray(first(record.resources, record.distributions, record.distribution))
  return resources
    .map((resource) => {
      if (typeof resource === 'string') return { url: resource, format: '', title: '' }
      const url = first(resource.url, resource.access_url, resource.download_url, resource.downloadURL, resource.href)
      if (!url || !/^https?:\/\//i.test(url)) return null
      return {
        url,
        format: normalizeFormat(first(resource.format, resource.mimetype, resource.media_type, resource.type, resource.mimeType)),
        title: stripMarkup(first(resource.name, resource.title, resource.label)),
        size: first(resource.size, resource.bytes) ? String(first(resource.size, resource.bytes)) : undefined,
      }
    })
    .filter(Boolean)
}

function tagsFor(record) {
  return asArray(first(record.tags, record.keywords, record.theme, record.themes))
    .map((tag) => typeof tag === 'string' ? tag : first(tag.name, tag.label, tag.prefLabel))
    .filter(Boolean)
    .map(stripMarkup)
    .filter(Boolean)
    .slice(0, 12)
}

function scoreQuality(record, resources, license, description, publisher) {
  const metadata = Math.round([
    record.title,
    description && description.length > 40,
    publisher,
    tagsFor(record).length > 0,
    license,
  ].filter(Boolean).length / 5 * 100)
  const modified = Date.parse(first(record.metadata_modified, record.modified, record.updated, record.last_update, record.updated_at))
  const ageDays = Number.isNaN(modified) ? 9999 : (Date.now() - modified) / 86400000
  const freshness = ageDays < 45 ? 100 : ageDays < 180 ? 90 : ageDays < 365 ? 78 : ageDays < 730 ? 62 : 45
  const accessibility = resources.length > 0 ? 90 : 35
  const openness = /cc|open|odc|public|european union|etalab|reuse|licen[cs]e/i.test(String(license)) ? 94 : license ? 76 : 55
  return {
    overall: Math.round(metadata * .3 + freshness * .25 + accessibility * .25 + openness * .2),
    metadata,
    freshness,
    accessibility,
    openness,
  }
}

function normalizeRecord(record, source, index) {
  const value = record?.dataset && typeof record.dataset === 'object' ? { ...record, ...record.dataset } : record
  const title = stripMarkup(first(value.title, value.name, value.label, `Dataset ${index + 1}`))
  const description = stripMarkup(first(value.notes, value.description, value.summary, 'Metadata record harvested from the source catalogue.'))
  const publisherValue = first(
    value.organization?.title,
    value.organization?.name,
    value.publisher?.name,
    value.publisher,
    value.owner_org,
    source.name,
  )
  const publisher = stripMarkup(typeof publisherValue === 'object' ? first(publisherValue.name, publisherValue.title) : publisherValue)
  const license = stripMarkup(first(value.license_title, value.license, value.license?.name, value.license?.label, value.rights, 'Licence not specified'))
  const resources = resourcesFor(value)
  if (resources.length === 0 && value.links && typeof value.links === 'object') {
    const links = Object.values(value.links).flatMap((link) => Array.isArray(link) ? link : [link])
    resources.push(...links.filter((link) => typeof link === 'string' && /^https?:\/\//i.test(link)).map((url) => ({ url, format: '', title: '' })))
  }
  const formats = [...new Set(resources.map((resource) => resource.format).filter(Boolean))]
  const metadataFormats = Object.values(value.metas?.default ?? {}).map(normalizeFormat).filter(Boolean)
  for (const format of metadataFormats) if (!formats.includes(format)) formats.push(format)
  if ((resources.some((resource) => /api/i.test(resource.url)) || value.has_records) && !formats.includes('API')) formats.push('API')
  if (formats.length === 0) formats.push('Metadata')
  const sourceUrl = first(value.url, value.landingPage, value.landing_page, value.homepage, value.dataset_url, value.links?.dataset, value.links?.html, source.url)
  const country = countryFor(source)
  const tags = tagsFor(value)
  const topic = inferTopic([title, description, tags.join(' ')].join(' '))
  const quality = scoreQuality(value, resources, license, description, publisher)
  const distributions = resources.slice(0, 6).map((resource) => ({
    format: resource.format || 'Link',
    url: resource.url,
    ...(resource.size ? { size: resource.size } : {}),
    status: 'unchecked',
  }))

  return {
    id: `${source.key}-${first(value.id, value.name, value.identifier, value.dataset_id, index)}`.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 120),
    title,
    description: description.slice(0, 500),
    publisher,
    catalog: source.name,
    ...country,
    topic,
    tags: tags.length ? tags : [topic],
    formats: formats.slice(0, 8),
    license,
    updated: cleanDate(first(value.metadata_modified, value.modified, value.updated, value.last_update, value.updated_at, value.metas?.default?.modified)),
    updateFrequency: 'Source-defined',
    spatialCoverage: country.country,
    ...(value.num_rows || value.records ? { recordCount: String(first(value.num_rows, value.records)) } : {}),
    quality,
    apiAvailable: formats.includes('API'),
    sourceUrl,
    distributions,
    schema: [],
    sampleRows: [],
  }
}

function recordsFor(payload, source) {
  if (Array.isArray(payload)) return payload
  if (source.kind === 'gouv') return asArray(first(payload.data, payload.results))
  if (source.kind === 'dane') return asArray(first(payload.data, payload.results, payload.items))
  if (source.kind === 'ods') return asArray(first(payload.results, payload.datasets, payload.data))
  if (source.kind === 'europa') return asArray(first(payload.result?.results, payload.result?.datasets, payload.result, payload.datasets, payload.results, payload.items, payload.data))
  return asArray(first(payload.result?.results, payload.result?.datasets, payload.result, payload.results, payload.data))
}

function requestUrl(source, offset) {
  const url = new URL(source.url)
  if (source.kind === 'ckan') {
    url.searchParams.set('rows', String(limit))
    url.searchParams.set('start', String(offset))
    url.searchParams.set('q', '*:*')
  } else if (source.kind === 'europa') {
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
  } else if (source.kind === 'ods') {
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
  } else if (source.kind === 'dane') {
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
  } else if (source.kind === 'gouv') {
    url.searchParams.set('page_size', String(limit))
    url.searchParams.set('page', String(Math.floor(offset / limit) + 1))
  }
  return url
}

async function fetchSource(source) {
  const normalized = []
  let offset = 0
  let previousSignature = ''

  while (true) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(requestUrl(source, offset), {
        signal: controller.signal,
        headers: { accept: 'application/json', 'user-agent': 'OpenEU-Lens/0.1 (+https://github.com/Darosaot/open_data)' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json()
      const records = recordsFor(payload, source)
      if (records.length === 0) break

      const signature = records.slice(0, 2).map((record) => first(record.id, record.name, record.identifier, record.dataset_id, record.title)).join('|')
      if (signature && signature === previousSignature) break
      previousSignature = signature

      const remaining = maxRecords > 0 ? maxRecords - normalized.length : records.length
      normalized.push(...records.slice(0, Math.max(0, remaining)).map((record, index) => normalizeRecord(record, source, offset + index)))
      const total = Number(first(payload.result?.count, payload.count, payload.total, payload.totalCount))
      if (records.length < limit || (Number.isFinite(total) && total > 0 && offset + records.length >= total)) break
      if (maxRecords > 0 && normalized.length >= maxRecords) break
      offset += records.length
    } finally {
      clearTimeout(timeout)
    }
  }

  return normalized
}

await mkdir(dirname(outputFile), { recursive: true })
const results = await Promise.all(sources.map(async (source) => {
  try {
    const records = await fetchSource(source)
    console.log(`✓ ${source.name}: ${records.length} records`)
    return { source, records, status: { source: source.name, status: 'ok', records: records.length } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`! ${source.name}: ${message}`)
    return { source, records: [], status: { source: source.name, status: 'failed', error: message } }
  }
}))

const allDatasets = results.flatMap((result) => result.records)
const status = results.map((result) => result.status)

const deduped = [...new Map(allDatasets.map((dataset) => [dataset.id, dataset])).values()]
await writeFile(outputFile, `${JSON.stringify(deduped, null, 2)}\n`)
await writeFile(statusFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), sources: status, records: deduped.length }, null, 2)}\n`)
console.log(`Harvest complete: ${deduped.length} normalized records from ${sources.length} sources`)

if (deduped.length === 0 && process.env.CI === 'true') {
  throw new Error('No portal returned catalogue metadata; refusing to deploy demo data as a live catalogue.')
}
