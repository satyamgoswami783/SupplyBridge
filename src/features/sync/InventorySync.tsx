import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, CheckCircle2, XCircle, TrendingDown, TrendingUp,
  Search, ShieldCheck, Database, AlertCircle, Settings, PlayCircle,
  Clock, ArrowRight, Download, Sliders, AlertTriangle, Layers, Activity
} from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockSyncChartData } from '../../data/mockData'

interface InventoryItem {
  id: string
  name: string
  sku: string
  supplier: string
  supplierStock: number
  buffer: number
  availableStock: number
  websiteStock: number
  variance: number
  status: 'synced' | 'pending' | 'error' | 'out_of_stock'
  lastSync: string
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'inv1', name: 'AMD Ryzen 9 7950X Processor 16-Core', sku: 'CPU-AMD-7950X', supplier: 'TechParts International', supplierStock: 450, buffer: 5, availableStock: 445, websiteStock: 445, variance: 0, status: 'synced', lastSync: '4 min ago' },
  { id: 'inv2', name: 'NVIDIA GeForce RTX 4090 24GB OC', sku: 'GPU-NV-4090', supplier: 'TechParts International', supplierStock: 18, buffer: 3, availableStock: 15, websiteStock: 12, variance: +3, status: 'pending', lastSync: '12 min ago' },
  { id: 'inv3', name: 'DDR5 32GB 6000MHz RGB Memory Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts International', supplierStock: 325, buffer: 5, availableStock: 320, websiteStock: 320, variance: -30, status: 'synced', lastSync: '18 min ago' },
  { id: 'inv4', name: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', sku: 'SSD-990P-2TB', supplier: 'GlobalSource Limited', supplierStock: 195, buffer: 5, availableStock: 190, websiteStock: 180, variance: +10, status: 'pending', lastSync: '28 min ago' },
  { id: 'inv5', name: 'Corsair RM1000x 1000W 80+ Gold Modular PSU', sku: 'PSU-COR-1000W', supplier: 'GlobalSource Limited', supplierStock: 0, buffer: 2, availableStock: 0, websiteStock: 0, variance: 0, status: 'out_of_stock', lastSync: '1 hr ago' },
  { id: 'inv6', name: 'ASUS ROG Swift 27" 1440P 240Hz Gaming Monitor', sku: 'MON-ASUS-27', supplier: 'PrimeSupply Corp', supplierStock: 82, buffer: 2, availableStock: 80, websiteStock: 80, variance: 0, status: 'synced', lastSync: '2 hr ago' },
  { id: 'inv7', name: 'Logitech MX Master 3S Wireless Mouse', sku: 'MOUSE-MX3S', supplier: 'AcmeDistributors', supplierStock: 120, buffer: 5, availableStock: 115, websiteStock: 90, variance: +25, status: 'error', lastSync: '3 hr ago' },
  { id: 'inv8', name: 'Keychron Q1 Pro Wireless Mechanical Keyboard', sku: 'KEY-Q1PRO', supplier: 'QuickShip LLC', supplierStock: 64, buffer: 2, availableStock: 62, websiteStock: 62, variance: 0, status: 'synced', lastSync: '5 min ago' },
]

