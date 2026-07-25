import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Eye,
  Download, Search, RotateCcw, ExternalLink, ShieldCheck, Database, Layers
} from 'lucide-react'
import { SectionHeader, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface ImageAssetItem {
  id: string
  product: string
  sku: string
  supplier: string
  rawUrl: string
  cdnUrl: string
  dimensions: string
  size: string
  status: 'synced' | 'pending' | 'broken' | 'missing'
  storeCount: number
  lastSync: string
}

const INITIAL_IMAGE_ITEMS: ImageAssetItem[] = [
  { id: 'i1', product: 'AMD Ryzen 9 7950X Processor 16-Core', sku: 'CPU-AMD-7950X', supplier: 'TechParts International', rawUrl: 'https://techparts-cdn.com/raw/cpu-7950x-front.jpg', cdnUrl: 'https://cdn.supplybridge.io/media/cpu-7950x-thumb.webp', dimensions: '1200x1200px', size: '148 KB', status: 'synced', storeCount: 2, lastSync: '4 min ago' },
  { id: 'i2', product: 'NVIDIA GeForce RTX 4090 24GB OC', sku: 'GPU-NV-4090', supplier: 'TechParts International', rawUrl: 'https://techparts-cdn.com/raw/rtx-4090-box.jpg', cdnUrl: 'https://cdn.supplybridge.io/media/rtx-4090-thumb.webp', dimensions: '1920x1080px', size: '320 KB', status: 'pending', storeCount: 0, lastSync: '12 min ago' },
  { id: 'i3', product: 'DDR5 32GB 6000MHz RGB Memory Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts International', rawUrl: 'https://techparts-cdn.com/raw/ddr5-ram-kit.jpg', cdnUrl: 'https://cdn.supplybridge.io/media/ddr5-ram-thumb.webp', dimensions: '800x800px', size: '92 KB', status: 'synced', storeCount: 1, lastSync: '18 min ago' },
  { id: 'i4', product: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', sku: 'SSD-990P-2TB', supplier: 'GlobalSource Limited', rawUrl: 'https://globalsource-feeds.org/assets/ssd990.png', cdnUrl: 'https://cdn.supplybridge.io/media/ssd-990p-thumb.webp', dimensions: '1000x1000px', size: '115 KB', status: 'synced', storeCount: 3, lastSync: '28 min ago' },
  { id: 'inv5', product: 'Corsair RM1000x 1000W Modular PSU', sku: 'PSU-COR-1000W', supplier: 'GlobalSource Limited', rawUrl: '', cdnUrl: '', dimensions: '—', size: '0 KB', status: 'missing', storeCount: 0, lastSync: '1 hr ago' },
  { id: 'inv6', name: 'ASUS ROG Swift 27" 1440P Monitor', sku: 'MON-ASUS-27', supplier: 'PrimeSupply Corp', rawUrl: 'https://primesupply.net/img/asus-27.jpg', cdnUrl: 'https://cdn.supplybridge.io/media/asus-27-thumb.webp', dimensions: '1600x1200px', size: '210 KB', status: 'synced', storeCount: 2, lastSync: '2 hr ago' } as any,
  { id: 'inv7', product: 'Logitech MX Master 3S Wireless Mouse', sku: 'MOUSE-MX3S', supplier: 'AcmeDistributors', rawUrl: 'https://acme-dist.com/media/mx3s-broken.png', cdnUrl: 'HTTP 404 Not Found', dimensions: 'Unknown', size: '0 KB', status: 'broken', storeCount: 0, lastSync: '3 hr ago' },
  { id: 'inv8', product: 'Keychron Q1 Pro Mechanical Keyboard', sku: 'KEY-Q1PRO', supplier: 'QuickShip LLC', rawUrl: 'https://quickship.com/feeds/keychron-q1.jpg', cdnUrl: 'https://cdn.supplybridge.io/media/keychron-q1-thumb.webp', dimensions: '1200x900px', size: '165 KB', status: 'synced', storeCount: 1, lastSync: '5 min ago' },
]

const GALLERY_SAMPLES = [
  { id: 'g1', product: 'AMD X570 ATX Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80', status: 'synced' },
  { id: 'g2', product: 'DDR5 32GB 6000MHz Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80', status: 'synced' },
  { id: 'g3', product: 'NVIDIA RTX 4090 24GB', sku: 'GPU-4090-001', supplier: 'TechParts', url: '', status: 'missing' },
  { id: 'g4', product: 'Samsung 980 Pro 2TB SSD', sku: 'SSD-980P-001', supplier: 'GlobalSource', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80', status: 'synced' },
  { id: 'g5', product: 'Industrial Fan 12V', sku: 'ACME-IF-120', supplier: 'Acme', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=80', status: 'pending' },
  { id: 'g6', product: 'Cable Management Kit', sku: 'ACME-CMK-50', supplier: 'Acme', url: '', status: 'broken' },
]

export const ImageSync: React.FC = () => {
  const [items, setItems] = useState<ImageAssetItem[]>(INITIAL_IMAGE_ITEMS)
  const [syncing, setSyncing] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewItem, setPreviewItem] = useState<any | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Global Sync Images
  const handleSyncImages = () => {
    setSyncing(true)
    showNotification('Image downloading & WebP optimization pipeline started...')
    setTimeout(() => {
      setItems(prev =>
        prev.map(item => ({
          ...item,
          status: item.status === 'missing' ? 'missing' : 'synced',
          cdnUrl: item.rawUrl ? item.rawUrl.replace('techparts-cdn.com', 'cdn.supplybridge.io').replace('.jpg', '.webp') : '',
          lastSync: 'Just now',
        }))
      )
      setSyncing(false)
      showNotification('Image synchronization complete! 3,840 product WebP images published to CDN.')
    }, 2000)
  }

  // Retry Broken Links
  const handleRetryBroken = () => {
    showNotification('Re-fetching all 1,532 broken 404 image URLs from supplier feeds...')
    setTimeout(() => {
      setItems(prev =>
        prev.map(item =>
          item.status === 'broken'
            ? { ...item, status: 'synced', cdnUrl: 'https://cdn.supplybridge.io/media/recovered-thumb.webp', lastSync: 'Just now' }
            : item
        )
      )
      showNotification('Successfully repaired 1,532 broken image links!')
    }, 1800)
  }

  // Single Item Retry
  const handleRetrySingle = (id: string, product: string) => {
    setSyncingId(id)
    setTimeout(() => {
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'synced', cdnUrl: 'https://cdn.supplybridge.io/media/re-fetched.webp', lastSync: 'Just now' }
            : item
        )
      )
      setSyncingId(null)
      showNotification(`Re-downloaded and published WebP media for "${product}"!`)
    }, 1200)
  }

  // Filtered List
  const filteredItems = items.filter(item => {
    const title = item.product || (item as any).name || ''
    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  // Export CSV
  const handleExportCSV = () => {
    showNotification('Generating Image Assets Audit CSV Report...')
    const headers = 'Product Title,Master SKU,Supplier,Supplier Raw Image URL,Shift4Shop CDN URL,Resolution,File Size,Sync Status,Last Sync\n'
    const rows = items.map(i =>
      `"${i.product || (i as any).name}","${i.sku}","${i.supplier}","${i.rawUrl}","${i.cdnUrl}","${i.dimensions}","${i.size}","${i.status}","${i.lastSync}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Image_Assets_Audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
        title="Image Synchronization"
        subtitle="Monitor and synchronize supplier media feeds, CDN hosting, WebP image compression, and 404 URL repairs"
        actions={
          <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer px-2 sm:px-3 text-xs"
              title="Download Image Audit CSV Report"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleRetryBroken}
              className="btn-secondary btn-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer px-2 sm:px-3 text-xs whitespace-nowrap"
              title="Re-fetch all broken 404 image URLs"
            >
              <RotateCcw size={14} /> Retry <span className="hidden sm:inline">Broken (1,532)</span><span className="sm:hidden">(1.5k)</span>
            </button>
            <button
              onClick={handleSyncImages}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer px-2 sm:px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : <><span className="sm:hidden">Sync Media</span><span className="hidden sm:inline">Sync Images Now</span></>}</span>
            </button>
          </div>
        }
      />

      {/* Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[
          { label: 'TOTAL MEDIA ASSETS', value: '248,492', color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800', sub: 'Indexed across 25 suppliers' },
          { label: 'SYNCED & OPTIMIZED',  value: '243,120', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50', sub: '98.2% WebP CDN cached' },
          { label: 'PENDING PROCESSING', value: '3,840', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50', sub: 'Queued for CDN compression' },
          { label: 'BROKEN / 404 LINKS', value: '1,532', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50', sub: 'Requires supplier URL refetch' },
        ].map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl shadow-xs min-h-[120px] flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl lg:text-3xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Image Feed Status Breakdown */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-primary-600 dark:text-primary-400" /> Image Feed Status by Supplier
          </h3>
          <Badge variant="primary" dot>Live CDN Feed</Badge>
        </div>
        <div className="space-y-3.5">
          {[
            { name: 'TechParts International', total: 55260, synced: 55100, broken: 12, pending: 148, status: 'healthy' as const },
            { name: 'GlobalSource Limited',    total: 44400, synced: 44200, broken: 80, pending: 120, status: 'healthy' as const },
            { name: 'PrimeSupply Corp',        total: 33600, synced: 33600, broken: 0,  pending: 0,   status: 'healthy' as const },
            { name: 'AcmeDistributors',        total: 29400, synced: 26800, broken: 980, pending: 1620, status: 'degraded' as const },
            { name: 'QuickShip LLC',           total: 21900, synced: 21900, broken: 0,  pending: 0,   status: 'healthy' as const },
          ].map(s => (
            <div key={s.name} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{s.name}</span>
                <span className="text-2xs text-slate-400 font-medium">{s.total.toLocaleString()} total images indexed</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold"><CheckCircle2 size={12} className="inline mr-1" />{s.synced.toLocaleString()} synced</span>
                {s.broken > 0 && <span className="text-rose-600 dark:text-rose-400 font-bold"><XCircle size={12} className="inline mr-1" />{s.broken.toLocaleString()} broken</span>}
                {s.pending > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold"><AlertTriangle size={12} className="inline mr-1" />{s.pending.toLocaleString()} pending</span>}
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : 'Issues'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Product Image Gallery Grid */}
      <div className="card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Image size={16} className="text-primary-600 dark:text-primary-400" /> Master Catalog Product Image Gallery
          </h3>
          <span className="text-xs text-slate-400 font-medium">Visual Media Cache</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto scrollbar-thin pb-2 sm:pb-0">
          {GALLERY_SAMPLES.map(img => (
            <div key={img.id} className="group relative cursor-pointer min-w-[130px] sm:min-w-0" onClick={() => setPreviewItem(img)}>
              <div className={`aspect-square rounded-xl overflow-hidden border-2 relative ${
                img.status === 'synced' ? 'border-emerald-300 dark:border-emerald-900 bg-white dark:bg-slate-800' :
                img.status === 'broken' ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40' :
                img.status === 'missing' ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900' : 'border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40'
              }`}>
                {img.url ? (
                  <img src={img.url} alt={img.product} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Image size={24} className="mb-1 text-slate-400" />
                    <span className="text-2xs font-bold">{img.status === 'broken' ? 'Broken 404' : 'No Media'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 group-hover:opacity-100 opacity-0 transition-opacity rounded-xl flex items-center justify-center">
                  <button className="btn-ghost text-white text-xs flex items-center gap-1 font-bold">
                    <Eye size={14} /> Preview
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{img.product}</p>
                <Badge variant={img.status === 'synced' ? 'success' : img.status === 'broken' ? 'danger' : img.status === 'missing' ? 'neutral' : 'warning'} className="mt-1">
                  {img.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Filter & Table Section — Detailed Image Asset Audit Table */}
      <div className="card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search image by SKU, title, or supplier..."
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
              <option value="all">All Image Status</option>
              <option value="synced">Synced (WebP CDN Published)</option>
              <option value="pending">Pending CDN Processing</option>
              <option value="broken">Broken 404 Links</option>
              <option value="missing">Missing Media</option>
            </select>
          </div>
        </div>

        {/* Main Image Asset Audit Table */}
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-0 sm:min-w-[950px] w-full">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">PRODUCT TITLE</th>
                <th className="whitespace-nowrap px-4 py-3.5">MASTER SKU</th>
                <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER SOURCE</th>
                <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER RAW IMAGE URL</th>
                <th className="whitespace-nowrap px-4 py-3.5">SHIFT4SHOP CDN URL</th>
                <th className="whitespace-nowrap px-4 py-3.5">RESOLUTION / SIZE</th>
                <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(row => {
                const title = row.product || (row as any).name || ''
                const isSyncingRow = syncingId === row.id

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Product Title" className="whitespace-nowrap px-4 py-3.5">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-normal max-w-xs">{title}</p>
                    </td>
                    <td data-label="Master SKU" className="whitespace-nowrap px-4 py-3.5">
                      <code className="mono text-xs">{row.sku}</code>
                    </td>
                    <td data-label="Supplier Source" className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">{row.supplier}</span>
                    </td>
                    <td data-label="Raw URL" className="whitespace-nowrap px-4 py-3.5">
                      {row.rawUrl ? (
                        <span className="text-2xs text-indigo-600 dark:text-indigo-400 font-mono" title={row.rawUrl}>
                          {row.rawUrl}
                        </span>
                      ) : (
                        <span className="text-2xs text-slate-400 italic">No supplier URL</span>
                      )}
                    </td>
                    <td data-label="CDN URL" className="whitespace-nowrap px-4 py-3.5">
                      {row.cdnUrl && row.cdnUrl.startsWith('http') ? (
                        <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-mono" title={row.cdnUrl}>
                          {row.cdnUrl}
                        </span>
                      ) : (
                        <span className="text-2xs text-rose-600 dark:text-rose-400 font-mono">{row.cdnUrl || 'Not cached'}</span>
                      )}
                    </td>
                    <td data-label="Resolution" className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">{row.dimensions} ({row.size})</span>
                    </td>
                    <td data-label="Status" className="whitespace-nowrap px-4 py-3.5">
                      {row.status === 'synced' && <Badge variant="success" dot>Synced</Badge>}
                      {row.status === 'pending' && <Badge variant="warning" dot>Pending Push</Badge>}
                      {row.status === 'broken' && <Badge variant="danger" dot>Broken 404</Badge>}
                      {row.status === 'missing' && <Badge variant="neutral">Missing Media</Badge>}
                    </td>
                    <td data-label="Last Sync" className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">{row.lastSync}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                      <button
                        onClick={() => handleRetrySingle(row.id, title)}
                        disabled={isSyncingRow}
                        className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                        title="Re-download media asset & re-publish to CDN"
                      >
                        <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} />
                        <span>{isSyncingRow ? 'Fetching...' : 'Re-download'}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <Modal
          open
          onClose={() => setPreviewItem(null)}
          title={previewItem.product}
          subtitle={`SKU: ${previewItem.sku} · Supplier: ${previewItem.supplier}`}
          size="md"
          footer={
            <button onClick={() => setPreviewItem(null)} className="btn-secondary">Close</button>
          }
        >
          <div className="space-y-4 text-center">
            <div className="w-64 h-64 mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 shadow-inner">
              {previewItem.url ? (
                <img src={previewItem.url} alt={previewItem.product} className="w-full h-full object-contain" />
              ) : (
                <Image size={48} className="text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Media Status:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{previewItem.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift4Shop CDN Cached:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">WebP Optimized (80%)</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
