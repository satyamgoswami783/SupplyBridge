import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Store } from '../../types'

export const StoreManagement: React.FC = () => {
  const [storesList, setStoresList] = useState<Store[]>(mockStores)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [deletingStore, setDeletingStore] = useState<Store | null>(null)

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

  const handleOpenAdd = () => {
    setFormData({ name: '', url: '', platform: 'Shift4Shop', region: 'North America', apiKey: '' })
    setAddOpen(true)
  }

  const handleCreateStore = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please enter Store Name and URL.')
      return
    }

    const created: Store = {
      id: `store_${Date.now()}`,
      name: formData.name,
      url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
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
    showNotification(`Store "${created.name}" connected!`)
  }

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      url: store.url,
      platform: store.platform,
      region: store.region || 'North America',
      apiKey: '••••••••••••••••',
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingStore || !formData.name.trim() || !formData.url.trim()) return

    setStoresList(prev =>
      prev.map(s => {
        if (s.id === editingStore.id) {
          return {
            ...s,
            name: formData.name,
            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
            platform: formData.platform,
            region: formData.region,
          }
        }
        return s
      })
    )

    setEditOpen(false)
    setEditingStore(null)
    showNotification(`Store "${formData.name}" details updated!`)
  }

  const handleConfirmDelete = () => {
    if (!deletingStore) return

    setStoresList(prev => prev.filter(s => s.id !== deletingStore.id))
    showNotification(`Store "${deletingStore.name}" connection removed.`)
    setDeleteOpen(false)
    setDeletingStore(null)
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
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Store Connection
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Stores', value: storesList.length, color: 'text-slate-800' },
          { label: 'Active Stores', value: storesList.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Synced Stores', value: storesList.filter(s => s.syncStatus === 'synced').length, color: 'text-primary-600' },
          { label: 'Sync Issues', value: storesList.filter(s => s.status === 'error' || s.syncStatus === 'failed').length, color: 'text-rose-600' },
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
              className="card p-5 hover:shadow-card-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setSelectedStore(store)}
                  >
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
                      <p className="font-bold text-slate-800 text-sm hover:text-primary-600 transition-colors">
                        {store.name}
                      </p>
                      <p className="text-xs text-slate-400">{store.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={statusToVariant(store.syncStatus)} dot>
                      {store.syncStatus}
                    </Badge>
                    <button
                      onClick={() => handleOpenEdit(store)}
                      className="btn-icon text-slate-400 hover:text-slate-700"
                      title="Edit Store Settings"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => { setDeletingStore(store); setDeleteOpen(true); }}
                      className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove Store Connection"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  className="space-y-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer"
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Assigned Products</span>
                    <span className="font-semibold text-slate-800">
                      {store.productCount.toLocaleString()} SKUs
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

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  disabled={isSyncingThis}
                  className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
                  onClick={() => handleSyncStore(store.id, store.name)}
                >
                  <RefreshCw size={12} className={isSyncingThis ? 'animate-spin' : ''} />
                  {isSyncingThis ? 'Syncing...' : 'Sync Catalog'}
                </button>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm flex items-center justify-center"
                  title={`Open website: ${store.url}`}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Store Detail Modal */}
      {selectedStore && (
        <Modal
          open
          onClose={() => setSelectedStore(null)}
          title={selectedStore.name}
          subtitle={selectedStore.url}
          size="lg"
          footer={
            <>
              <button onClick={() => setSelectedStore(null)} className="btn-secondary">Close</button>
              <button
                onClick={() => handleSyncStore(selectedStore.id, selectedStore.name)}
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
                { label: 'Platform', value: selectedStore.platform },
                { label: 'Status', value: <Badge variant={statusToVariant(selectedStore.status)}>{selectedStore.status}</Badge> },
                { label: 'Sync Status', value: <Badge variant={statusToVariant(selectedStore.syncStatus)}>{selectedStore.syncStatus}</Badge> },
                { label: 'Assigned Products', value: `${selectedStore.productCount.toLocaleString()} SKUs` },
                { label: 'Region', value: selectedStore.region || '—' },
                { label: 'Last Sync', value: selectedStore.lastSync ? timeAgo(selectedStore.lastSync) : 'Never' },
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
                <code className="text-slate-700 flex-1">{selectedStore.url}</code>
                <a href={selectedStore.url} target="_blank" rel="noopener noreferrer" className="btn-icon">
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

      {/* Edit Store Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Store Settings"
        subtitle={`Updating settings for ${editingStore?.name}`}
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Store Name *</label>
            <input
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Store URL *</label>
            <input
              className="input"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
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
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Store Connection"
        message={`Are you sure you want to remove store connection "${deletingStore?.name}"?`}
        confirmLabel="Yes, Remove Store"
        danger
      />
    </div>
  )
}
