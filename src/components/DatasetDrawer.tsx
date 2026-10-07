import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Code2,
  Database,
  FileJson,
  Link2,
  ShieldCheck,
  Table2,
  X,
} from 'lucide-react'
import type { Dataset } from '../types'
import { QualityRing } from './QualityRing'

interface DatasetDrawerProps {
  dataset: Dataset | null
  onClose: () => void
}

type Tab = 'preview' | 'schema' | 'code'

const qualityLabels: Array<[keyof Dataset['quality'], string]> = [
  ['metadata', 'Metadata'],
  ['freshness', 'Freshness'],
  ['accessibility', 'Access'],
  ['openness', 'Openness'],
]

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-block">
      <button onClick={copy} aria-label="Copy code">
        {copied ? <Check size={15} /> : <Clipboard size={15} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>{code}</pre>
    </div>
  )
}

export function DatasetDrawer({ dataset, onClose }: DatasetDrawerProps) {
  const [tab, setTab] = useState<Tab>('preview')

  useEffect(() => {
    if (!dataset) return undefined
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.classList.add('drawer-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('drawer-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [dataset, onClose])

  useEffect(() => setTab('preview'), [dataset?.id])

  const examples = useMemo(() => {
    if (!dataset) return null
    const endpoint = dataset.distributions[0]?.url ?? dataset.sourceUrl
    return {
      curl: `curl --location '${endpoint}'`,
      python: `import requests\n\nresponse = requests.get('${endpoint}')\nresponse.raise_for_status()\ndata = response.json()\nprint(data)`,
      javascript: `const response = await fetch('${endpoint}');\nif (!response.ok) throw new Error('Request failed');\nconst data = await response.json();\nconsole.log(data);`,
    }
  }, [dataset])

  if (!dataset || !examples) return null

  const columns = dataset.schema.map((field) => field.name)

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Close dataset details" />
      <section className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer__header">
          <div className="drawer__source">
            <span className="country-mark">{dataset.flag}</span>
            <span>{dataset.publisher}</span>
            <span className="dot" />
            <span>{dataset.catalog}</span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close details">
            <X size={21} />
          </button>
        </header>

        <div className="drawer__body">
          <div className="drawer__intro">
            <div>
              <span className="topic-kicker">{dataset.topic}</span>
              <h2 id="drawer-title">{dataset.title}</h2>
              <p>{dataset.description}</p>
            </div>
            <QualityRing score={dataset.quality.overall} size="large" />
          </div>

          <div className="drawer__facts">
            <div><span>Updated</span><strong>{dataset.updated}</strong></div>
            <div><span>Frequency</span><strong>{dataset.updateFrequency}</strong></div>
            <div><span>Coverage</span><strong>{dataset.spatialCoverage}</strong></div>
            <div><span>Licence</span><strong>{dataset.license}</strong></div>
          </div>

          <section className="quality-panel" aria-labelledby="quality-title">
            <div className="quality-panel__head">
              <div>
                <ShieldCheck size={18} />
                <h3 id="quality-title">Usability check</h3>
              </div>
              <span>Prototype assessment</span>
            </div>
            <div className="quality-bars">
              {qualityLabels.map(([key, label]) => (
                <div className="quality-bar" key={key}>
                  <div><span>{label}</span><strong>{dataset.quality[key]}</strong></div>
                  <div className="quality-bar__track">
                    <span style={{ width: `${dataset.quality[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="drawer__tabs" role="tablist" aria-label="Dataset details">
            <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
              <Table2 size={15} /> Data preview
            </button>
            <button role="tab" aria-selected={tab === 'schema'} onClick={() => setTab('schema')}>
              <Database size={15} /> Schema
            </button>
            <button role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>
              <Code2 size={15} /> Use this data
            </button>
          </div>

          {tab === 'preview' && (
            <div className="data-table-wrap" role="tabpanel">
              <table>
                <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                <tbody>
                  {dataset.sampleRows.map((row, index) => (
                    <tr key={index}>{columns.map((column) => <td key={column}>{row[column]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              <p className="sample-note">Illustrative sample rows · Verify values at the authoritative source</p>
            </div>
          )}

          {tab === 'schema' && (
            <div className="schema-list" role="tabpanel">
              {dataset.schema.map((field) => (
                <div key={field.name}>
                  <FileJson size={16} />
                  <span><strong>{field.name}</strong><small>{field.description}</small></span>
                  <code>{field.type}</code>
                </div>
              ))}
            </div>
          )}

          {tab === 'code' && (
            <div className="code-examples" role="tabpanel">
              <p>Start from the publisher’s first listed distribution. Authentication or query parameters may be required.</p>
              <h4>cURL</h4>
              <CodeBlock code={examples.curl} />
              <h4>Python</h4>
              <CodeBlock code={examples.python} />
              <h4>JavaScript</h4>
              <CodeBlock code={examples.javascript} />
            </div>
          )}

          <div className="distribution-list">
            <h3>Available distributions</h3>
            {dataset.distributions.map((distribution, index) => (
              <a href={distribution.url} target="_blank" rel="noreferrer" key={`${distribution.format}-${index}`}>
                <span className="distribution-icon"><Link2 size={16} /></span>
                <span><strong>{distribution.format}</strong><small>{distribution.size ?? 'Online access'}</small></span>
                <span className={`status status--${distribution.status}`}>{distribution.status}</span>
                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>

          <a className="source-button" href={dataset.sourceUrl} target="_blank" rel="noreferrer">
            View authoritative source <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  )
}
