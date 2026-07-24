import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Store } from '../../types'

export const WebsiteSync: React.FC = () => {
  const [storesList, setStoresList] = useState<Store[]>(mockStores)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSyncAllStores = () => {
    setSyncingAll(true)
    setStoresList(prev => prev.map(s => ({ ...s, syncStatus: 'syncing' })))

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s => ({
          ...s,
          syncStatus: 'synced',
          status: 'active',
          lastSync: new Date().toISOString(),
        }))
      )
      setSyncingAll(false)
      showNotification('All Shift4Shop storefronts synchronized successfully!')
    }, 2000)
  }

  const handleSyncSingleStore = (id: string, name: string) => {
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
      showNotification(`Store "${name}" catalog sync complete!`)
    }, 1500)
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
        title="Website Synchronization"
        subtitle="Synchronize master catalog products, categories, stock, and prices to Shift4Shop storefronts"
        actions={
          <button
            onClick={handleSyncAllStores}
            disabled={syncingAll}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
            {syncingAll ? 'Syncing All Stores...' : 'Sync All Stores'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {storesList.map(store => {
          const isSyncingThis = syncingStoreId === store.id || syncingAll || store.syncStatus === 'syncing'

          return (
            <div key={store.id} className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                      <Globe size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{store.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{store.url}</p>
                    </div>
                  </div>
                  <Badge variant={statusToVariant(store.syncStatus)} dot>{store.syncStatus}</Badge>
                </div>

                <div className="space-y-2 mb-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Synced Catalog Products</span>
                    <span className="font-semibold text-slate-800">{store.productCount.toLocaleString()} SKUs</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Last Sync Date</span>
                    <span className="font-mono text-slate-500">{store.lastSync ? timeAgo(store.lastSync) : 'Never'}</span>
                  </div>
                </div>

                <ProgressBar
                  value={
                    store.syncStatus === 'synced'
                      ? 100
                      : store.syncStatus === 'syncing'
                      ? 65
                      : store.syncStatus === 'pending'
                      ? 0
                      : 25
                  }
                  color={store.syncStatus === 'synced' ? 'emerald' : store.syncStatus === 'failed' ? 'rose' : 'primary'}
                  showLabel
                  className="mb-4"
                />
              </div>

              <button
                disabled={isSyncingThis}
                onClick={() => handleSyncSingleStore(store.id, store.name)}
                className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} className={isSyncingThis ? 'animate-spin' : ''} />
                {isSyncingThis ? 'Syncing...' : `Sync ${store.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
