import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plug, Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck,
  Play, Settings, FileCode, Sliders, Globe, Server, Key, Clock, Activity, ArrowRight, Eye
} from 'lucide-react'
import { SectionHeader, FilterBar, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { MappingRuleEngineModal, DEFAULT_MAPPING_RULES } from './MappingRuleEngine'
import type { SupplierFeedConfig, ConnectionType, MappingRule } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useSuppliers } from '../../context/SupplierContext'

const PROTOCOL_BADGES: Record<ConnectionType, string> = {
  api: 'REST API',
  ftp: 'FTP Feed',
  sftp: 'SFTP Encrypted',
  soap: 'SOAP XML Gateway',
  csv: 'CSV Feed File',
  excel: 'Excel Upload',
  xml: 'XML Feed Document'
}

export const SupplierFeedMapping: React.FC = () => {
  const { role } = useAuth()
  const { suppliersList } = useSuppliers()
  const canEdit = role === 'platform_owner' || role === 'administrator' || role === 'integration_manager' || role === 'super_admin' || role === 'admin'

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliersList[0]?.id || 's_techparts')
  const [activeTab, setActiveTab] = useState<'config' | 'mapping' | 'transform' | 'history' | 'health'>('mapping')

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [previewPayloadModal, setPreviewPayloadModal] = useState(false)

  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(DEFAULT_MAPPING_RULES)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const selectedSupplier = suppliersList.find(s => s.id === selectedSupplierId) || suppliersList[0]

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRunConnectionTest = () => {
    setIsTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setIsTesting(false)
      setTestResult('Connection Handshake Verified! HTTP 200 OK — Auth Credentials Accepted.')
      showNotification(`Connection test passed for ${selectedSupplier?.name}`)
    }, 1500)
  }

  const handleRetryFailedImport = () => {
    showNotification(`Re-queueing failed feed import job for ${selectedSupplier?.name}...`)
    setTimeout(() => {
      showNotification(`Import dry-run re-queued successfully!`)
    }, 1200)
  }

  // Field Mapping State
  const [fieldMappings, setFieldMappings] = useState([
    { id: 'm1', rawField: 'supplier_sku', pimAttr: 'masterSku', type: 'direct', status: 'mapped', sample: 'TP-PROC-7950X' },
    { id: 'm2', rawField: 'raw_price', pimAttr: 'costPrice', type: 'currency_convert', status: 'mapped', sample: '499.00 USD' },
    { id: 'm3', rawField: 'qty_on_hand', pimAttr: 'supplierStock', type: 'direct', status: 'mapped', sample: '450' },
    { id: 'm4', rawField: 'upc_barcode', pimAttr: 'upc', type: 'regex_clean', status: 'mapped', sample: '012345678905' },
    { id: 'm5', rawField: 'weight_g', pimAttr: 'weight', type: 'unit_convert', status: 'pending', sample: '850 g -> 0.85 kg' },
  ])

  return (
    <div className="relative space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Supplier Middleware Feed & Schema Configuration"
        subtitle="Configure protocol handshakes, authentication, column-to-PIM attribute matrix, and transformation pipelines per supplier"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewPayloadModal(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <FileCode size={14} /> Preview Raw Payload
            </button>
            <button
              onClick={handleRunConnectionTest}
              disabled={isTesting}
              className="btn-primary btn-sm flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
              {isTesting ? 'Pinging Endpoint...' : 'Test Connection'}
            </button>
          </div>
        }
      />

      {/* Supplier Selector Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Plug size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">{selectedSupplier?.name}</span>
              <Badge variant="primary">{PROTOCOL_BADGES[selectedSupplier?.connectionType || 'api']}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Code: {selectedSupplier?.code} · Protocol: {selectedSupplier?.connectionType?.toUpperCase()} · Feed Health: 98.6%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-2xs text-slate-400 font-bold uppercase">Select Supplier:</label>
          <select
            className="select bg-slate-800 text-slate-100 border-slate-700 text-xs py-1.5"
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
          >
            {suppliersList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.connectionType.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test Connection Banner */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{testResult}</span>
        </motion.div>
      )}

      {/* Config Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'mapping', label: 'Field Mapping Matrix' },
          { id: 'config', label: 'Protocol & Auth Config' },
          { id: 'transform', label: 'Transformation Rules' },
          { id: 'history', label: 'Import History & Retries' },
          { id: 'health', label: 'Feed Health Diagnostics' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. FIELD MAPPING MATRIX */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                    <th className="whitespace-nowrap px-4 py-3.5">RAW SUPPLIER FIELD</th>
                    <th className="whitespace-nowrap px-4 py-3.5">SAMPLE VALUE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">TRANSFORMATION</th>
                    <th className="whitespace-nowrap px-4 py-3.5">TARGET MASTER PIM ATTRIBUTE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fieldMappings.map(fm => (
                    <tr key={fm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {fm.rawField}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-2xs text-slate-500 dark:text-slate-400">
                        {fm.sample}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="neutral">{fm.type}</Badge>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        → {fm.pimAttr}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={fm.status === 'mapped' ? 'success' : 'warning'} dot>
                          {fm.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROTOCOL & AUTH CONFIG */}
      {activeTab === 'config' && (
        <div className="card p-5 space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Endpoint Authentication & Connection Credentials</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Server Endpoint URL</label>
              <input type="text" className="input font-mono text-xs" defaultValue="https://api.techparts.com/v2/products/feed" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Auth Strategy</label>
              <select className="select text-xs">
                <option value="api_key">API Key (Header: X-API-Token)</option>
                <option value="bearer">Bearer Token (OAuth2)</option>
                <option value="basic">Basic Auth (Username / Password)</option>
                <option value="ssh">SSH Key Pair (SFTP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Cron Sync Schedule</label>
              <input type="text" className="input font-mono text-xs" defaultValue="0 */2 * * *" />
              <span className="text-2xs text-slate-400 block mt-1">Runs automatically every 2 hours</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">File Encoding & Delimiter</label>
              <input type="text" className="input font-mono text-xs" defaultValue="UTF-8 · Comma (,)" />
            </div>
          </div>
        </div>
      )}

      {/* 3. TRANSFORMATION RULES */}
      {activeTab === 'transform' && (
        <div className="card p-5 space-y-3 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Configured Field Transformation Rules</h3>
            <button onClick={() => setRuleEngineOpen(true)} className="btn-secondary btn-sm flex items-center gap-1">
              <Sliders size={13} /> Open Rule Engine
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span>TR-01: Trim Whitespace & Uppercase Product SKUs</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span>TR-02: Convert USD Pricing to CAD (+1.35 Exchange Rate Scale)</span>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>
      )}

      {/* 4. IMPORT HISTORY & RETRIES */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={handleRetryFailedImport} className="btn-secondary btn-sm flex items-center gap-1.5 text-rose-600 border-rose-200">
              <RefreshCw size={13} /> Retry Failed Feed Import
            </button>
          </div>

          <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                    <th className="whitespace-nowrap px-4 py-3.5">IMPORT ID</th>
                    <th className="whitespace-nowrap px-4 py-3.5">TIMESTAMP</th>
                    <th className="whitespace-nowrap px-4 py-3.5">RECORD COUNT</th>
                    <th className="whitespace-nowrap px-4 py-3.5">PARSED CLEAN</th>
                    <th className="whitespace-nowrap px-4 py-3.5">FAILED RECORDS</th>
                    <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold">IMP_9921</td>
                    <td className="px-4 py-3.5 font-mono text-2xs text-slate-500">2026-07-27 10:30:00</td>
                    <td className="px-4 py-3.5 font-bold text-xs">4,520 SKUs</td>
                    <td className="px-4 py-3.5 font-bold text-xs text-emerald-600">4,520 (100%)</td>
                    <td className="px-4 py-3.5 font-bold text-xs text-slate-400">0</td>
                    <td className="px-4 py-3.5"><Badge variant="success">Completed</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. FEED HEALTH DIAGNOSTICS */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Feed Uptime Score</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">99.8%</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Avg Latency Handshake</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">42 ms</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">HTTP Error Rate</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">0.02%</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Last Validation Audit</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">Clean</p>
          </div>
        </div>
      )}

      {/* Payload Preview Modal */}
      {previewPayloadModal && (
        <Modal
          open
          onClose={() => setPreviewPayloadModal(false)}
          title={`Raw Feed Payload: ${selectedSupplier?.name}`}
          subtitle={`Protocol: ${selectedSupplier?.connectionType?.toUpperCase()}`}
          size="lg"
        >
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
{`{
  "supplier_code": "TP-8420",
  "supplier_sku": "TP-PROC-7950X",
  "name": "AMD Ryzen 9 7950X 16-Core Processor",
  "raw_price": 599.00,
  "currency": "USD",
  "qty_on_hand": 450,
  "upc_barcode": "012345678905",
  "attributes": {
    "cores": 16,
    "threads": 32,
    "socket": "AM5"
  }
}`}
          </pre>
        </Modal>
      )}

      {/* Rule Engine Modal */}
      <MappingRuleEngineModal
        open={ruleEngineOpen}
        onClose={() => setRuleEngineOpen(false)}
        rules={mappingRules}
        onSaveRules={setMappingRules}
        onNotify={showNotification}
      />
    </div>
  )
}
