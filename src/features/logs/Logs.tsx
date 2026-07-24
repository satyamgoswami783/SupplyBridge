import React, { useState } from 'react'
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
          <button onClick={handleRefresh} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin" : ""} />
            Refresh Logs
          </button>
        }
      />

      {/* KPI Cards for System Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Logged Events', value: mockLogs.length, sub: 'Last 24 hours', icon: <FileText size={16} className="text-primary-600" />, bg: 'bg-primary-50' },
          { label: 'Errors Logged', value: mockLogs.filter(l => l.level === 'error').length, sub: 'Requires attention', icon: <ShieldAlert size={16} className="text-rose-600" />, bg: 'bg-rose-50' },
          { label: 'Warnings', value: mockLogs.filter(l => l.level === 'warning').length, sub: 'System warnings', icon: <AlertTriangle size={16} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Sync & Import Success', value: '98.4%', sub: 'Avg success rate', icon: <CheckCircle2 size={16} className="text-emerald-600" />, bg: 'bg-emerald-50' },
        ].map((card, idx) => (
          <div key={idx} className="card p-5 flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs font-semibold text-slate-800 mt-1">{card.label}</p>
              <p className="text-xxs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Filter Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

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
        </div>
      </FilterBar>

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
                <th className="py-3 px-4 w-44">Source Context</th>
                <th className="py-3 px-4 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-700">
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{getLevelIcon(log.level)}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xxs font-mono font-semibold uppercase border ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-md sm:max-w-xl" title={log.message}>
                        {log.message}
                      </div>
                      {log.details && (
                        <div className="text-slate-400 truncate max-w-md sm:max-w-xl mt-0.5 text-xxs">
                          {log.details}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {log.supplierName ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 truncate max-w-[150px]">{log.supplierName}</span>
                          {log.jobId && <span className="text-xxs text-slate-400">Job: <code className="mono">{log.jobId}</code></span>}
                        </div>
                      ) : log.userName ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{log.userName}</span>
                          {log.ip && <span className="text-xxs text-slate-400">IP: {log.ip}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Core</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-icon mx-auto text-slate-400 hover:text-primary-600"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No log events found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Log Event Details"
        subtitle={`ID: ${selectedLog?.id || ''}`}
        size="md"
        footer={
          <button onClick={() => setSelectedLog(null)} className="btn-primary btn-sm">
            Close Details
          </button>
        }
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Timestamp</label>
                <div className="font-mono text-slate-700 mt-1">
                  {format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS XXX')}
                </div>
              </div>
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Severity Level</label>
                <div className="mt-1">{getLevelBadge(selectedLog.level)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Category Type</label>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-xxs font-mono font-semibold uppercase border ${getTypeColor(selectedLog.type)}`}>
                    {selectedLog.type}
                  </span>
                </div>
              </div>
              {selectedLog.jobId && (
                <div>
                  <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Job ID Context</label>
                  <div className="font-mono text-slate-700 mt-1">{selectedLog.jobId}</div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Message</label>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-800 font-semibold mt-1">
                {selectedLog.message}
              </div>
            </div>

            {selectedLog.details && (
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Extended Diagnostics / Output</label>
                <pre className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-3.5 font-mono overflow-x-auto mt-1 whitespace-pre-wrap max-h-48 scrollbar-thin">
                  {selectedLog.details}
                </pre>
              </div>
            )}

            {(selectedLog.supplierId || selectedLog.supplierName) && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Supplier Reference</label>
                <div className="grid grid-cols-2 gap-2 text-xxs">
                  <div>
                    <span className="text-slate-400">Name:</span> <span className="font-medium text-slate-700">{selectedLog.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ID:</span> <code className="font-mono text-slate-600">{selectedLog.supplierId}</code>
                  </div>
                </div>
              </div>
            )}

            {(selectedLog.userId || selectedLog.userName) && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">User Context</label>
                <div className="grid grid-cols-2 gap-2 text-xxs">
                  <div>
                    <span className="text-slate-400">User:</span> <span className="font-medium text-slate-700">{selectedLog.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">IP address:</span> <code className="font-mono text-slate-600">{selectedLog.ip}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
