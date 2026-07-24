import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Clock, MoreVertical, RotateCcw, Download, Terminal, FileSpreadsheet } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockSyncJobs } from '../../data/mockData'
import { statusToVariant, timeAgo, formatDateTime } from '../../utils'
import type { SyncJob } from '../../types'
import { useAuth } from '../../context/AuthContext'

const jobTypeColor: Record<string, string> = {
  inventory: 'bg-primary-50 text-primary-700 border-primary-100',
  pricing:   'bg-emerald-50 text-emerald-700 border-emerald-100',
  image:     'bg-cyan-50 text-cyan-700 border-cyan-100',
  website:   'bg-violet-50 text-violet-700 border-violet-100',
  full:      'bg-amber-50 text-amber-700 border-amber-100',
}

export const SyncJobs: React.FC = () => {
  const { role } = useAuth()
  const [jobsList, setJobsList] = useState<SyncJob[]>(mockSyncJobs)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [detailJob, setDetailJob] = useState<SyncJob | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleTriggerSync = () => {
    const newJob: SyncJob = {
      id: `job_${Date.now()}`,
      type: 'full',
      name: 'Full Supplier & Catalog Resync',
      status: 'running',
      progress: 25,
      processedItems: 4200,
      totalItems: 18450,
      failedItems: 0,
      startedAt: new Date().toISOString(),
      triggeredBy: 'Manual Trigger',
      canRetry: false,
      logs: [
        'Job initialized by administrator',
        'Fetching supplier FTP & API channels...',
        'Processing product catalog updates...',
      ],
    }

    setJobsList([newJob, ...jobsList])
    showNotification('New Sync Job started successfully!')

    // Simulate progress
    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? { ...j, progress: 100, processedItems: 18450, status: 'completed' }
            : j
        )
      )
      showNotification('Sync Job completed successfully!')
    }, 2500)
  }

  const handleRetryJob = (id: string, name: string) => {
    setJobsList(prev =>
      prev.map(j =>
        j.id === id
          ? {
              ...j,
              status: 'running',
              progress: 45,
              failedItems: 0,
              startedAt: new Date().toISOString(),
            }
          : j
      )
    )
    showNotification(`Retrying sync job "${name}"...`)

    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          j.id === id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                processedItems: j.totalItems,
                canRetry: false,
              }
            : j
        )
      )
      showNotification(`Job "${name}" completed successfully!`)
    }, 2000)
  }

  const handleCancelJob = (id: string, name: string) => {
    setJobsList(prev =>
      prev.map(j =>
        j.id === id
          ? { ...j, status: 'failed', canRetry: true, progress: 50 }
          : j
      )
    )
    showNotification(`Job "${name}" cancelled.`)
  }

  const handleExportJobsCSV = () => {
    showNotification('Generating Sync Jobs CSV report...')
    const csvHeaders = 'Job ID,Job Name,Type,Status,Progress %,Processed Items,Total Items,Failed Items,Started At,Triggered By\n'
    const csvRows = jobsList.map(j =>
      `"${j.id}","${j.name}","${j.type}","${j.status}",${j.progress},${j.processedItems},${j.totalItems},${j.failedItems},"${j.startedAt || ''}","${j.triggeredBy || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Sync_Jobs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Sync Jobs CSV file downloaded!')
  }

  const tabs = [
    { id: 'all',       label: 'All Jobs',  count: jobsList.length },
    { id: 'running',   label: 'Running',   count: jobsList.filter(j => j.status === 'running').length },
    { id: 'queued',    label: 'Queued',    count: jobsList.filter(j => j.status === 'queued').length },
    { id: 'completed', label: 'Completed', count: jobsList.filter(j => j.status === 'completed').length },
    { id: 'failed',    label: 'Failed',    count: jobsList.filter(j => j.status === 'failed').length },
  ]

  const filtered = jobsList.filter(j => {
    const matchTab = tab === 'all' || j.status === tab
    const matchSearch = j.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

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
        title="Synchronization Jobs"
        subtitle="Monitor, audit, and trigger background synchronization jobs across all suppliers and stores"
        actions={
          <>
            <button
              onClick={handleExportJobsCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
              title="Download Jobs Report CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={() => showNotification('Sync jobs queue refreshed.')}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            {role !== 'operations_staff' && (
              <button onClick={handleTriggerSync} className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer">
                <PlayCircle size={14} /> Trigger Sync
              </button>
            )}
          </>
        }
      />

      {/* KPI Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Running Jobs', value: jobsList.filter(j => j.status === 'running').length, color: 'text-cyan-700', bg: 'bg-cyan-50/80 border-cyan-100', icon: <RefreshCw size={18} className="animate-spin text-cyan-600" /> },
          { label: 'Queued Jobs',  value: jobsList.filter(j => j.status === 'queued').length, color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-100', icon: <Clock size={18} className="text-amber-600" /> },
          { label: 'Completed Jobs', value: jobsList.filter(j => j.status === 'completed').length, color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-100', icon: <CheckCircle2 size={18} className="text-emerald-600" /> },
          { label: 'Failed Jobs',  value: jobsList.filter(j => j.status === 'failed').length, color: 'text-rose-700', bg: 'bg-rose-50/80 border-rose-100', icon: <XCircle size={18} className="text-rose-600" /> },
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
      <FilterBar search={search} onSearch={setSearch} placeholder="Search jobs by name, ID, or supplier..." />

      <div className="card overflow-hidden border border-slate-200 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[220px]">Job Name</th>
                <th className="min-w-[110px]">Type</th>
                <th className="min-w-[110px]">Status</th>
                <th className="min-w-[150px]">Progress</th>
                <th className="min-w-[160px]">Items Processed</th>
                <th className="min-w-[120px]">Started At</th>
                <th className="min-w-[140px]">Triggered By</th>
                <th className="text-right min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                    No synchronization jobs found matching your criteria.
                  </td>
                </tr>
              )}
              {filtered.map(job => (
                <tr key={job.id} className="cursor-pointer hover:bg-slate-50/80 transition-colors" onClick={() => setDetailJob(job)}>
                  <td>
                    <p className="font-bold text-slate-900 text-sm leading-snug">{job.name}</p>
                    {job.supplierName && <p className="text-xs text-slate-400 font-medium mt-0.5">{job.supplierName}</p>}
                    {job.storeName && <p className="text-xs text-slate-400 font-medium mt-0.5">{job.storeName}</p>}
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${jobTypeColor[job.type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {job.type}
                    </span>
                  </td>
                  <td>
                    <Badge variant={statusToVariant(job.status)} dot>{job.status}</Badge>
                  </td>
                  <td>
                    <ProgressBar
                      value={job.progress}
                      color={job.status === 'failed' ? 'rose' : job.status === 'completed' ? 'emerald' : 'primary'}
                      showLabel
                    />
                  </td>
                  <td>
                    <div className="text-xs font-medium whitespace-nowrap">
                      <span className="text-slate-900 font-bold">{job.processedItems.toLocaleString()}</span>
                      <span className="text-slate-400"> / {job.totalItems.toLocaleString()}</span>
                      {job.failedItems > 0 && <span className="text-rose-600 ml-1.5 font-bold">({job.failedItems} failed)</span>}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                      {job.startedAt ? timeAgo(job.startedAt) : job.scheduledAt ? formatDateTime(job.scheduledAt) : '—'}
                    </span>
                  </td>
                  <td><span className="text-xs text-slate-700 font-medium whitespace-nowrap">{job.triggeredBy}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {role !== 'operations_staff' && job.status === 'running' && (
                        <button
                          onClick={() => handleCancelJob(job.id, job.name)}
                          className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      )}
                      {role !== 'operations_staff' && job.canRetry && (
                        <button
                          onClick={() => handleRetryJob(job.id, job.name)}
                          className="btn-secondary btn-sm flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <RotateCcw size={13} /> Retry
                        </button>
                      )}
                      {role === 'operations_staff' && (
                        <span className="text-xs text-slate-400 italic pr-1">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Detail Modal */}
      {detailJob && (
        <Modal
          open
          onClose={() => setDetailJob(null)}
          title={detailJob.name}
          subtitle={`Job ID: ${detailJob.id} · Type: ${detailJob.type.toUpperCase()}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setDetailJob(null)} className="btn-secondary">Close</button>
              {role !== 'operations_staff' && detailJob.canRetry && (
                <button
                  onClick={() => { handleRetryJob(detailJob.id, detailJob.name); setDetailJob(null); }}
                  className="btn-primary flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <RotateCcw size={14} /> Retry Execution
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Execution Status', value: <Badge variant={statusToVariant(detailJob.status)} dot>{detailJob.status}</Badge> },
                { label: 'Progress Percentage', value: `${detailJob.progress}%` },
                { label: 'Total Catalog SKUs', value: detailJob.totalItems.toLocaleString() },
                { label: 'Processed SKUs', value: detailJob.processedItems.toLocaleString() },
                { label: 'Failed Items', value: <span className={detailJob.failedItems > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{detailJob.failedItems}</span> },
                { label: 'Triggered By', value: detailJob.triggeredBy },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <div className="text-sm font-bold text-slate-800">{item.value}</div>
                </div>
              ))}
            </div>

            <ProgressBar value={detailJob.progress} color={detailJob.status === 'failed' ? 'rose' : 'primary'} showLabel className="mt-2" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary-600" /> Console Trace Logs
                </p>
                <span className="text-2xs text-slate-400 font-mono">{detailJob.logs.length} lines logged</span>
              </div>
              <div className="bg-slate-900 text-slate-300 rounded-xl p-4 space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
                {detailJob.logs.length > 0 ? (
                  detailJob.logs.map((log, i) => (
                    <div key={i} className="text-slate-300 flex items-start gap-2">
                      <span className="text-slate-600 select-none">{i + 1}.</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No console logs recorded for this job execution.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
