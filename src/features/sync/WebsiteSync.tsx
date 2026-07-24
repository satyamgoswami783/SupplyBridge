import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, CheckCircle2, XCircle, ShoppingCart, ExternalLink, ShieldCheck, Database, FileSpreadsheet, ArrowUpRight, Zap } from 'lucide-react'
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
      showNotification('All Shift4Shop storefronts synchronized via REST API v2!')
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
      showNotification(`Storefront "${name}" published via Shift4Shop API!`)
    }, 1500)
  }

  const handleExportCatalogCSV = () => {
    showNotification('Exporting Shift4Shop Storefront Catalog CSV...')
    const csvHeaders = 'Store ID,Storefront Name,URL,Sync Status,Product Count,Last Sync\n'
    const csvRows = storesList.map(s =>
      `"${s.id}","${s.name}","${s.url}","${s.syncStatus}",${s.productCount},"${s.lastSync || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Shift4Shop_Storefronts_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Shift4Shop Catalog CSV downloaded!')
  }

  return (
    <div className="space-y-6">
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
        title="Shift4Shop Website Synchronization (Phase 2)"
        subtitle="Publish master PIM products, taxonomy categories, pricing, and stock to Shift4Shop ecommerce storefronts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCatalogCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleSyncAllStores}
              disabled={syncingAll}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <RefreshCw size={14} className={syncingAll ? 'animate-spin text-white' : ''} />
              {syncingAll ? 'Publishing to Stores...' : 'Publish to All Storefronts'}
            </button>
          </div>
        }
      />

      {/* Phase 2 Architecture Specs Banner */}
      <div className="p-4 rounded-2xl bg-gradient-aurora text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white">Shift4Shop REST API v2 Publishing Gateway</h3>
            <p className="text-2xs text-cyan-200 font-medium">Official API Endpoint: <code className="mono">apirest.3dcart.com/v2/Products</code> • Token Authorized</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold">
          <ShieldCheck size={14} className="text-cyan-300" />
          <span>Centralized Store Management Active</span>
        </div>
      </div>

      {/* Storefront Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storesList.map(store => {
          const isSyncingThis = syncingStoreId === store.id || syncingAll || store.syncStatus === 'syncing'

          return (
            <div key={store.id} className="card p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 flex items-center justify-center">
                      <Globe size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        {store.name}
                        <a href={store.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-500">
                          <ExternalLink size={12} />
                        </a>
                      </p>
                      <p className="text-2xs text-slate-400 font-mono">{store.url}</p>
                    </div>
                  </div>
                  <Badge variant={statusToVariant(store.syncStatus)} dot>{store.syncStatus}</Badge>
                </div>

                <div className="space-y-2 mb-4 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Published Catalog Products</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{store.productCount.toLocaleString()} SKUs</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Category Hierarchy</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Taxonomy Mapped</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Last API Sync Date</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{store.lastSync ? timeAgo(store.lastSync) : 'Never'}</span>
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
                className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <RefreshCw size={13} className={isSyncingThis ? 'animate-spin text-white' : ''} />
                {isSyncingThis ? 'Pushing Catalog...' : `Publish to ${store.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
