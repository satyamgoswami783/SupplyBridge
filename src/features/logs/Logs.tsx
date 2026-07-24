import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockLogs } from '../../data/mockData'
import type { LogEntry, LogLevel } from '../../types'
import {
  AlertCircle, Info, CheckCircle2, AlertTriangle, Search, RefreshCw,
  ChevronRight, ChevronDown, Download, FileCode, FileSpreadsheet, Trash2, Shield, Database, Terminal, Filter, Code, ArrowUpRight, Activity
} from 'lucide-react'
import { SectionHeader, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [activeLogModal, setActiveLogModal] = useState<LogEntry | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRefreshLogs = () => {
    setIsRefreshing(true)
    showNotification('Fetching live system audit traces...')

    setTimeout(() => {
      const freshLog: LogEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'sync',
        supplierName: 'Shift4Shop Gateway',
        message: 'Shift4Shop REST API catalog sync heartbeat check successful [200 OK]',
        details: 'API endpoint https://apirest.3dcart.com/v2/Products responded in 48ms. All authorization tokens valid.',
      }

      setLogs([freshLog, ...logs])
      setIsRefreshing(false)
      showNotification('System logs refreshed with latest operational traces!')
    }, 800)
  }

  const handleClearLogs = () => {
    setLogs(prev => prev.filter(l => l.level === 'error'))
    setClearConfirmOpen(false)
    showNotification('Resolved non-critical audit logs cleared. Error traces retained for security compliance.')
  }

  const handleExportLogsJSON = () => {
    showNotification('Exporting audit logs as JSON file...')
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
    showNotification('Exporting audit logs as CSV file...')
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
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"><AlertCircle size={12} /> ERROR</span>
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><AlertTriangle size={12} /> WARN</span>
      case 'success':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={12} /> OK</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800"><Info size={12} /> INFO</span>
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
        title="System Audit & Integration Logs"
        subtitle="Real-time audit trails of supplier feeds, Shift4Shop API publishing, validation exceptions, and security events"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setClearConfirmOpen(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 hover:text-rose-600"
              title="Clear Non-critical Resolved Logs"
            >
              <Trash2 size={14} /> Flush Logs
            </button>
            <button
              onClick={handleExportLogsCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5"
              title="Download Logs as CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleExportLogsJSON}
              className="btn-secondary btn-sm flex items-center gap-1.5"
              title="Download Logs as JSON"
            >
              <FileCode size={14} className="text-indigo-600 dark:text-indigo-400" /> Export JSON
            </button>
            <button
              onClick={handleRefreshLogs}
              disabled={isRefreshing}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-white' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
            </button>
          </div>
        }
      />

      {/* Log Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Event Traces', value: logs.length, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Errors Reported', value: logs.filter(l => l.level === 'error').length, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Warnings Triggered', value: logs.filter(l => l.level === 'warning').length, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Successful Syncs', value: logs.filter(l => l.level === 'success').length, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log Filters & List */}
      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search logs by SKU, message, supplier, error code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="select input-sm w-auto min-w-[130px]"
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
              className="select input-sm w-auto min-w-[140px]"
            >
              <option value="all">All Source Modules</option>
              <option value="sync">Sync Pipeline</option>
              <option value="api">API Gateway</option>
              <option value="import">File Import Feed</option>
              <option value="ftp">FTP/SFTP Server</option>
              <option value="validation">Validation Center</option>
              <option value="audit">Security Audit</option>
              <option value="system">System Kernel</option>
            </select>
          </div>
        </div>

        {/* Log Stream */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[550px] overflow-y-auto scrollbar-hide">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => toggleExpand(log.id)}
                className={`group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition duration-150 ${expandedLog === log.id ? 'bg-slate-50 dark:bg-slate-850/80' : ''}`}
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="pt-0.5 text-slate-400 group-hover:text-slate-600 transition">
                    {expandedLog === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getLevelBadge(log.level)}
                      <span className="px-2 py-0.5 text-2xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded uppercase tracking-wider">{log.type}</span>
                      {log.supplierName && (
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          • {log.supplierName}
                        </span>
                      )}
                      <span className="text-2xs text-slate-400 ml-auto font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">{log.message}</p>

                    {expandedLog === log.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-2xs leading-relaxed overflow-x-auto shadow-2xl border border-slate-800"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="mb-2 text-slate-400 font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
                          <span>SYSTEM TRACE DETAILS (ID: {log.id})</span>
                          <button
                            onClick={() => setActiveLogModal(log)}
                            className="text-primary-400 hover:underline flex items-center gap-1 text-2xs font-bold"
                          >
                            Expand JSON Modal <ArrowUpRight size={12} />
                          </button>
                        </div>
                        {log.details ? (
                          <p className="whitespace-pre-wrap text-slate-300">{log.details}</p>
                        ) : (
                          <p className="text-slate-500 italic">No stack trace or extended payload recorded.</p>
                        )}
                        <div className="mt-3 pt-2 border-t border-slate-900 flex flex-wrap gap-4 text-slate-400 text-2xs">
                          {log.jobId && <div><span className="text-slate-500">Job ID:</span> <code className="text-cyan-400">{log.jobId}</code></div>}
                          {log.userId && <div><span className="text-slate-500">Triggered By:</span> <code className="text-cyan-400">{log.userId}</code></div>}
                          <div><span className="text-slate-500">Server Endpoint:</span> <code className="text-emerald-400">https://apirest.3dcart.com/v2/</code></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-500">No logs found matching search query "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>

      {/* LOG JSON MODAL */}
      {activeLogModal && (
        <Modal
          open
          onClose={() => setActiveLogModal(null)}
          title={`Trace Payload: ${activeLogModal.id}`}
          subtitle={`Full JSON log entry for ${activeLogModal.message}`}
          size="lg"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {getLevelBadge(activeLogModal.level)}
              <span className="text-2xs font-mono text-slate-400">{activeLogModal.timestamp}</span>
            </div>
            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto border border-slate-800">
              <pre>{JSON.stringify(activeLogModal, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveLogModal(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* CLEAR LOGS CONFIRM DIALOG */}
      {clearConfirmOpen && (
        <ConfirmDialog
          open
          onClose={() => setClearConfirmOpen(false)}
          onConfirm={handleClearLogs}
          title="Flush Non-critical System Logs?"
          message="Are you sure you want to clear info, warning, and success logs? Error traces will be preserved for security audit compliance."
          confirmLabel="Flush Logs"
          danger
        />
      )}
    </div>
  )
}
