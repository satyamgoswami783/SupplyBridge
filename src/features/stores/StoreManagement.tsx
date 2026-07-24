import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Store } from '../../types'

export const StoreManagement: React.FC = () => {
  const [storesList, setStoresList] = useState<Store[]>(mockStores)
  const [selected, setSelected] = useState<Store | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: 'Shift4Shop',
    region: 'North America',
    apiKey: '',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleSyncStore = (id: string, name: string) => {
    setSyncingStoreId(id)
    setStoresList(prev =>
      prev.map(s => (s.id === id ? { ...s, syncStatus: 'syncing' } : s))
    )

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, syncStatus: 'synced', status: 'active', lastSync: new Date().toISOString() }
            : s
        )
      )
      setSyncingStoreId(null)
      showNotification(`Store "${name}" catalog synchronized successfully!`)
    }, 1500)
  }

  const handleCreateStore = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please enter Store Name and URL.')
      return
    }

    const created: Store = {
      id: `store_${Date.now()}`,
      name: formData.name,
      url: formData.url,
      platform: formData.platform,
      region: formData.region,
      status: 'active',
      syncStatus: 'synced',
      productCount: 0,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    setStoresList([created, ...storesList])
    setAddOpen(false)
    setFormData({ name: '', url: '', platform: 'Shift4Shop', region: 'North America', apiKey: '' })
    showNotification(`Store "${created.name}" connected!`)
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
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
        title="Store Management"
        subtitle="Manage Shift4Shop websites and multi-store catalog synchronization status"
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Store Connection
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Stores', value: storesList.length, color: 'text-slate-800' },
          { label: 'Active', value: storesList.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Synced', value: storesList.filter(s => s.syncStatus === 'synced').length, color: 'text-primary-600' },
          { label: 'Issues', value: storesList.filter(s => s.status === 'error' || s.syncStatus === 'failed').length, color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {storesList.map(store => {
          const isSyncingThis = syncingStoreId === store.id || store.syncStatus === 'syncing'

          return (
            <div
              key={store.id}
              className="card p-5 hover:shadow-card-md transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => setSelected(store)}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        store.status === 'active'
                          ? 'bg-emerald-50 border-emerald-200'
                          : store.status === 'error'
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Globe
                        size={18}
                        className={
                          store.status === 'active'
                            ? 'text-emerald-600'
                            : store.status === 'error'
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{store.name}</p>
                      <p className="text-xs text-slate-400">{store.platform}</p>
                    </div>
                  </div>
                  <Badge variant={statusToVariant(store.syncStatus)} dot>
                    {store.syncStatus}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Assigned Products</span>
                    <span className="font-semibold text-slate-800">
                      {store.productCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Store Region</span>
                    <span className="text-slate-700 font-medium">{store.region || '—'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Last Sync Date</span>
                    <span className="text-slate-500 font-mono">
                      {store.lastSync ? timeAgo(store.lastSync) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  disabled={isSyncingThis}
                  className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
                  onClick={e => {
                    e.stopPropagation()
                    handleSyncStore(store.id, store.name)
                  }}
                >
                  <RefreshCw size={12} className={isSyncingThis ? 'animate-spin' : ''} />
                  {isSyncingThis ? 'Syncing...' : 'Sync Catalog'}
                </button>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm flex items-center justify-center"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Store Detail Modal */}
      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.name}
          subtitle={selected.url}
          size="lg"
          footer={
            <>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              <button
                onClick={() => handleSyncStore(selected.id, selected.name)}
                className="btn-primary flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Sync Catalog Now
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Platform', value: selected.platform },
                { label: 'Status', value: <Badge variant={statusToVariant(selected.status)}>{selected.status}</Badge> },
                { label: 'Sync Status', value: <Badge variant={statusToVariant(selected.syncStatus)}>{selected.syncStatus}</Badge> },
                { label: 'Assigned Products', value: selected.productCount.toLocaleString() },
                { label: 'Region', value: selected.region || '—' },
                { label: 'Last Sync', value: selected.lastSync ? timeAgo(selected.lastSync) : 'Never' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 font-medium">{item.label}</p>
                  <div className="text-sm font-semibold text-slate-800">{item.value}</div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Store Endpoint URL</p>
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl font-mono text-xs">
                <code className="text-slate-700 flex-1">{selected.url}</code>
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn-icon">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Store Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Store Connection"
        subtitle="Connect a Shift4Shop storefront to SupplyBridge PIM"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateStore} className="btn-primary">Connect Store</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Store Name *</label>
            <input
              className="input"
              placeholder="e.g. SupplyBridge EU Store"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Store URL *</label>
            <input
              className="input"
              placeholder="https://yourstore.3dcart.com"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Platform</label>
            <select
              className="select"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value })}
            >
              <option value="Shift4Shop">Shift4Shop (3dcart)</option>
              <option value="Custom API">Custom Store API</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Region</label>
            <select
              className="select"
              value={formData.region}
              onChange={e => setFormData({ ...formData, region: e.target.value })}
            >
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">REST API Key *</label>
            <input
              className="input font-mono text-xs"
              type="password"
              placeholder="Shift4Shop API key token"
              value={formData.apiKey}
              onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
