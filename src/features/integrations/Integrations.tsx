import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plug, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw, Plus, Check, Globe, Database, FileText } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface IntegrationType {
  id: string
  label: string
  emoji: string
  color: string
  description: string
  activeCount: number
  features: string[]
  timeoutSec: number
  rateLimitHr: number
  retries: number
  schedule: string
  delimiter?: string
  encoding?: string
}

const INITIAL_TYPES: IntegrationType[] = [
  {
    id: 'api', label: 'REST API', emoji: '🔌', color: 'from-primary-500 to-violet-600',
    description: 'Connect via RESTful API endpoints with token or OAuth authentication.',
    activeCount: 8, features: ['Real-time sync', 'Webhook support', 'Rate limiting', 'OAuth 2.0'],
    timeoutSec: 30, rateLimitHr: 5000, retries: 3, schedule: 'Every 6 hours'
  },
  {
    id: 'ftp', label: 'FTP', emoji: '📁', color: 'from-blue-500 to-cyan-600',
    description: 'Connect via FTP server to download product feeds and inventory files.',
    activeCount: 6, features: ['Scheduled pulls', 'CSV/XML files', 'Multiple directories', 'Passive mode'],
    timeoutSec: 60, rateLimitHr: 2000, retries: 3, schedule: 'Every 12 hours'
  },
  {
    id: 'sftp', label: 'SFTP', emoji: '🔐', color: 'from-violet-500 to-purple-700',
    description: 'Secure file transfer via SSH protocol with key-based authentication.',
    activeCount: 3, features: ['SSH keys', 'Encrypted transfer', 'Scheduled pulls', 'PGP support'],
    timeoutSec: 60, rateLimitHr: 2000, retries: 3, schedule: 'Daily at midnight'
  },
  {
    id: 'csv', label: 'CSV Feed', emoji: '📄', color: 'from-emerald-500 to-teal-600',
    description: 'Process CSV product files from URL or uploaded directly to the system.',
    activeCount: 5, features: ['Custom delimiters', 'Column mapping', 'Auto-detect headers', 'UTF-8/Latin1'],
    timeoutSec: 45, rateLimitHr: 1000, retries: 2, schedule: 'Every 6 hours', delimiter: 'Comma (,)', encoding: 'UTF-8'
  },
  {
    id: 'excel', label: 'Excel', emoji: '📊', color: 'from-green-500 to-emerald-600',
    description: 'Import product data from Excel spreadsheets (.xlsx, .xls formats).',
    activeCount: 2, features: ['Multi-sheet support', 'Column mapping', 'Formula evaluation', '.xlsx & .xls'],
    timeoutSec: 45, rateLimitHr: 1000, retries: 2, schedule: 'Manual only', encoding: 'UTF-8'
  },
  {
    id: 'xml', label: 'XML Feed', emoji: '📋', color: 'from-amber-500 to-orange-600',
    description: 'Parse XML product feeds from URLs or file uploads with XPath mapping.',
    activeCount: 3, features: ['XPath mapping', 'Namespace support', 'Scheduled pulls', 'Large file streaming'],
    timeoutSec: 90, rateLimitHr: 1000, retries: 3, schedule: 'Every 12 hours', encoding: 'UTF-8'
  },
]

