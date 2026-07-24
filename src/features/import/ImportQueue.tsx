import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle2, XCircle, RefreshCw, RotateCcw, AlertCircle, FileSpreadsheet, Clock, ArrowDownCircle } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockImportQueue } from '../../data/mockData'
import { statusToVariant, connectionTypeLabel, timeAgo } from '../../utils'
import type { ImportJob } from '../../types'

export const ImportQueue: React.FC = () => {
  const [importsList, setImportsList] = useState<ImportJob[]>(mockImportQueue)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRetry = (id: string, supplierName: string) => {
    setImportsList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'processing',
              errorMessage: undefined,
              processedRecords: Math.floor(item.totalRecords * 0.4),
            }
          : item
      )
    )
    showNotification(`Retrying import feed for ${supplierName}...`)

    setTimeout(() => {
      setImportsList(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                processedRecords: item.totalRecords,
                failedRecords: 0,
              }
            : item
        )
      )
      showNotification(`Import for ${supplierName} completed successfully!`)
    }, 2000)
  }

  const handleCancel = (id: string, supplierName: string) => {
    setImportsList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'failed',
              errorMessage: 'Cancelled by administrator.',
            }
          : item
      )
    )
    showNotification(`Import for ${supplierName} cancelled.`)
  }

  const tabs = [
    { id: 'all',        label: 'All Imports', count: importsList.length },
    { id: 'processing', label: 'Processing',  count: importsList.filter(i => i.status === 'processing').length },
    { id: 'pending',    label: 'Pending',     count: importsList.filter(i => i.status === 'pending').length },
    { id: 'completed',  label: 'Completed',   count: importsList.filter(i => i.status === 'completed').length },
    { id: 'failed',     label: 'Failed',      count: importsList.filter(i => i.status === 'failed').length },
  ]

  const filtered = importsList.filter(q => {
    const matchTab = tab === 'all' || q.status === tab
    const matchSearch = q.supplierName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const handleExportQueueCSV = () => {
    showNotification('Generating Import Queue CSV export...')
    const csvHeaders = 'Job ID,Supplier Name,Source File,Format,Total Records,Processed Records,Failed Records,Status,Created At\n'
    const csvRows = importsList.map(i =>
      `"${i.id}","${i.supplierName}","${i.fileName || ''}","${i.format || ''}",${i.totalRecords},${i.processedRecords},${i.failedRecords},"${i.status}","${i.createdAt || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Import_Queue_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Import Queue CSV file downloaded!')
  }

  return (
    <div className="relative space-y-6">
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
        title="Import Queue"
        subtitle="Monitor and manage product feed import jobs from all connected suppliers"
        actions={
          <>
            <button
              onClick={handleExportQueueCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer font-semibold"
              title="Download Import Queue CSV File"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={() => showNotification('Import queue refreshed.')}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records Processing', value: importsList.reduce((s, q) => s + q.totalRecords, 0).toLocaleString(), color: 'text-slate-900', bg: 'bg-white', icon: <ArrowDownCircle size={18} className="text-slate-700" /> },
          { label: 'Currently Processing',  value: importsList.filter(q => q.status === 'processing').length, color: 'text-cyan-700', bg: 'bg-cyan-50/80 border-cyan-100', icon: <RefreshCw size={18} className="animate-spin text-cyan-600" /> },
          { label: 'Pending Queue',     value: importsList.filter(q => q.status === 'pending').length, color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-100', icon: <Clock size={18} className="text-amber-600" /> },
          { label: 'Failed Feeds',      value: importsList.filter(q => q.status === 'failed').length, color: 'text-rose-700', bg: 'bg-rose-50/80 border-rose-100', icon: <XCircle size={18} className="text-rose-600" /> },
        ].map(s => (
          <div key={s.label} className={`card p-4 flex items-center gap-3.5 border ${s.bg}`}>
            <div className="p-2.5 rounded-xl bg-white shadow-2xs">
              {s.icon}
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search supplier feeds by name..." />

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card p-16 text-center text-slate-400">
            <EmptyState
              icon={<Download size={28} className="text-slate-300" />}
              title="No import jobs found"
              description="Try selecting another tab or adjusting your filter criteria."
            />
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="card p-5 hover:shadow-card-md transition-all border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs border ${
                    item.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200'
                      : item.status === 'failed'
                      ? 'bg-rose-50 border-rose-200'
                      : item.status === 'processing'
                      ? 'bg-cyan-50 border-cyan-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <Download
                    size={18}
                    className={
                      item.status === 'completed'
                        ? 'text-emerald-600'
                        : item.status === 'failed'
                        ? 'text-rose-600'
                        : item.status === 'processing'
                        ? 'text-cyan-600'
                        : 'text-amber-600'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="font-bold text-slate-900 text-sm">{item.supplierName}</p>
                    <Badge variant="info">{connectionTypeLabel(item.connectionType)}</Badge>
                    <Badge variant={statusToVariant(item.status)} dot>{item.status}</Badge>
                  </div>
                  {item.fileName && (
                    <p className="text-xs text-slate-500 mb-2">
                      Feed Source: <code className="mono text-xs font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-800">{item.fileName}</code>
                    </p>
                  )}
                  {item.errorMessage && (
                    <p className="text-xs text-rose-600 mb-2 flex items-center gap-1.5 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                      <AlertCircle size={13} /> Error: {item.errorMessage}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 mt-2">
                    <span>
                      <CheckCircle2 size={12} className="inline mr-1 text-emerald-500" />
                      <strong className="text-slate-900">{item.processedRecords.toLocaleString()}</strong> processed
                    </span>
                    {item.failedRecords > 0 && (
                      <span className="text-rose-600 font-bold">
                        <XCircle size={12} className="inline mr-1 text-rose-500" />
                        {item.failedRecords.toLocaleString()} failed
                      </span>
                    )}
                    <span>Total: <strong className="text-slate-900">{item.totalRecords.toLocaleString()}</strong> SKUs</span>
                    <span className="text-slate-400 font-mono">• {timeAgo(item.createdAt)}</span>
                  </div>
                  {item.status === 'processing' && (
                    <ProgressBar
                      value={item.processedRecords}
                      max={item.totalRecords}
                      color="cyan"
                      showLabel
                      className="mt-3"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {item.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(item.id, item.supplierName)}
                    className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <RotateCcw size={13} /> Retry Feed
                  </button>
                )}
                {item.status === 'processing' && (
                  <button
                    onClick={() => handleCancel(item.id, item.supplierName)}
                    className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
