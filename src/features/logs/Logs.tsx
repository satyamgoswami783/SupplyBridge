import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, AlertTriangle, AlertCircle, CheckCircle2, Info, Search,
  RefreshCw, Terminal, SlidersHorizontal, Calendar, User, ShieldAlert,
  Server, Cpu, Eye, X, HelpCircle, FileCode, FileSpreadsheet
} from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockLogs } from '../../data/mockData'
import { format } from 'date-fns'
import type { LogEntry, LogLevel, LogType } from '../../types'

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRefresh = () => {
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
      setLogs(prev => [freshLog, ...prev])
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

  // Tabs for Quick Filters based on Log Level
  const tabs = [
    { id: 'all', label: 'All Logs', count: logs.length },
    { id: 'error', label: 'Errors', count: logs.filter(l => l.level === 'error').length },
    { id: 'warning', label: 'Warnings', count: logs.filter(l => l.level === 'warning').length },
    { id: 'info', label: 'Info & System', count: logs.filter(l => l.level === 'info' || l.level === 'success').length },
  ]

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    // Tab filter
    if (activeTab === 'error' && log.level !== 'error') return false
    if (activeTab === 'warning' && log.level !== 'warning') return false
    if (activeTab === 'info' && log.level !== 'info' && log.level !== 'success') return false

    // Additional dropdown filters
    if (levelFilter !== 'all' && log.level !== levelFilter) return false
    if (typeFilter !== 'all' && log.type !== typeFilter) return false

    // Search filter (searches message, supplierName, details, jobId, and type)
    const searchLower = search.toLowerCase()
    const matchesSearch =
      log.message.toLowerCase().includes(searchLower) ||
      (log.details && log.details.toLowerCase().includes(searchLower)) ||
      (log.supplierName && log.supplierName.toLowerCase().includes(searchLower)) ||
      (log.jobId && log.jobId.toLowerCase().includes(searchLower)) ||
      log.type.toLowerCase().includes(searchLower)

    return matchesSearch
  })

  // Log level styling helper
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <Badge variant="danger" dot>Error</Badge>
      case 'warning':
        return <Badge variant="warning" dot>Warning</Badge>
      case 'success':
        return <Badge variant="success" dot>Success</Badge>
      case 'info':
        return <Badge variant="info" dot>Info</Badge>
      case 'debug':
        return <Badge variant="neutral" dot>Debug</Badge>
      default:
        return <Badge variant="neutral">{level}</Badge>
    }
  }

  // Log level icon helper
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="text-rose-500" size={16} />
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={16} />
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={16} />
      case 'info':
        return <Info className="text-blue-500" size={16} />
      case 'debug':
        return <Terminal className="text-slate-500" size={16} />
      default:
        return <HelpCircle className="text-slate-400" size={16} />
    }
  }

  // Log type color helper
  const getTypeColor = (type: LogType) => {
    switch (type) {
      case 'import': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'sync': return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      case 'api': return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
      case 'ftp': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'validation': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'audit': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'system': return 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
      case 'error': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      default: return 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
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
        title="Activity & Logs"
        subtitle="Real-time audit trails, integration events, synchronization actions, and system error logs"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportLogsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition duration-200 shadow-sm cursor-pointer"
              title="Download Logs as CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleExportLogsJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition duration-200 shadow-sm cursor-pointer"
              title="Download Logs as JSON"
            >
              <FileCode size={14} className="text-indigo-600 dark:text-indigo-400" /> Export JSON
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary btn-sm flex items-center gap-1.5 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary-600 dark:text-primary-400" : ""} />
              {isRefreshing ? 'Refreshing Logs...' : 'Refresh Logs'}
            </button>
          </div>
        }
      />

      {/* KPI Cards for System Issues */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { id: 'all', label: 'Total Logged Events', value: logs.length, sub: 'Last 24 hours', icon: <FileText size={16} className="text-primary-600 dark:text-primary-400" />, bg: 'bg-primary-50', activeClass: 'border-primary-500 ring-2 ring-primary-500/10 bg-primary-25/50', activeNumberClass: 'text-primary-600 dark:text-primary-400' },
          { id: 'error', label: 'Errors Logged', value: logs.filter(l => l.level === 'error').length, sub: 'Requires attention', icon: <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400" />, bg: 'bg-rose-50', activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
          { id: 'warning', label: 'Warnings', value: logs.filter(l => l.level === 'warning').length, sub: 'System warnings', icon: <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50', activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
          { id: 'info', label: 'Sync & Import Success', value: '98.4%', sub: 'Avg success rate', icon: <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50', activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
        ].map((card) => {
          const isSelected = activeTab === card.id;
          return (
            <div
              key={card.label}
              onClick={() => setActiveTab(card.id)}
              className={`card p-3.5 sm:p-4 flex items-start justify-between transition-all duration-200 cursor-pointer hover:shadow-card-md hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${
                isSelected ? card.activeClass : 'border-surface-border'
              }`}
            >
              <div>
                <p className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${isSelected ? card.activeNumberClass : 'text-slate-900 dark:text-slate-100'}`}>{card.value}</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{card.label}</p>
                <p className="text-xxs text-slate-400 dark:text-slate-400 mt-0.5">{card.sub}</p>
              </div>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.bg} dark:bg-slate-800/80 flex items-center justify-center flex-shrink-0 ml-1`}>
                {card.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Filter Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Filter Bar with Dropdowns */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search log message, details, job ID...">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          {/* Supplier Filter Dropdown */}
          <select
            className="input py-1.5 px-3 text-xs flex-1 sm:w-36 min-w-[120px]"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Log Category Filter Dropdown */}
          <select
            className="input py-1.5 px-3 text-xs flex-1 sm:w-40 min-w-[130px]"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Log Types</option>
            <option value="api">API Logs</option>
            <option value="ftp">FTP Logs</option>
            <option value="import">Import Logs</option>
            <option value="sync">Sync Logs</option>
            <option value="audit">User Activity</option>
            <option value="error">Error Logs</option>
          </select>
        </div>
      </FilterBar>

      {/* Logs Table Card */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12 text-center">Level</th>
                <th className="w-40">Timestamp</th>
                <th className="w-28">Type</th>
                <th>Message & Details</th>
                <th className="w-44">Scope</th>
                <th className="w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td data-label="Level" className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-end sm:justify-center gap-1.5">
                        {getLevelIcon(log.level)}
                        <span className="font-bold capitalize text-xs sm:hidden text-slate-700 dark:text-slate-200">{log.level}</span>
                      </div>
                    </td>
                    <td data-label="Timestamp" className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td data-label="Type" className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold border uppercase ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td data-label="Message" className="py-3.5 px-4">
                      <div className="flex-1 text-right sm:text-left min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">{log.message}</p>
                        {log.details && (
                          <p className="text-xxs text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1">{log.details}</p>
                        )}
                      </div>
                    </td>
                    <td data-label="Scope" className="py-3.5 px-4">
                      {log.supplierName ? (
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{log.supplierName}</p>
                          {log.jobId && <p className="text-3xs text-slate-400">Job: <code className="font-mono">{log.jobId}</code></p>}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-400 italic">System Scope</span>
                      )}
                    </td>
                    <td data-label="Action" className="mobile-hidden py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLog(log)
                        }}
                        className="btn-icon hover:bg-primary-600 hover:text-white transition-all duration-200"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <SlidersHorizontal size={24} className="text-slate-300" />
                      <p className="font-medium">No logs matched the selected filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Diagnostics Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Event Diagnostics & Metadata"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getLevelIcon(selectedLog.level)}
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase">{selectedLog.type} Event</span>
              </div>
              {getLevelBadge(selectedLog.level)}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">Event Message</h4>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {selectedLog.message}
              </p>
            </div>

            {selectedLog.details && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Diagnostic Details</h4>
                <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 border border-slate-800 rounded-xl font-mono leading-relaxed overflow-x-auto">
                  {selectedLog.details}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Metadata Context</h4>
                <div className="space-y-1 text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400">Event ID:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.id}</code>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400">Timestamp:</span> <span className="text-slate-600 dark:text-slate-300">{selectedLog.timestamp}</span>
                  </div>
                  {selectedLog.jobId && (
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Job ID Reference:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.jobId}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Trigger Context</h4>
                <div className="space-y-1 text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400">Target Supplier:</span> <span className="text-slate-600 dark:text-slate-300 font-semibold">{selectedLog.supplierName || 'System'}</span>
                  </div>
                  {selectedLog.userId && (
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Triggered User:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.userId}</code>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 dark:text-slate-400">IP address:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.ip}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
