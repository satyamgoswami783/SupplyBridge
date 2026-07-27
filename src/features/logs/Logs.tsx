import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, AlertTriangle, AlertCircle, CheckCircle2, Info, Search,
  RefreshCw, Terminal, Activity, Eye, X, HelpCircle, Filter
} from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockLogs, mockActivities } from '../../data/mockData'
import { format } from 'date-fns'
import type { LogEntry, LogLevel, LogType } from '../../types'

export const Logs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentView = searchParams.get('view') === 'system' ? 'system' : 'activity'

  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [search, setSearch] = useState('')
  const [activityFilter, setActivityFilter] = useState('All')
  const [systemLogType, setSystemLogType] = useState('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    showNotification('Refreshing logs...')
    setTimeout(() => {
      setIsRefreshing(false)
      showNotification('Logs refreshed successfully!')
    }, 600)
  }

  // Top Tabs: Activity Feed vs System Logs
  const mainTabs = [
    { id: 'activity', label: 'Activity Feed' },
    { id: 'system',   label: 'System Logs' },
  ]

  // Filtered System Logs
  const filteredSystemLogs = logs.filter(log => {
    if (systemLogType !== 'all' && log.type !== systemLogType) return false

    const searchLower = search.toLowerCase()
    return (
      log.message.toLowerCase().includes(searchLower) ||
      (log.details && log.details.toLowerCase().includes(searchLower)) ||
      (log.supplierName && log.supplierName.toLowerCase().includes(searchLower)) ||
      (log.jobId && log.jobId.toLowerCase().includes(searchLower)) ||
      log.type.toLowerCase().includes(searchLower)
    )
  })

  // Filtered Activity Timeline
  const filteredActivities = mockActivities.filter(act => {
    const matchesSearch = act.message.toLowerCase().includes(search.toLowerCase())
    if (activityFilter === 'All') return matchesSearch
    if (activityFilter === 'Supplier') return matchesSearch && (act.message.includes('Supplier') || act.message.includes('TechParts') || act.message.includes('Acme'))
    if (activityFilter === 'Store') return matchesSearch && (act.message.includes('Store') || act.message.includes('Shop'))
    if (activityFilter === 'Inventory') return matchesSearch && (act.message.includes('Inventory') || act.message.includes('Stock'))
    if (activityFilter === 'Pricing') return matchesSearch && (act.message.includes('Price') || act.message.includes('Pricing') || act.message.includes('Cost'))
    if (activityFilter === 'Images') return matchesSearch && (act.message.includes('Image') || act.message.includes('Media'))
    if (activityFilter === 'Errors') return matchesSearch && (act.color === 'rose' || act.message.includes('failed') || act.message.includes('Error'))
    if (activityFilter === 'Warnings') return matchesSearch && (act.color === 'amber' || act.message.includes('warning'))
    if (activityFilter === 'Manual Actions') return matchesSearch && (act.message.includes('Manual') || act.message.includes('triggered'))
    return matchesSearch
  })

  // Log level styling helper
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'error':   return <Badge variant="danger" dot>Error</Badge>
      case 'warning': return <Badge variant="warning" dot>Warning</Badge>
      case 'success': return <Badge variant="success" dot>Success</Badge>
      case 'info':    return <Badge variant="info" dot>Info</Badge>
      default:        return <Badge variant="neutral">{level}</Badge>
    }
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':   return <AlertCircle className="text-rose-500" size={16} />
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />
      case 'info':    return <Info className="text-blue-500" size={16} />
      default:        return <Terminal className="text-slate-500" size={16} />
    }
  }

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case 'import': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'sync':   return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      case 'api':    return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
      case 'ftp':    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'audit':  return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'error':  return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      default:       return 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
        subtitle="Real-time activity feed timeline and system operational logs"
        actions={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary-600 dark:text-primary-400" : ""} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        }
      />

      {/* Main Mode Tabs */}
      <Tabs
        tabs={mainTabs}
        active={currentView}
        onChange={v => setSearchParams({ view: v })}
      />

      {/* 1. ACTIVITY FEED VIEW */}
      {currentView === 'activity' && (
        <div className="space-y-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search activity timeline...">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {[
                'All', 'Supplier', 'Store', 'Inventory', 'Pricing', 'Images', 'Errors', 'Warnings', 'Manual Actions'
              ].map(f => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activityFilter === f
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </FilterBar>

          <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            {filteredActivities.map(act => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
                blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
                rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
              }
              return (
                <div key={act.id} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[act.color]}`}>
                    <Activity size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{act.message}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. SYSTEM LOGS VIEW */}
      {currentView === 'system' && (
        <div className="space-y-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search API, FTP, import, sync logs...">
            <select
              className="select input-sm w-44 font-medium"
              value={systemLogType}
              onChange={e => setSystemLogType(e.target.value)}
            >
              <option value="all">All Log Types</option>
              <option value="api">API Logs</option>
              <option value="ftp">FTP Logs</option>
              <option value="import">Import Logs</option>
              <option value="sync">Sync Logs</option>
              <option value="audit">User Activity Logs</option>
            </select>
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
                  {filteredSystemLogs.length > 0 ? (
                    filteredSystemLogs.map(log => (
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
                          <FileText size={24} className="text-slate-300" />
                          <p className="font-medium">No logs matched the selected filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
