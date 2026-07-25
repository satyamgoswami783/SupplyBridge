import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, RefreshCw, CheckCircle2, XCircle, ExternalLink, ShieldCheck,
  FileSpreadsheet, Zap, Search, Clock, ArrowUpRight, AlertTriangle, Layers, Activity
} from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Store } from '../../types'

interface PublishingQueueItem {
  id: string
  product: string
  sku: string
  storeName: string
  action: 'Create Product (POST)' | 'Update Stock/Price (PUT)' | 'Update Media' | 'Unpublish'
  httpCode: string
  status: 'published' | 'queued' | 'error'
  lastSync: string
}

const INITIAL_QUEUE: PublishingQueueItem[] = [
  { id: 'pq1', product: 'AMD Ryzen 9 7950X Processor 16-Core', sku: 'CPU-AMD-7950X', storeName: 'SupplyBridge US Store', action: 'Update Stock/Price (PUT)', httpCode: '200 OK', status: 'published', lastSync: '3 min ago' },
  { id: 'pq2', product: 'NVIDIA GeForce RTX 4090 24GB OC', sku: 'GPU-NV-4090', storeName: 'SupplyBridge US Store', action: 'Create Product (POST)', httpCode: '201 Created', status: 'published', lastSync: '10 min ago' },
  { id: 'pq3', product: 'DDR5 32GB 6000MHz RGB Memory Kit', sku: 'RAM-DDR5-001', storeName: 'SupplyBridge EU Store', action: 'Update Stock/Price (PUT)', httpCode: '200 OK', status: 'published', lastSync: '15 min ago' },
  { id: 'pq4', product: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', sku: 'SSD-990P-2TB', storeName: 'TechHub Marketplace', action: 'Update Media', httpCode: '200 OK', status: 'published', lastSync: '22 min ago' },
  { id: 'pq5', product: 'Corsair RM1000x 1000W Modular PSU', sku: 'PSU-COR-1000W', storeName: 'IndusStore UK', action: 'Update Stock/Price (PUT)', httpCode: '429 Rate Exceeded', status: 'error', lastSync: '45 min ago' },
  { id: 'pq6', product: 'ASUS ROG Swift 27" 1440P Monitor', sku: 'MON-ASUS-27', storeName: 'QuickBuy CA', action: 'Create Product (POST)', httpCode: 'Processing', status: 'queued', lastSync: 'Just now' },
  { id: 'pq7', product: 'Logitech MX Master 3S Mouse', sku: 'MOUSE-MX3S', storeName: 'AutoParts Direct', action: 'Update Stock/Price (PUT)', httpCode: '200 OK', status: 'published', lastSync: '1 hr ago' },
  { id: 'pq8', product: 'SportGear High Performance Kit', sku: 'SG-KIT-001', storeName: 'SportGear Pro', action: 'Create Product (POST)', httpCode: '500 Server Error', status: 'error', lastSync: '2 hr ago' },
]

export const WebsiteSync: React.FC = () => {
  const [storesList, setStoresList] = useState<Store[]>(mockStores)
  const [queueItems, setQueueItems] = useState<PublishingQueueItem[]>(INITIAL_QUEUE)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null)
  const [syncingQueueId, setSyncingQueueId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Sync All Stores
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
      setQueueItems(prev =>
        prev.map(q => ({ ...q, status: 'published', httpCode: '200 OK', lastSync: 'Just now' }))
      )
      setSyncingAll(false)
      showNotification('All 7 Shift4Shop storefronts published & synchronized via REST API v2!')
    }, 2000)
  }

  // Single Store Sync
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
      showNotification(`Catalog published successfully to Shift4Shop Storefront "${name}"!`)
    }, 1500)
  }

  // Single Queue Item Retry Push
  const handleRetryQueueItem = (id: string, product: string) => {
    setSyncingQueueId(id)
    setTimeout(() => {
      setQueueItems(prev =>
        prev.map(q =>
          q.id === id
            ? { ...q, status: 'published', httpCode: '200 OK', lastSync: 'Just now' }
            : q
        )
      )
      setSyncingQueueId(null)
      showNotification(`Shift4Shop REST API push successful for "${product}"! (200 OK)`)
    }, 1200)
  }

  // Export CSV
  const handleExportCatalogCSV = () => {
    showNotification('Exporting Shift4Shop Storefront Publishing Audit Report CSV...')
    const csvHeaders = 'Product Title,Master SKU,Target Storefront,Action Type,HTTP Response Code,Publish Status,Last Sync\n'
    const csvRows = queueItems.map(q =>
      `"${q.product}","${q.sku}","${q.storeName}","${q.action}","${q.httpCode}","${q.status}","${q.lastSync}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Shift4Shop_Publishing_Audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Shift4Shop Publishing Audit CSV downloaded!')
  }

  // Filtered Queue
  const filteredQueue = queueItems.filter(q => {
    const matchSearch =
      q.product.toLowerCase().includes(search.toLowerCase()) ||
      q.sku.toLowerCase().includes(search.toLowerCase()) ||
      q.storeName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="relative space-y-7 sm:space-y-8">
      {/* Toast Notification Banner */}
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

      {/* Page Header */}
      <SectionHeader
        title="Shift4Shop Website Synchronization (Phase 2)"
        subtitle="Publish master PIM products, taxonomy categories, pricing, and stock to Shift4Shop ecommerce storefronts"
        actions={
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
            <button
              onClick={handleExportCatalogCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer"
              title="Download Storefront Publishing Audit CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleSyncAllStores}
              disabled={syncingAll}
              className="btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncingAll ? 'animate-spin text-white' : ''} />
              <span>{syncingAll ? 'Publishing...' : <><span className="sm:hidden">Publish All</span><span className="hidden sm:inline">Publish to All Storefronts</span></>}</span>
            </button>
          </div>
        }
      />

      {/* Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {[
          { label: 'TOTAL PUBLISHED PRODUCTS', value: '82,800 SKUs', color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800', sub: 'Live across Shift4Shop stores' },
          { label: 'CONNECTED STOREFRONTS',    value: '7 / 7 Stores', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50', sub: 'REST API v2 authenticated' },
          { label: 'ACTIVE PUBLISHING QUEUE',  value: '1,247 Items', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/50', sub: 'Queued for API push' },
          { label: 'STOREFRONT API HEALTH',    value: '99.5%', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50', sub: 'Gateway fully operational' },
        ].map((card, i) => (
          <div key={i} className={`p-4 sm:p-5 rounded-2xl shadow-xs min-h-[110px] sm:min-h-[120px] flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Phase 2 Architecture Specs Banner */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-aurora text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold flex-shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white">Shift4Shop REST API v2 Publishing Gateway</h3>
            <p className="text-2xs text-cyan-200 font-medium mt-0.5">Official API Endpoint: <code className="mono">apirest.3dcart.com/v2/Products</code> • Token Authorized</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold flex-shrink-0">
          <ShieldCheck size={14} className="text-cyan-300" />
          <span>Centralized Store Management Active</span>
        </div>
      </div>

      {/* Storefront Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {storesList.map(store => {
          const isSyncingThis = syncingStoreId === store.id || syncingAll || store.syncStatus === 'syncing'

          return (
            <div key={store.id} className="card p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/90 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        {store.name}
                        <a href={store.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-500">
                          <ExternalLink size={12} />
                        </a>
                      </p>
                      <p className="text-2xs text-slate-400 font-mono truncate max-w-[180px] sm:max-w-none">{store.url}</p>
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
                className="btn-primary btn-sm w-full flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <RefreshCw size={13} className={isSyncingThis ? 'animate-spin text-white' : ''} />
                {isSyncingThis ? 'Pushing Catalog...' : `Publish to ${store.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Main Filter & Table Section — Detailed Shift4Shop Publishing Queue Table */}
      <div className="card p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-primary-600 dark:text-primary-400" /> Shift4Shop REST API Publishing Queue
          </h3>
          <Badge variant="primary" dot>Live Queue</Badge>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search queue by SKU, product title, or storefront..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-full sm:w-auto py-2"
            >
              <option value="all">All Queue Status</option>
              <option value="published">Published (HTTP 200/201 OK)</option>
              <option value="queued">Queued (Processing)</option>
              <option value="error">Publish Error (HTTP 429/500)</option>
            </select>
          </div>
        </div>

        {/* Main Publishing Queue Table — Exact Image 1 UI with Responsive Horizontal Scroll */}
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-[950px] w-full">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">PRODUCT TITLE</th>
                <th className="whitespace-nowrap px-4 py-3.5">MASTER SKU</th>
                <th className="whitespace-nowrap px-4 py-3.5">TARGET STOREFRONT</th>
                <th className="whitespace-nowrap px-4 py-3.5">PUBLISHING ACTION</th>
                <th className="whitespace-nowrap px-4 py-3.5">HTTP RESPONSE CODE</th>
                <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQueue.map(row => {
                const isSyncingRow = syncingQueueId === row.id

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-normal">{row.product}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <code className="mono text-xs">{row.sku}</code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{row.storeName}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-2xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md font-bold">{row.action}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`text-2xs font-mono font-bold ${
                        row.httpCode.includes('200') || row.httpCode.includes('201')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : row.httpCode.includes('429')
                          ? 'text-amber-600 dark:text-amber-400'
                          : row.httpCode.includes('Processing')
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {row.httpCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {row.status === 'published' && <Badge variant="success" dot>Published</Badge>}
                      {row.status === 'queued' && <Badge variant="warning" dot>Queued</Badge>}
                      {row.status === 'error' && <Badge variant="danger" dot>Publish Error</Badge>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">{row.lastSync}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                      <button
                        onClick={() => handleRetryQueueItem(row.id, row.product)}
                        disabled={isSyncingRow}
                        className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                        title="Force push payload to Shift4Shop REST API"
                      >
                        <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} />
                        <span>{isSyncingRow ? 'Pushing...' : 'Publish Now'}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
