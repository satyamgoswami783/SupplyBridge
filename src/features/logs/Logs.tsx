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
  ChevronDown
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

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-100 shadow-sm"><AlertCircle size={14} /> Error</span>
      case 'warning':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shadow-sm"><AlertTriangle size={14} /> Warning</span>
      case 'success':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"><CheckCircle2 size={14} /> Success</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-100 shadow-sm"><Info size={14} /> Info</span>
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor background syncs, API calls, and integration events in real time.</p>
        </div>
        <button
          onClick={handleRefreshLogs}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-98 transition duration-200 shadow-sm disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-primary-600' : ''} />
          {isRefreshing ? 'Refreshing Logs...' : 'Refresh Logs'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search logs by message, supplier, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition duration-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition duration-200 cursor-pointer"
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
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition duration-200 cursor-pointer"
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
                className={`group cursor-pointer hover:bg-slate-50 transition duration-200 ${expandedLog === log.id ? 'bg-slate-50' : ''}`}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="pt-0.5 text-slate-400 group-hover:text-slate-600 transition">
                    {expandedLog === log.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {getLevelBadge(log.level)}
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">{log.type}</span>
                      {log.supplierName && (
                        <span className="text-xs text-slate-500 font-medium">
                          • {log.supplierName}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-700 leading-relaxed truncate">{log.message}</p>

                    {expandedLog === log.id && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                        <div className="mb-2 text-slate-400 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                          <span>LOG DETAILS (ID: {log.id})</span>
                          <span>Timestamp: {log.timestamp}</span>
                        </div>
                        {log.details ? (
                          <p className="whitespace-pre-wrap">{log.details}</p>
                        ) : (
                          <p className="text-slate-500 italic">No additional details available for this log entry.</p>
                        )}
                        {log.jobId && <div className="mt-2 text-primary-400"><span className="text-slate-500">Related Job ID:</span> {log.jobId}</div>}
                        {log.userId && <div className="mt-1 text-primary-400"><span className="text-slate-500">Triggered By User ID:</span> {log.userId}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-500">No logs found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
