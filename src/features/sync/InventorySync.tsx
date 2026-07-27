import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, CheckCircle2, TrendingDown, TrendingUp,
  Search, Download, Sliders, AlertTriangle, Layers, Filter, X
} from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  supplier: string
  supplierStock: number
  buffer: number
  websiteStock: number
  isError?: boolean
  lastSync: string
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'inv1', name: 'AMD Ryzen 9 7950X Processor 16-Core', sku: 'CPU-AMD-7950X', supplier: 'TechParts International', supplierStock: 450, buffer: 5, websiteStock: 445, lastSync: '4 min ago' },
  { id: 'inv2', name: 'NVIDIA GeForce RTX 4090 24GB OC', sku: 'GPU-NV-4090', supplier: 'TechParts International', supplierStock: 18, buffer: 3, websiteStock: 12, lastSync: '12 min ago' },
  { id: 'inv3', name: 'DDR5 32GB 6000MHz RGB Memory Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts International', supplierStock: 325, buffer: 5, websiteStock: 320, lastSync: '18 min ago' },
  { id: 'inv4', name: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', sku: 'SSD-990P-2TB', supplier: 'GlobalSource Limited', supplierStock: 195, buffer: 5, websiteStock: 180, lastSync: '28 min ago' },
  { id: 'inv5', name: 'Corsair RM1000x 1000W 80+ Gold Modular PSU', sku: 'PSU-COR-1000W', supplier: 'GlobalSource Limited', supplierStock: 0, buffer: 2, websiteStock: 0, lastSync: '1 hr ago' },
  { id: 'inv6', name: 'ASUS ROG Swift 27" 1440P 240Hz Gaming Monitor', sku: 'MON-ASUS-27', supplier: 'PrimeSupply Corp', supplierStock: 82, buffer: 2, websiteStock: 80, lastSync: '2 hr ago' },
  { id: 'inv7', name: 'Logitech MX Master 3S Wireless Mouse', sku: 'MOUSE-MX3S', supplier: 'AcmeDistributors', supplierStock: 120, buffer: 5, websiteStock: 90, isError: true, lastSync: '3 hr ago' },
  { id: 'inv8', name: 'Keychron Q1 Pro Wireless Mechanical Keyboard', sku: 'KEY-Q1PRO', supplier: 'QuickShip LLC', supplierStock: 64, buffer: 2, websiteStock: 62, lastSync: '5 min ago' },
]

