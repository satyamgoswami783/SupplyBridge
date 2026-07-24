import React, { useState } from 'react'
<<<<<<< HEAD
import { motion } from 'framer-motion'
import {
  FileText, AlertTriangle, AlertCircle, CheckCircle2, Info, Search,
  RefreshCw, Terminal, SlidersHorizontal, Calendar, User, ShieldAlert,
  Server, Cpu, Eye, X, HelpCircle
} from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockLogs } from '../../data/mockData'
import { format } from 'date-fns'
import type { LogEntry, LogLevel, LogType } from '../../types'

export const Logs: React.FC = () => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [refreshKey, setRefreshKey] = useState(0)
=======
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
>>>>>>> b75d266793ced3e7941001ffd18bd1ae128139e9

  // Tabs for Quick Filters based on Log Level
  const tabs = [
    { id: 'all', label: 'All Logs', count: mockLogs.length },
    { id: 'error', label: 'Errors', count: mockLogs.filter(l => l.level === 'error').length },
    { id: 'warning', label: 'Warnings', count: mockLogs.filter(l => l.level === 'warning').length },
    { id: 'info', label: 'Info & System', count: mockLogs.filter(l => l.level === 'info' || l.level === 'success').length },
  ]

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Filtering Logic
  const filteredLogs = mockLogs.filter(log => {
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
<<<<<<< HEAD
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
      case 'import': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'sync': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'api': return 'bg-cyan-50 text-cyan-700 border-cyan-200'
      case 'ftp': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'validation': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'audit': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'system': return 'bg-slate-50 text-slate-700 border-slate-200'
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  return (
    <div>
      <SectionHeader
        title="Activity & Logs"
        subtitle="Real-time audit trails, integration events, synchronization actions, and system error logs"
        actions={
          <button onClick={handleRefresh} className="btn-secondary btn-sm flex items-center gap-1.5 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200 shadow-sm">
            <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin" : ""} />
            Refresh Logs
          </button>
        }
      />

      {/* KPI Cards for System Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { id: 'all', label: 'Total Logged Events', value: mockLogs.length, sub: 'Last 24 hours', icon: <FileText size={16} className="text-primary-600" />, bg: 'bg-primary-50', activeClass: 'border-primary-500 ring-2 ring-primary-500/10 bg-primary-25/50', activeNumberClass: 'text-primary-600' },
          { id: 'error', label: 'Errors Logged', value: mockLogs.filter(l => l.level === 'error').length, sub: 'Requires attention', icon: <ShieldAlert size={16} className="text-rose-600" />, bg: 'bg-rose-50', activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50', activeNumberClass: 'text-rose-600' },
          { id: 'warning', label: 'Warnings', value: mockLogs.filter(l => l.level === 'warning').length, sub: 'System warnings', icon: <AlertTriangle size={16} className="text-amber-600" />, bg: 'bg-amber-50', activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50', activeNumberClass: 'text-amber-600' },
          { id: 'info', label: 'Sync & Import Success', value: '98.4%', sub: 'Avg success rate', icon: <CheckCircle2 size={16} className="text-emerald-600" />, bg: 'bg-emerald-50', activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50', activeNumberClass: 'text-emerald-600' },
        ].map((card) => {
          const isSelected = activeTab === card.id;
          return (
            <div
              key={card.label}
              onClick={() => setActiveTab(card.id)}
              className={`card p-5 flex items-start justify-between transition-all duration-200 cursor-pointer hover:shadow-card-md hover:border-slate-300 ${
                isSelected ? card.activeClass : 'border-surface-border'
              }`}
            >
              <div>
                <p className={`text-2xl font-bold transition-colors duration-200 ${isSelected ? card.activeNumberClass : 'text-slate-900'}`}>{card.value}</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">{card.label}</p>
                <p className="text-xxs text-slate-400 mt-0.5">{card.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                {card.icon}
              </div>
            </div>
          );
        })}
=======
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
>>>>>>> b75d266793ced3e7941001ffd18bd1ae128139e9
      </div>

      {/* Quick Filter Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

<<<<<<< HEAD
      {/* Filter Bar with Dropdowns */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search log message, details, job ID...">
        <div className="flex gap-2">
          {/* Level Filter Dropdown */}
          <select
            className="input py-1 px-3 text-xs w-36"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          {/* Type Filter Dropdown */}
          <select
            className="input py-1 px-3 text-xs w-36"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="import">Import</option>
            <option value="sync">Sync</option>
            <option value="api">API Connection</option>
            <option value="ftp">FTP Connection</option>
            <option value="validation">Validation</option>
            <option value="audit">Audit Log</option>
            <option value="system">System Status</option>
            <option value="error">General Error</option>
          </select>
=======
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
>>>>>>> b75d266793ced3e7941001ffd18bd1ae128139e9
        </div>
      </FilterBar>

<<<<<<< HEAD
      {/* Logs Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-semibold text-xs border-b border-slate-100">
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4 w-28">Timestamp</th>
                <th className="py-3 px-4 w-24">Type</th>
                <th className="py-3 px-4">Event Message</th>
                <th className="py-3 px-4 w-40">Source Context</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{getLevelIcon(log.level)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold border uppercase ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 leading-snug">{log.message}</p>
                      {log.details && (
                        <p className="text-xxs text-slate-400 mt-0.5 line-clamp-1">{log.details}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.supplierName ? (
                        <div>
                          <p className="font-semibold text-slate-700">{log.supplierName}</p>
                          {log.jobId && <p className="text-3xs text-slate-400">Job: <code className="font-mono">{log.jobId}</code></p>}
=======
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
>>>>>>> b75d266793ced3e7941001ffd18bd1ae128139e9
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Scope</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getLevelIcon(selectedLog.level)}
                <span className="font-bold text-sm text-slate-800 uppercase">{selectedLog.type} Event</span>
              </div>
              {getLevelBadge(selectedLog.level)}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Event Message</h4>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium leading-relaxed">
                {selectedLog.message}
              </p>
            </div>

            {selectedLog.details && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Diagnostic Details</h4>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono leading-relaxed overflow-x-auto">
                  {selectedLog.details}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Metadata Context</h4>
                <div className="space-y-1 text-slate-500">
                  <div>
                    <span className="text-slate-400">Event ID:</span> <code className="font-mono text-slate-600">{selectedLog.id}</code>
                  </div>
                  <div>
                    <span className="text-slate-400">Timestamp:</span> <span className="text-slate-600">{selectedLog.timestamp}</span>
                  </div>
                  {selectedLog.jobId && (
                    <div>
                      <span className="text-slate-400">Job ID Reference:</span> <code className="font-mono text-slate-600">{selectedLog.jobId}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Trigger Context</h4>
                <div className="space-y-1 text-slate-500">
                  <div>
                    <span className="text-slate-400">Target Supplier:</span> <span className="text-slate-600 font-semibold">{selectedLog.supplierName || 'System'}</span>
                  </div>
                  {selectedLog.userId && (
                    <div>
                      <span className="text-slate-400">Triggered User:</span> <code className="font-mono text-slate-600">{selectedLog.userId}</code>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">IP address:</span> <code className="font-mono text-slate-600">{selectedLog.ip}</code>
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
