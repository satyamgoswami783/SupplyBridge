import React, { useState } from 'react'
import { Plug, CheckCircle2, AlertCircle, Clock, Settings } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

const INTEGRATION_TYPES = [
  {
    id: 'api', label: 'REST API', emoji: '🔌', color: 'from-primary-500 to-violet-600',
    description: 'Connect via RESTful API endpoints with token or OAuth authentication.',
    activeCount: 8, features: ['Real-time sync', 'Webhook support', 'Rate limiting', 'OAuth 2.0']
  },
  {
    id: 'ftp', label: 'FTP', emoji: '📁', color: 'from-blue-500 to-cyan-600',
    description: 'Connect via FTP server to download product feeds and inventory files.',
    activeCount: 6, features: ['Scheduled pulls', 'CSV/XML files', 'Multiple directories', 'Passive mode']
  },
  {
    id: 'sftp', label: 'SFTP', emoji: '🔐', color: 'from-violet-500 to-purple-700',
    description: 'Secure file transfer via SSH protocol with key-based authentication.',
    activeCount: 3, features: ['SSH keys', 'Encrypted transfer', 'Scheduled pulls', 'PGP support']
  },
  {
    id: 'csv', label: 'CSV Feed', emoji: '📄', color: 'from-emerald-500 to-teal-600',
    description: 'Process CSV product files from URL or uploaded directly to the system.',
    activeCount: 5, features: ['Custom delimiters', 'Column mapping', 'Auto-detect headers', 'UTF-8/Latin1']
  },
  {
    id: 'excel', label: 'Excel', emoji: '📊', color: 'from-green-500 to-emerald-600',
    description: 'Import product data from Excel spreadsheets (.xlsx, .xls formats).',
    activeCount: 2, features: ['Multi-sheet support', 'Column mapping', 'Formula evaluation', '.xlsx & .xls']
  },
  {
    id: 'xml', label: 'XML Feed', emoji: '📋', color: 'from-amber-500 to-orange-600',
    description: 'Parse XML product feeds from URLs or file uploads with XPath mapping.',
    activeCount: 3, features: ['XPath mapping', 'Namespace support', 'Scheduled pulls', 'Large file streaming']
  },
]

export const Integrations: React.FC = () => {
  const [configOpen, setConfigOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<typeof INTEGRATION_TYPES[0] | null>(null)

  const openConfig = (type: typeof INTEGRATION_TYPES[0]) => {
    setSelectedType(type)
    setConfigOpen(true)
  }

  return (
    <div>
      <SectionHeader
        title="Integrations"
        subtitle="Configure and manage supplier connection types"
      />

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { label: 'Total Active', value: INTEGRATION_TYPES.reduce((s, t) => s + t.activeCount, 0), color: 'text-primary-600' },
          { label: 'API Connections', value: 8,  color: 'text-violet-600' },
          { label: 'FTP/SFTP',       value: 9,  color: 'text-cyan-600' },
          { label: 'File-based',     value: 10, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="card px-5 py-4 flex items-center gap-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {INTEGRATION_TYPES.map(type => (
          <div key={type.id} className="card p-5 hover:shadow-card-md transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-sm`}>
                {type.emoji}
              </div>
              <Badge variant="success" dot>{type.activeCount} active</Badge>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">{type.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{type.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {type.features.map(f => (
                <span key={f} className="text-2xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{f}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => openConfig(type)} className="btn-primary btn-sm flex-1">
                <Settings size={12} /> Configure
              </button>
              <button className="btn-secondary btn-sm">
                <CheckCircle2 size={12} /> Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Integration Activity */}
      <div className="card p-5 mt-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Integration Events</h3>
        <div className="space-y-3">
          {[
            { type: 'API', supplier: 'TechParts International', event: 'Successful connection test', time: '5 min ago', ok: true },
            { type: 'FTP', supplier: 'AcmeDistributors', event: 'Authentication failed — wrong credentials', time: '23 min ago', ok: false },
            { type: 'XML', supplier: 'PrimeSupply Corp', event: 'Feed imported — 11,200 products', time: '28 min ago', ok: true },
            { type: 'API', supplier: 'NovaTech Supplies', event: 'Rate limit warning — 4800/5000 req/hr', time: '1 hr ago', ok: false },
            { type: 'SFTP', supplier: 'QuickShip LLC', event: 'Daily file download completed', time: '5 hr ago', ok: true },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <Badge variant="info">{ev.type}</Badge>
              <span className="text-sm text-slate-700 flex-1">{ev.supplier} — {ev.event}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Config Modal */}
      {selectedType && (
        <Modal
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          title={`Configure ${selectedType.label} Integration`}
          subtitle="Set global defaults for all suppliers using this integration type"
          size="lg"
          footer={
            <>
              <button onClick={() => setConfigOpen(false)} className="btn-secondary">Cancel</button>
              <button className="btn-primary">Save Configuration</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center text-xl`}>
                {selectedType.emoji}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{selectedType.label}</p>
                <p className="text-xs text-slate-500">{selectedType.activeCount} suppliers using this integration</p>
              </div>
            </div>

            {selectedType.id === 'api' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Timeout (seconds)</label>
                  <input className="input" type="number" defaultValue="30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rate Limit (requests/hour)</label>
                  <input className="input" type="number" defaultValue="5000" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Retry Attempts</label>
                  <input className="input" type="number" defaultValue="3" />
                </div>
              </>
            )}

            {(selectedType.id === 'ftp' || selectedType.id === 'sftp') && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Connection Timeout (seconds)</label>
                  <input className="input" type="number" defaultValue="60" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Max File Size (MB)</label>
                  <input className="input" type="number" defaultValue="500" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="passive" className="rounded" defaultChecked />
                  <label htmlFor="passive" className="text-sm text-slate-700">Use Passive Mode</label>
                </div>
              </>
            )}

            {(selectedType.id === 'csv' || selectedType.id === 'excel') && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Delimiter</label>
                  <select className="select">
                    <option>Comma (,)</option>
                    <option>Semicolon (;)</option>
                    <option>Tab (\t)</option>
                    <option>Pipe (|)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Encoding</label>
                  <select className="select">
                    <option>UTF-8</option>
                    <option>Latin-1</option>
                    <option>Windows-1252</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Sync Schedule</label>
              <select className="select">
                <option>Every 6 hours</option>
                <option>Every 12 hours</option>
                <option>Daily at midnight</option>
                <option>Weekly</option>
                <option>Manual only</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