export const InventorySync: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [syncing, setSyncing] = useState(false)
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Safety Buffer Modal State
  const [bufferModalOpen, setBufferModalOpen] = useState(false)
  const [globalBuffer, setGlobalBuffer] = useState(5)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editItemBuffer, setEditItemBuffer] = useState<number>(5)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Dynamic Item Computation Helpers
  const getItemMetrics = (item: InventoryItem) => {
    const buffer = Math.max(0, item.buffer)
    const availableStock = Math.max(0, item.supplierStock - buffer)
    const variance = availableStock - item.websiteStock

    let syncStatus: 'synced' | 'pending' | 'out_of_sync' | 'error' = 'synced'
    if (item.isError) {
      syncStatus = 'error'
    } else if (variance === 0) {
      syncStatus = 'synced'
    } else if (item.websiteStock === 0 && availableStock > 0) {
      syncStatus = 'pending'
    } else {
      syncStatus = 'out_of_sync'
    }

    return { availableStock, variance, syncStatus, buffer }
  }

  // Dynamic Telemetry Metrics derived strictly from state
  const totalInStockSKUs = items.filter(i => i.supplierStock > 0).length
  const totalInStockUnits = items.reduce((acc, i) => acc + i.supplierStock, 0)
  const pendingSyncQueueCount = items.filter(i => {
    const { syncStatus } = getItemMetrics(i)
    return syncStatus === 'pending' || syncStatus === 'out_of_sync'
  }).length
  const totalItemsCount = items.length
  const healthySyncedCount = items.filter(i => getItemMetrics(i).syncStatus === 'synced').length
  const inventoryHealthPct = totalItemsCount > 0 ? Math.round((healthySyncedCount / totalItemsCount) * 100) : 100
  const lowStockWarningsCount = items.filter(i => {
    const { availableStock, buffer } = getItemMetrics(i)
    return availableStock <= buffer * 2
  }).length

  // Unique Suppliers list for filter dropdown
  const suppliersList = ['all', ...Array.from(new Set(items.map(i => i.supplier)))]

  // "Sync All Stock Now" Handler — Triggers inventory synchronization for all suppliers
  const handleSyncAll = () => {
    setSyncing(true)
    showNotification('Synchronizing inventory stock levels across all suppliers...')
    setTimeout(() => {
      setItems(prev =>
        prev.map(item => {
          const buffer = Math.max(0, item.buffer)
          const available = Math.max(0, item.supplierStock - buffer)
          return {
            ...item,
            websiteStock: available,
            isError: false,
            lastSync: 'Just now',
          }
        })
      )
      setSyncing(false)
      showNotification('Global Inventory Synchronization completed! Storefront stock levels updated.')
    }, 1500)
  }

  // Single Item Sync Handler
  const handleSyncSingle = (id: string, name: string) => {
    setSyncingItemId(id)
    setTimeout(() => {
      setItems(prev =>
        prev.map(item => {
          if (item.id !== id) return item
          const buffer = Math.max(0, item.buffer)
          const available = Math.max(0, item.supplierStock - buffer)
          return {
            ...item,
            websiteStock: available,
            isError: false,
            lastSync: 'Just now',
          }
        })
      )
      setSyncingItemId(null)
      showNotification(`Stock synced successfully to Shift4Shop for "${name}"!`)
    }, 1000)
  }

  // Apply Global Buffer Rule
  const handleSaveGlobalBuffer = () => {
    const validBuffer = Math.max(0, globalBuffer)
    setItems(prev =>
      prev.map(item => ({
        ...item,
        buffer: validBuffer,
      }))
    )
    setBufferModalOpen(false)
    showNotification(`Global Safety Reserve Buffer updated to ${validBuffer} units across catalog.`)
  }

  // Open Individual SKU Buffer Modal
  const handleOpenEditBuffer = (item: InventoryItem) => {
    setEditingItem(item)
    setEditItemBuffer(Math.max(0, item.buffer))
  }

  // Save Individual SKU Buffer Rule
  const handleSaveItemBuffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const validBuffer = Math.max(0, editItemBuffer)
    setItems(prev =>
      prev.map(item =>
        item.id === editingItem.id ? { ...item, buffer: validBuffer } : item
      )
    )
    showNotification(`Safety Reserve Buffer set to ${validBuffer} units for SKU "${editingItem.sku}".`)
    setEditingItem(null)
  }

  // Filtering Items
  const filteredItems = items.filter(item => {
    const query = search.toLowerCase()
    const matchSearch =
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query)
    
    const matchSupplier = supplierFilter === 'all' || item.supplier === supplierFilter

    const { syncStatus } = getItemMetrics(item)
    const matchStatus = statusFilter === 'all' || syncStatus === statusFilter

    return matchSearch && matchSupplier && matchStatus
  })

  // Export CSV Audit Report
  const handleExportCSV = () => {
    showNotification('Generating Inventory Stock Audit CSV Report...')
    const headers = 'Product Name,Master SKU,Supplier,Supplier Stock,Safety Buffer,Available Stock,Shift4Shop Live Stock,Variance,Sync Status,Last Sync\n'
    const rows = items.map(i => {
      const { availableStock, variance, syncStatus, buffer } = getItemMetrics(i)
      const statusLabel =
        syncStatus === 'synced' ? 'Synced' :
        syncStatus === 'pending' ? 'Pending Push' :
        syncStatus === 'out_of_sync' ? 'Out of Sync' : 'Error'

      return `"${i.name}","${i.sku}","${i.supplier}",${i.supplierStock},${buffer},${availableStock},${i.websiteStock},${variance},"${statusLabel}","${i.lastSync}"`
    }).join('\n')

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

  // Supplier Pipeline Summary
  const supplierPipeline = Array.from(new Set(items.map(i => i.supplier))).map(supName => {
    const supItems = items.filter(i => i.supplier === supName)
    const pendingCount = supItems.filter(i => {
      const { syncStatus } = getItemMetrics(i)
      return syncStatus === 'pending' || syncStatus === 'out_of_sync'
    }).length
    const errorCount = supItems.filter(i => getItemMetrics(i).syncStatus === 'error').length
    const totalCount = supItems.length
    const progress = Math.round(((totalCount - pendingCount - errorCount) / totalCount) * 100)
    const status: 'healthy' | 'degraded' | 'critical' = errorCount > 0 ? 'critical' : pendingCount > 0 ? 'degraded' : 'healthy'
    const lastSync = supItems[0]?.lastSync || '—'

    return {
      name: supName,
      totalCount,
      pendingCount,
      errorCount,
      progress,
      status,
      lastSync,
    }
  })

  const hasActiveFilters = search !== '' || supplierFilter !== 'all' || statusFilter !== 'all'
  const resetFilters = () => {
    setSearch('')
    setSupplierFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="relative space-y-6 sm:space-y-7">
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
        subtitle="Manage supplier stock feeds, reserve safety buffers, and synchronize Shift4Shop storefront inventory"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Download Inventory Audit CSV"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => setBufferModalOpen(true)}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Configure Global Safety Buffer"
            >
              <Sliders size={14} className="text-primary-600 dark:text-primary-400" /> Buffer ({globalBuffer} units)
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync All Stock Now'}</span>
            </button>
          </div>
        }
      />

      {/* Dynamic Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[
          {
            label: 'TOTAL IN-STOCK ITEMS',
            value: `${totalInStockSKUs} SKUs`,
            color: 'text-slate-900 dark:text-slate-100',
            bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
            sub: `${totalInStockUnits.toLocaleString()} Feed Units`,
          },
          {
            label: 'PENDING SYNC QUEUE',
            value: `${pendingSyncQueueCount} SKUs`,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50',
            sub: 'Awaiting storefront push',
          },
          {
            label: 'INVENTORY HEALTH',
            value: `${inventoryHealthPct}%`,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50',
            sub: `${healthySyncedCount} of ${totalItemsCount} Products Synced`,
          },
          {
            label: 'LOW STOCK WARNINGS',
            value: `${lowStockWarningsCount} SKUs`,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',
            sub: 'Near safety buffer threshold',
          },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Stock Feeds Pipeline (Clean Full-Width Overview) */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-primary-600 dark:text-primary-400" /> Supplier Stock Feeds Pipeline
          </h3>
          <Badge variant="primary" dot>Live Feeds ({supplierPipeline.length})</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {supplierPipeline.map(s => (
            <div key={s.name} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-1" title={s.name}>{s.name}</span>
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : s.status === 'degraded' ? 'Lag' : 'Error'} />
              </div>
              <ProgressBar value={s.progress} color={s.progress === 100 ? 'emerald' : s.progress > 50 ? 'primary' : 'rose'} />
              <div className="flex items-center justify-between text-2xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{s.totalCount} SKUs</span>
                {s.pendingCount > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{s.pendingCount} pending</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Synced</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Filter & Table Section */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Master SKU, Product Title, or Supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-2xs font-semibold text-slate-500">
              <Filter size={13} /> Filters
            </div>

            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Suppliers</option>
              {suppliersList.filter(s => s !== 'all').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending Push</option>
              <option value="out_of_sync">Out of Sync</option>
              <option value="error">Error</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="btn-ghost btn-sm text-2xs font-bold text-slate-500 hover:text-slate-800">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Inventory Sync Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="whitespace-nowrap">Product</th>
                <th className="whitespace-nowrap">Master SKU</th>
                <th className="whitespace-nowrap">Supplier</th>
                <th className="whitespace-nowrap">Supplier Stock</th>
                <th className="whitespace-nowrap">Safety Buffer</th>
                <th className="whitespace-nowrap">Available Stock</th>
                <th className="whitespace-nowrap">Shift4Shop Live Stock</th>
                <th className="whitespace-nowrap">Variance</th>
                <th className="whitespace-nowrap">Sync Status</th>
                <th className="whitespace-nowrap">Last Sync</th>
                <th className="text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No inventory records match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(row => {
                  const isSyncingRow = syncingItemId === row.id
                  const { availableStock, variance, syncStatus, buffer } = getItemMetrics(row)

                  return (
                    <tr key={row.id}>
                      <td data-label="Product">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-normal max-w-xs">{row.name}</p>
                      </td>
                      <td data-label="Master SKU">
                        <code className="mono text-xs">{row.sku}</code>
                      </td>
                      <td data-label="Supplier">
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">{row.supplier}</span>
                      </td>
                      <td data-label="Supplier Stock">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{row.supplierStock.toLocaleString()}</span>
                      </td>
                      <td data-label="Safety Buffer">
                        <button
                          onClick={() => handleOpenEditBuffer(row)}
                          className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-md font-bold hover:bg-amber-100 cursor-pointer"
                          title="Click to configure Safety Buffer"
                        >
                          {buffer} units
                        </button>
                      </td>
                      <td data-label="Available Stock">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{availableStock.toLocaleString()}</span>
                      </td>
                      <td data-label="Shift4Shop Live Stock">
                        <span className={`font-bold ${row.websiteStock === availableStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {row.websiteStock.toLocaleString()}
                        </span>
                      </td>
                      <td data-label="Variance">
                        <span className={`flex items-center gap-1 text-xs font-bold whitespace-nowrap ${variance > 0 ? 'text-amber-600 dark:text-amber-400' : variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-400'}`}>
                          {variance > 0 ? <TrendingUp size={13} /> : variance < 0 ? <TrendingDown size={13} /> : null}
                          {variance > 0 ? `+${variance}` : variance === 0 ? '0' : variance}
                        </span>
                      </td>
                      <td data-label="Sync Status" className="whitespace-nowrap">
                        {syncStatus === 'synced' && <Badge variant="success" dot>Synced</Badge>}
                        {syncStatus === 'pending' && <Badge variant="warning" dot>Pending Push</Badge>}
                        {syncStatus === 'out_of_sync' && <Badge variant="warning" dot>Out of Sync</Badge>}
                        {syncStatus === 'error' && <Badge variant="danger" dot>Error</Badge>}
                      </td>
                      <td data-label="Last Sync" className="whitespace-nowrap">
                        <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">{row.lastSync}</span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSyncSingle(row.id, row.name)}
                          disabled={isSyncingRow}
                          className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                          title="Force sync stock level to Shift4Shop"
                        >
                          <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} />
                          <span>{isSyncingRow ? 'Syncing...' : 'Sync Stock'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Safety Stock Buffer Modal */}
      <Modal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
        title="Safety Stock Buffer Rules"
        subtitle="Configure safety stock reservation buffers to prevent overselling on Shift4Shop storefronts"
        size="md"
        footer={
          <>
            <button onClick={() => setBufferModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveGlobalBuffer} className="btn-primary flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Apply Global Buffer</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Overselling Protection active</p>
              <p className="mt-0.5">Available Stock is calculated as Supplier Stock − Safety Buffer before publishing to Shift4Shop storefronts.</p>
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
                onChange={e => setGlobalBuffer(Math.max(0, Number(e.target.value)))}
                className="input text-sm font-bold w-28 text-center"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">positive units reserved per SKU</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Individual SKU Safety Buffer Modal */}
      {editingItem && (
        <Modal
          open
          onClose={() => setEditingItem(null)}
          title={`Configure Buffer: ${editingItem.sku}`}
          subtitle={`Product: ${editingItem.name}`}
          size="md"
        >
          <form onSubmit={handleSaveItemBuffer} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Feed Stock</label>
              <input
                type="text"
                disabled
                value={`${editingItem.supplierStock.toLocaleString()} Units`}
                className="input bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Safety Reserve Buffer (Units) *</label>
              <input
                type="number"
                min="0"
                max={editingItem.supplierStock}
                required
                value={editItemBuffer}
                onChange={e => setEditItemBuffer(Math.max(0, Number(e.target.value)))}
                className="input"
              />
              <p className="text-2xs text-slate-500 mt-1">Available Stock will update to: <strong>{Math.max(0, editingItem.supplierStock - Math.max(0, editItemBuffer))}</strong> units</p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save SKU Buffer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