export const Integrations: React.FC = () => {
  const [typesList, setTypesList] = useState<IntegrationType[]>(INITIAL_TYPES)
  const [configOpen, setConfigOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null)
  
  // Test loading state per integration id
  const [testingId, setTestingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form config state
  const [configForm, setConfigForm] = useState({
    timeoutSec: 30,
    rateLimitHr: 5000,
    retries: 3,
    schedule: 'Every 6 hours',
    delimiter: 'Comma (,)',
    encoding: 'UTF-8',
  })

  // Recent events state
  const [events, setEvents] = useState([
    { id: 'ev1', type: 'API', supplier: 'TechParts International', event: 'Successful connection test (200 OK)', time: 'Just now', ok: true },
    { id: 'ev2', type: 'FTP', supplier: 'AcmeDistributors', event: 'Authentication failed — wrong credentials', time: '23 min ago', ok: false },
    { id: 'ev3', type: 'XML', supplier: 'PrimeSupply Corp', event: 'Feed imported — 11,200 products', time: '28 min ago', ok: true },
    { id: 'ev4', type: 'API', supplier: 'NovaTech Supplies', event: 'Rate limit warning — 4800/5000 req/hr', time: '1 hr ago', ok: false },
    { id: 'ev5', type: 'SFTP', supplier: 'QuickShip LLC', event: 'Daily file download completed', time: '5 hr ago', ok: true },
  ])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const openConfig = (type: IntegrationType) => {
    setSelectedType(type)
    setConfigForm({
      timeoutSec: type.timeoutSec,
      rateLimitHr: type.rateLimitHr,
      retries: type.retries,
      schedule: type.schedule,
      delimiter: type.delimiter || 'Comma (,)',
      encoding: type.encoding || 'UTF-8',
    })
    setConfigOpen(true)
  }

  const handleSaveConfig = () => {
    if (!selectedType) return

    setTypesList(prev =>
      prev.map(t => {
        if (t.id === selectedType.id) {
          return {
            ...t,
            timeoutSec: Number(configForm.timeoutSec),
            rateLimitHr: Number(configForm.rateLimitHr),
            retries: Number(configForm.retries),
            schedule: configForm.schedule,
            delimiter: configForm.delimiter,
            encoding: configForm.encoding,
          }
        }
        return t
      })
    )

    setConfigOpen(false)
    showNotification(`${selectedType.label} global parameters saved successfully!`)
  }

  const handleTestProtocol = (type: IntegrationType) => {
    setTestingId(type.id)

    setTimeout(() => {
      setTestingId(null)
      const newEvent = {
        id: `ev_${Date.now()}`,
        type: type.label,
        supplier: 'System Health Check',
        event: `${type.label} protocol test passed — HTTP 200 OK`,
        time: 'Just now',
        ok: true,
      }
      setEvents([newEvent, ...events])
      showNotification(`${type.label} integration protocol test passed! Connection operational.`)
    }, 1400)
  }

  const filteredTypes = typesList.filter(t => {
    if (filterCategory === 'api') return t.id === 'api'
    if (filterCategory === 'ftp') return t.id === 'ftp' || t.id === 'sftp'
    if (filterCategory === 'file') return t.id === 'csv' || t.id === 'excel' || t.id === 'xml'
    return true
  })

  return (
    <div className="relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Integrations"
        subtitle="Configure and manage supplier connection protocols & middleware parameters"
        actions={
          <button
            onClick={() => {
              showNotification('Integration protocol status refreshed.')
            }}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
        }
      />

      {/* Summary Interactive Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { key: 'all',  label: 'Total Active Connections', value: typesList.reduce((s, t) => s + t.activeCount, 0), color: 'text-primary-600', bg: 'bg-primary-50/40' },
          { key: 'api',  label: 'API Connections',          value: typesList.find(t => t.id === 'api')?.activeCount || 8,  color: 'text-violet-600',  bg: 'bg-violet-50/40' },
          { key: 'ftp',  label: 'FTP / SFTP',               value: (typesList.find(t => t.id === 'ftp')?.activeCount || 6) + (typesList.find(t => t.id === 'sftp')?.activeCount || 3),  color: 'text-cyan-600',    bg: 'bg-cyan-50/40' },
          { key: 'file', label: 'File-based (CSV/Excel/XML)', value: (typesList.find(t => t.id === 'csv')?.activeCount || 5) + (typesList.find(t => t.id === 'excel')?.activeCount || 2) + (typesList.find(t => t.id === 'xml')?.activeCount || 3), color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilterCategory(s.key)}
            className={`card px-5 py-4 flex items-center gap-3 cursor-pointer transition-all ${filterCategory === s.key ? 'ring-2 ring-primary-500 bg-white shadow-md' : 'hover:border-slate-300'}`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTypes.map(type => {
          const isTestingThis = testingId === type.id

          return (
            <div key={type.id} className="card p-5 hover:shadow-card-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-sm text-white`}>
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
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openConfig(type)}
                  className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
                >
                  <Settings size={13} /> Configure
                </button>
                <button
                  onClick={() => handleTestProtocol(type)}
                  disabled={isTestingThis}
                  className="btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} className={isTestingThis ? 'animate-spin text-emerald-600' : ''} />
                  {isTestingThis ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Integration Activity */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Recent Integration Events</h3>
          <button
            onClick={() => setEvents(events.slice(0, 3))}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear Old Events
          </button>
        </div>
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <Badge variant="info">{ev.type}</Badge>
              <span className="text-sm text-slate-700 flex-1 font-medium">{ev.supplier} — <span className="text-slate-500 font-normal">{ev.event}</span></span>
              <span className="text-xs text-slate-400 flex-shrink-0 font-mono">{ev.time}</span>
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
          subtitle="Set global defaults & parameters for all suppliers using this integration protocol"
          size="lg"
          footer={
            <>
              <button onClick={() => setConfigOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveConfig} className="btn-primary">Save Configuration</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center text-xl text-white`}>
                {selectedType.emoji}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{selectedType.label}</p>
                <p className="text-xs text-slate-500">{selectedType.activeCount} suppliers active on this protocol</p>
              </div>
            </div>

            {selectedType.id === 'api' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Timeout (seconds)</label>
                  <input
                    className="input"
                    type="number"
                    value={configForm.timeoutSec}
                    onChange={e => setConfigForm({ ...configForm, timeoutSec: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rate Limit (requests/hour)</label>
                  <input
                    className="input"
                    type="number"
                    value={configForm.rateLimitHr}
                    onChange={e => setConfigForm({ ...configForm, rateLimitHr: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Retry Attempts</label>
                  <input
                    className="input"
                    type="number"
                    value={configForm.retries}
                    onChange={e => setConfigForm({ ...configForm, retries: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {(selectedType.id === 'ftp' || selectedType.id === 'sftp') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Connection Timeout (seconds)</label>
                  <input
                    className="input"
                    type="number"
                    value={configForm.timeoutSec}
                    onChange={e => setConfigForm({ ...configForm, timeoutSec: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Max File Size Limit (MB)</label>
                  <input className="input" type="number" defaultValue="500" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="passive" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                  <label htmlFor="passive" className="text-xs text-slate-700 font-medium">Use Passive Mode for FTP Transfers</label>
                </div>
              </div>
            )}

            {(selectedType.id === 'csv' || selectedType.id === 'excel' || selectedType.id === 'xml') && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Delimiter</label>
                  <select
                    className="select"
                    value={configForm.delimiter}
                    onChange={e => setConfigForm({ ...configForm, delimiter: e.target.value })}
                  >
                    <option>Comma (,)</option>
                    <option>Semicolon (;)</option>
                    <option>Tab (\t)</option>
                    <option>Pipe (|)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">File Encoding</label>
                  <select
                    className="select"
                    value={configForm.encoding}
                    onChange={e => setConfigForm({ ...configForm, encoding: e.target.value })}
                  >
                    <option>UTF-8</option>
                    <option>Latin-1</option>
                    <option>Windows-1252</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Automated Sync Schedule</label>
              <select
                className="select"
                value={configForm.schedule}
                onChange={e => setConfigForm({ ...configForm, schedule: e.target.value })}
              >
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