export const InventorySync: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [syncing, setSyncing] = useState(false)
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Buffer Config Modal State
  const [bufferModalOpen, setBufferModalOpen] = useState(false)
  const [globalBuffer, setGlobalBuffer] = useState(5)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Sync All Handler
  const handleSyncAll = () => {
    setSyncing(true)
    showNotification('Initializing global inventory pipeline for all 25 suppliers...')
    setTimeout(() => {
      setItems(prev =>
        prev.map(item => ({
          ...item,
          websiteStock: item.availableStock,
          variance: 0,
          status: item.availableStock === 0 ? 'out_of_stock' : 'synced',
          lastSync: 'Just now',
        }))
      )
      setSyncing(false)
      showNotification('Global Inventory Synchronization completed! 78,450 SKU stock levels updated.')
    }, 2000)
  }

  // Single Item Sync Handler
  const handleSyncSingle = (id: string, name: string) => {
    setSyncingItemId(id)
    setTimeout(() => {
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                websiteStock: item.availableStock,
                variance: 0,
                status: item.availableStock === 0 ? 'out_of_stock' : 'synced',
                lastSync: 'Just now',
              }
            : item
        )
      )
      setSyncingItemId(null)
      showNotification(`Stock synced successfully for "${name}"!`)
    }, 1200)
  }

  // Save Buffer Handler
  const handleSaveBuffer = () => {
    setItems(prev =>
      prev.map(item => ({
        ...item,
        buffer: globalBuffer,
        availableStock: Math.max(0, item.supplierStock - globalBuffer),
      }))
    )
    setBufferModalOpen(false)
    showNotification(`Global Safety Stock Buffer set to ${globalBuffer} units across all catalog items!`)
  }

  // Filtering
  const filteredItems = items.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  // Export CSV Handler
  const handleExportCSV = () => {
    showNotification('Generating Inventory Stock Audit CSV Report...')
    const headers = 'Product Name,Master SKU,Supplier,Supplier Stock,Safety Buffer,Available Stock,Shift4Shop Website Stock,Variance,Sync Status,Last Sync\n'
    const rows = items.map(i =>
      `"${i.name}","${i.sku}","${i.supplier}",${i.supplierStock},${i.buffer},${i.availableStock},${i.websiteStock},${i.variance},"${i.status}","${i.lastSync}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Inventory_Sync_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative space-y-6">
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
        title="Inventory Synchronization"
        subtitle="Real-time multi-supplier stock buffer, warehouse inventory feeds, and Shift4Shop storefront stock sync"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
              title="Download Inventory Audit CSV"
            >
              <Download size={14} className="text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={() => setBufferModalOpen(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sliders size={14} className="text-primary-600" /> Buffer Rules ({globalBuffer})
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing All Stock...' : 'Sync All Stock Now'}</span>
            </button>
          </div>
        }
      />

      {/* Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total In-Stock Items', value: '78,450 SKUs', color: 'text-slate-800 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800', sub: 'Across 25 suppliers' },
          { label: 'Pending Sync Queue',    value: items.filter(i => i.status === 'pending').length * 114 + 116, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50', sub: 'Queued for website push' },
          { label: 'Inventory Health',     value: '99.2%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50', sub: 'Pipeline operational' },
          { label: 'Low Stock Warnings',   value: '142 SKUs', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50', sub: 'Below buffer threshold' },
        ].map((card, i) => (
          <div key={i} className={`card p-4.5 rounded-2xl shadow-xs ${card.bg}`}>
            <p className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Sync Progress & 7-Day Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Supplier Pipeline Progress */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers size={16} className="text-primary-600 dark:text-primary-400" /> Supplier Stock Feeds Pipeline
            </h3>
            <Badge variant="primary" dot>Live Feeds</Badge>
          </div>
          <div className="space-y-4">
            {[
              { name: 'TechParts International', products: 18420, pending: 0, progress: 100, status: 'healthy' as const, lastSync: '4 min ago' },
              { name: 'GlobalSource Limited',    products: 14800, pending: 120, progress: 85, status: 'degraded' as const, lastSync: '12 min ago' },
              { name: 'PrimeSupply Corp',        products: 11200, pending: 0,   progress: 100, status: 'healthy' as const, lastSync: '28 min ago' },
              { name: 'AcmeDistributors',        products: 9800, pending: 222,  progress: 45, status: 'critical' as const, lastSync: '3 hr ago' },
              { name: 'QuickShip LLC',           products: 7300, pending: 0,    progress: 100, status: 'healthy' as const, lastSync: '5 min ago' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
                    <span className="text-2xs text-slate-400 font-mono flex-shrink-0 ml-2">{s.lastSync}</span>
                  </div>
                  <ProgressBar value={s.progress} color={s.progress === 100 ? 'emerald' : s.progress > 50 ? 'primary' : 'rose'} />
                  <div className="flex justify-between mt-1">
                    <span className="text-2xs text-slate-500 dark:text-slate-400 font-medium">{s.products.toLocaleString()} SKUs in catalog</span>
                    {s.pending > 0 && <span className="text-2xs text-amber-600 dark:text-amber-400 font-bold">{s.pending} pending push</span>}
                  </div>
                </div>
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : s.status === 'degraded' ? 'Lag' : 'Error'} />
              </div>
            ))}
          </div>
        </div>

        {/* Inventory 7-Day Trend Chart */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-primary-600 dark:text-primary-400" /> Stock Sync Volume — 7 Day Trend
            </h3>
            <span className="text-xs text-slate-400 font-medium">Daily API PUT Updates</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={mockSyncChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="inventory" name="Stock Updates" stroke="#4f46e5" strokeWidth={2} fill="url(#invGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Filter & Table Section */}
      <div className="card p-5 border border-slate-200 dark:border-slate-800">
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stock by SKU, product title, or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced (100% Match)</option>
              <option value="pending">Pending Store Push</option>
              <option value="error">Sync Error / Mismatch</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Main Inventory Sync Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Title</th>
                <th>Master SKU</th>
                <th>Supplier Source</th>
                <th>Supplier Stock</th>
                <th>Safety Buffer</th>
                <th>Available Stock</th>
                <th>Shift4Shop Live</th>
                <th>Variance</th>
                <th>Sync Status</th>
                <th>Last Sync</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(row => {
                const isSyncingRow = syncingItemId === row.id

                return (
                  <tr key={row.id}>
                    <td>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug max-w-xs line-clamp-1">{row.name}</p>
                    </td>
                    <td>
                      <code className="mono">{row.sku}</code>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{row.supplier}</span>
                    </td>
                    <td>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{row.supplierStock.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-bold">-{row.buffer}</span>
                    </td>
                    <td>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{row.availableStock.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`font-bold ${row.websiteStock === row.availableStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {row.websiteStock.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`flex items-center gap-1 text-xs font-bold ${row.variance > 0 ? 'text-amber-600 dark:text-amber-400' : row.variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        {row.variance > 0 ? <TrendingUp size={13} /> : row.variance < 0 ? <TrendingDown size={13} /> : null}
                        {row.variance > 0 ? `+${row.variance}` : row.variance === 0 ? '0 (Synced)' : row.variance}
                      </span>
                    </td>
                    <td>
                      {row.status === 'synced' && <Badge variant="success" dot>Synced</Badge>}
                      {row.status === 'pending' && <Badge variant="warning" dot>Pending Push</Badge>}
                      {row.status === 'error' && <Badge variant="danger" dot>Sync Error</Badge>}
                      {row.status === 'out_of_stock' && <Badge variant="neutral">Out of Stock</Badge>}
                    </td>
                    <td>
                      <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">{row.lastSync}</span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleSyncSingle(row.id, row.name)}
                        disabled={isSyncingRow}
                        className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2 cursor-pointer"
                        title="Force sync stock level to Shift4Shop"
                      >
                        <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} />
                        <span>{isSyncingRow ? 'Syncing...' : 'Sync Stock'}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Global Safety Stock Buffer Modal */}
      <Modal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
        title="Safety Stock Buffer Rules"
        subtitle="Configure safety stock reservation buffers to prevent overselling on Shift4Shop storefronts"
        size="md"
        footer={
          <>
            <button onClick={() => setBufferModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveBuffer} className="btn-primary flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Apply Buffer Rule</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Overselling Protection active</p>
              <p className="mt-0.5">Safety buffer automatically subtracts reserved units from the raw supplier feed stock before publishing available inventory to Shift4Shop storefronts.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Global Safety Reserve Buffer (Units)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="50"
                value={globalBuffer}
                onChange={e => setGlobalBuffer(Number(e.target.value))}
                className="input text-sm font-bold w-28 text-center"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">units reserved per SKU</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
