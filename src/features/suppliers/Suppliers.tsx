import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, MoreVertical, Plug, ExternalLink, AlertCircle, CheckCircle2, Wifi, WifiOff, RotateCcw } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { SectionHeader, FilterBar, EmptyState, HealthIndicator, ProgressBar } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { mockSuppliers } from '../../data/mockData'
import { statusToVariant, connectionTypeLabel, formatDateTime, timeAgo } from '../../utils'
import type { Supplier, ConnectionType } from '../../types'

const CONNECTION_TYPES: { value: ConnectionType; label: string }[] = [
  { value: 'api',   label: 'REST API' },
  { value: 'ftp',   label: 'FTP' },
  { value: 'sftp',  label: 'SFTP' },
  { value: 'csv',   label: 'CSV Feed' },
  { value: 'excel', label: 'Excel' },
  { value: 'xml',   label: 'XML Feed' },
]

const connTypeIcon: Record<ConnectionType, string> = {
  api: '🔌', ftp: '📁', sftp: '🔐', csv: '📄', excel: '📊', xml: '📋'
}

export const Suppliers: React.FC = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [newSupplier, setNewSupplier] = useState({ name: '', code: '', contactName: '', contactEmail: '', country: '', connectionType: 'api' as ConnectionType })

  const filtered = mockSuppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchType   = typeFilter === 'all' || s.connectionType === typeFilter
    return matchSearch && matchStatus && matchType
  })

  return (
    <div>
      <SectionHeader
        title="Suppliers"
        subtitle={`${mockSuppliers.length} suppliers configured — ${mockSuppliers.filter(s => s.status === 'connected').length} connected`}
        actions={
          <>
            <button className="btn-secondary btn-sm"><RefreshCw size={14} /> Sync All</button>
            <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Supplier</button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Connected',    value: mockSuppliers.filter(s => s.status === 'connected').length,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Disconnected', value: mockSuppliers.filter(s => s.status === 'disconnected').length, color: 'text-slate-500',   bg: 'bg-slate-100' },
          { label: 'Error State',  value: mockSuppliers.filter(s => s.status === 'error').length,        color: 'text-rose-600',    bg: 'bg-rose-50' },
          { label: 'Syncing',      value: mockSuppliers.filter(s => s.status === 'syncing').length,      color: 'text-cyan-600',    bg: 'bg-cyan-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search suppliers...">
        <select className="select w-auto min-w-[130px] input-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="error">Error</option>
          <option value="syncing">Syncing</option>
        </select>
        <select className="select w-auto min-w-[130px] input-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {CONNECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </FilterBar>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Connection</th>
                <th>Status</th>
                <th>Products</th>
                <th>Last Sync</th>
                <th>Next Sync</th>
                <th>Errors</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">No suppliers found</td></tr>
              )}
              {filtered.map(supplier => (
                <motion.tr
                  key={supplier.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cursor-pointer"
                  onClick={() => setSelected(supplier)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-base">
                        {connTypeIcon[supplier.connectionType]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{supplier.name}</p>
                        <p className="text-xs text-slate-400">{supplier.code} · {supplier.country}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="info">{connectionTypeLabel(supplier.connectionType)}</Badge>
                  </td>
                  <td>
                    <Badge variant={statusToVariant(supplier.status)} dot>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-700">{supplier.productCount.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className="text-slate-500 text-xs">{supplier.lastSync ? timeAgo(supplier.lastSync) : '—'}</span>
                  </td>
                  <td>
                    <span className="text-slate-500 text-xs">{supplier.nextSync ? formatDateTime(supplier.nextSync) : '—'}</span>
                  </td>
                  <td>
                    {supplier.errorCount > 0
                      ? <Badge variant="danger">{supplier.errorCount} errors</Badge>
                      : <Badge variant="success">None</Badge>
                    }
                  </td>
                  <td>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" title="Manual Sync"><RefreshCw size={14} /></button>
                      <button className="btn-icon"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {filtered.length} of {mockSuppliers.length} suppliers</p>
          <div className="flex gap-1">
            <button className="btn-secondary btn-sm" disabled>Previous</button>
            <button className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Supplier"
        subtitle="Configure supplier connection and integration settings"
        size="lg"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button className="btn-primary">Create Supplier</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Name *</label>
              <input className="input" placeholder="e.g. TechParts International" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Code *</label>
              <input className="input" placeholder="e.g. TPI" value={newSupplier.code} onChange={e => setNewSupplier({...newSupplier, code: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Name</label>
              <input className="input" placeholder="Full name" value={newSupplier.contactName} onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Email *</label>
              <input className="input" type="email" placeholder="email@supplier.com" value={newSupplier.contactEmail} onChange={e => setNewSupplier({...newSupplier, contactEmail: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Country</label>
            <input className="input" placeholder="e.g. United States" value={newSupplier.country} onChange={e => setNewSupplier({...newSupplier, country: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Integration Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {CONNECTION_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setNewSupplier({...newSupplier, connectionType: t.value})}
                  className={`border rounded-xl p-3 text-center transition-all text-sm font-medium ${
                    newSupplier.connectionType === t.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-lg mb-1">{connTypeIcon[t.value]}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {newSupplier.connectionType === 'api' && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600">API Credentials</p>
              <input className="input" placeholder="API Endpoint URL" />
              <input className="input" placeholder="API Key" type="password" />
              <input className="input" placeholder="API Secret (optional)" type="password" />
            </div>
          )}
          {(newSupplier.connectionType === 'ftp' || newSupplier.connectionType === 'sftp') && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600">FTP Credentials</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><input className="input" placeholder="FTP Host" /></div>
                <input className="input" placeholder="Port" defaultValue="21" />
              </div>
              <input className="input" placeholder="Username" />
              <input className="input" placeholder="Password" type="password" />
              <input className="input" placeholder="Remote Path" />
            </div>
          )}
        </div>
      </Modal>

      {/* Supplier Detail Drawer/Modal */}
      {selected && <SupplierDetail supplier={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

const SupplierDetail: React.FC<{ supplier: Supplier; onClose: () => void }> = ({ supplier, onClose }) => {
  const [tab, setTab] = useState('overview')
  const tabs = ['overview', 'connection', 'credentials', 'history', 'activity', 'errors']

  return (
    <Modal open title={supplier.name} subtitle={`${supplier.code} · ${supplier.country}`} onClose={onClose} size="xl">
      <div className="flex gap-1 border-b border-slate-100 mb-5 overflow-x-auto scrollbar-hide -mx-6 px-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Connection Type', value: connectionTypeLabel(supplier.connectionType) },
            { label: 'Status', value: <Badge variant={statusToVariant(supplier.status)} dot>{supplier.status}</Badge> },
            { label: 'Product Count', value: supplier.productCount.toLocaleString() },
            { label: 'Error Count', value: supplier.errorCount },
            { label: 'Contact', value: supplier.contactName },
            { label: 'Email', value: supplier.contactEmail },
            { label: 'Last Sync', value: supplier.lastSync ? formatDateTime(supplier.lastSync) : '—' },
            { label: 'Next Sync', value: supplier.nextSync ? formatDateTime(supplier.nextSync) : '—' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1 font-medium">{item.label}</p>
              <div className="text-sm font-semibold text-slate-800">{item.value}</div>
            </div>
          ))}
          <div className="col-span-2 flex gap-2 pt-2">
            <button className="btn-primary btn-sm flex-1"><RefreshCw size={13} /> Manual Sync Now</button>
            <button className="btn-secondary btn-sm flex-1"><Plug size={13} /> Test Connection</button>
          </div>
        </div>
      )}

      {tab === 'connection' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Connection Active</p>
              <p className="text-xs text-emerald-600">Last verified {supplier.lastSync ? timeAgo(supplier.lastSync) : 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {supplier.credentials?.apiUrl && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wider mb-1">API Endpoint</p>
                <code className="text-xs text-slate-700 font-mono">{supplier.credentials.apiUrl}</code>
              </div>
            )}
          </div>
          <button className="btn-secondary btn-sm w-full"><Plug size={13} /> Run Connection Test</button>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {[
            { date: 'Jul 24, 05:30', products: 18420, status: 'success', duration: '28m' },
            { date: 'Jul 23, 23:30', products: 18410, status: 'success', duration: '31m' },
            { date: 'Jul 23, 17:30', products: 18380, status: 'warning', duration: '34m' },
            { date: 'Jul 23, 11:30', products: 18350, status: 'success', duration: '27m' },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
              <span className="text-slate-600">{h.date}</span>
              <span className="text-slate-800 font-medium">{h.products.toLocaleString()} products</span>
              <span className="text-slate-400">{h.duration}</span>
              <Badge variant={statusToVariant(h.status)}>{h.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === 'errors' && supplier.errorCount === 0 && (
        <div className="text-center py-12 text-slate-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
          <p className="font-medium">No errors for this supplier</p>
        </div>
      )}
    </Modal>
  )
}
