import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockLogs } from '../../data/mockData'
import type { LogEntry, LogLevel } from '../../types'
import {
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Download,
  FileCode,
  FileSpreadsheet,
  Activity,
  Terminal
} from 'lucide-react'

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRefreshLogs = () => {
    setIsRefreshing(true)
    showNotification('Refreshing system logs...')

    setTimeout(() => {
      const freshLog: LogEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'system',
        message: 'System audit logs refreshed by administrator',
        details: 'Manual refresh triggered. All supplier feed channels and active background sync traces verified.',
      }

      setLogs([freshLog, ...mockLogs])
      setIsRefreshing(false)
      showNotification('System logs refreshed successfully!')
    }, 1000)
  }

  const handleExportLogsJSON = () => {
    showNotification('Exporting logs JSON file...')
    const jsonString = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_System_Logs_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('System logs JSON file downloaded!')
  }

  const handleExportLogsCSV = () => {
    showNotification('Exporting logs CSV file...')
    const csvHeaders = 'Log ID,Timestamp,Level,Type,Supplier,Message,Details\n'
    const csvRows = filteredLogs.map(l =>
      `"${l.id}","${l.timestamp}","${l.level}","${l.type}","${l.supplierName || ''}","${l.message.replace(/"/g, '""')}","${(l.details || '').replace(/"/g, '""')}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_System_Logs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('System logs CSV file downloaded!')
  }

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs"><AlertCircle size={14} /> Error</span>
      case 'warning':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs"><AlertTriangle size={14} /> Warning</span>
      case 'success':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"><CheckCircle2 size={14} /> Success</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs"><Info size={14} /> Info</span>
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.supplierName && log.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    const matchesType = selectedType === 'all' || log.type === selectedType
    return matchesSearch && matchesLevel && matchesType
  })

  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id)
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Monitor background syncs, API requests, feed imports, and system events in real time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportLogsCSV}
            className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            title="Download Logs as CSV"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={handleExportLogsJSON}
            className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            title="Download Logs as JSON"
          >
            <FileCode size={14} className="text-indigo-600" /> Export JSON
          </button>
          <button
            onClick={handleRefreshLogs}
            disabled={isRefreshing}
            className="btn-primary btn-sm flex items-center gap-2 font-bold cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Log Entries', value: logs.length, color: 'text-slate-900', bg: 'bg-white', icon: <Terminal size={18} className="text-slate-700" /> },
          { label: 'Error Traces', value: logs.filter(l => l.level === 'error').length, color: 'text-rose-700', bg: 'bg-rose-50/80 border-rose-100', icon: <AlertCircle size={18} className="text-rose-600" /> },
          { label: 'Warnings Recorded', value: logs.filter(l => l.level === 'warning').length, color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-100', icon: <AlertTriangle size={18} className="text-amber-600" /> },
          { label: 'System Successes', value: logs.filter(l => l.level === 'success' || l.level === 'info').length, color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-100', icon: <CheckCircle2 size={18} className="text-emerald-600" /> },
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search logs by message, supplier name, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 pr-4 py-2 text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="select input-sm w-auto min-w-[130px] font-medium"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select input-sm w-auto min-w-[130px] font-medium"
            >
              <option value="all">All Types</option>
              <option value="sync">Sync</option>
              <option value="api">API</option>
              <option value="import">Import</option>
              <option value="ftp">FTP</option>
              <option value="validation">Validation</option>
              <option value="audit">Audit</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => toggleExpand(log.id)}
                className={`group cursor-pointer hover:bg-slate-50/80 transition duration-200 ${expandedLog === log.id ? 'bg-slate-50' : ''}`}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="pt-1 text-slate-400 group-hover:text-slate-600 transition">
                    {expandedLog === log.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {getLevelBadge(log.level)}
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-md uppercase tracking-wider border border-slate-200">{log.type}</span>
                      {log.supplierName && (
                        <span className="text-xs text-slate-600 font-semibold">
                          • {log.supplierName}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-800 leading-relaxed truncate">{log.message}</p>

                    {expandedLog === log.id && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                        <div className="mb-2 text-slate-400 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                          <span>LOG TRACE DETAILS (ID: {log.id})</span>
                          <span>Timestamp: {log.timestamp}</span>
                        </div>
                        {log.details ? (
                          <p className="whitespace-pre-wrap">{log.details}</p>
                        ) : (
                          <p className="text-slate-500 italic">No additional execution trace logs recorded for this event.</p>
                        )}
                        {log.jobId && <div className="mt-2 text-primary-400"><span className="text-slate-500 font-bold">Related Job ID:</span> {log.jobId}</div>}
                        {log.userId && <div className="mt-1 text-primary-400"><span className="text-slate-500 font-bold">Triggered By User ID:</span> {log.userId}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-bold text-slate-500">No logs found matching your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
