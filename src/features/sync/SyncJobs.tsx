import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Clock, MoreVertical, RotateCcw } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockSyncJobs } from '../../data/mockData'
import { statusToVariant, timeAgo, formatDateTime } from '../../utils'
import type { SyncJob } from '../../types'

const jobTypeColor: Record<string, string> = {
  inventory: 'bg-primary-50 text-primary-700',
  pricing:   'bg-emerald-50 text-emerald-700',
  image:     'bg-cyan-50 text-cyan-700',
  website:   'bg-violet-50 text-violet-700',
  full:      'bg-amber-50 text-amber-700',
}

export const SyncJobs: React.FC = () => {
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
        'Fetching supplier FTP feeds...',
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
        title="Synchronization Jobs"
        subtitle="Monitor, audit, and trigger background synchronization jobs across all suppliers and stores"
        actions={
          <>
            <button
              onClick={() => showNotification('Sync jobs queue refreshed.')}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={handleTriggerSync} className="btn-primary btn-sm flex items-center gap-1.5">
              <PlayCircle size={14} /> Trigger Sync
            </button>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Running', value: jobsList.filter(j => j.status === 'running').length, color: 'text-cyan-600', bg: 'bg-cyan-50', icon: <RefreshCw size={16} className="animate-spin" /> },
          { label: 'Queued',  value: jobsList.filter(j => j.status === 'queued').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={16} /> },
          { label: 'Completed', value: jobsList.filter(j => j.status === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
          { label: 'Failed',  value: jobsList.filter(j => j.status === 'failed').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: <XCircle size={16} /> },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search jobs by name..." />

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Items Processed</th>
                <th>Started</th>
                <th>Triggered By</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} className="cursor-pointer hover:bg-slate-50/80 transition-colors" onClick={() => setDetailJob(job)}>
                  <td>
                    <p className="font-semibold text-slate-800 text-sm">{job.name}</p>
                    {job.supplierName && <p className="text-xs text-slate-400">{job.supplierName}</p>}
                    {job.storeName && <p className="text-xs text-slate-400">{job.storeName}</p>}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${jobTypeColor[job.type] || 'bg-slate-100 text-slate-700'}`}>
                      {job.type}
                    </span>
                  </td>
                  <td>
                    <Badge variant={statusToVariant(job.status)} dot>{job.status}</Badge>
                  </td>
                  <td className="min-w-[140px]">
                    <ProgressBar
                      value={job.progress}
                      color={job.status === 'failed' ? 'rose' : job.status === 'completed' ? 'emerald' : 'primary'}
                      showLabel
                    />
                  </td>
                  <td>
                    <div className="text-xs">
                      <span className="text-slate-700 font-medium">{job.processedItems.toLocaleString()}</span>
                      <span className="text-slate-400"> / {job.totalItems.toLocaleString()}</span>
                      {job.failedItems > 0 && <span className="text-rose-500 ml-1 font-semibold">({job.failedItems} failed)</span>}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {job.startedAt ? timeAgo(job.startedAt) : job.scheduledAt ? formatDateTime(job.scheduledAt) : '—'}
                    </span>
                  </td>
                  <td><span className="text-xs text-slate-500 font-medium">{job.triggeredBy}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {job.status === 'running' && (
                        <button
                          onClick={() => handleCancelJob(job.id, job.name)}
                          className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      )}
                      {job.canRetry && (
                        <button
                          onClick={() => handleRetryJob(job.id, job.name)}
                          className="btn-secondary btn-sm flex items-center gap-1"
                        >
                          <RotateCcw size={13} /> Retry
                        </button>
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
          subtitle={`Job ID: ${detailJob.id} · Type: ${detailJob.type}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setDetailJob(null)} className="btn-secondary">Close</button>
              {detailJob.canRetry && (
                <button
                  onClick={() => { handleRetryJob(detailJob.id, detailJob.name); setDetailJob(null); }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retry Job
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Status', value: <Badge variant={statusToVariant(detailJob.status)} dot>{detailJob.status}</Badge> },
                { label: 'Progress', value: `${detailJob.progress}%` },
                { label: 'Total Items', value: detailJob.totalItems.toLocaleString() },
                { label: 'Processed', value: detailJob.processedItems.toLocaleString() },
                { label: 'Failed Items', value: <span className={detailJob.failedItems > 0 ? 'text-rose-600' : 'text-emerald-600'}>{detailJob.failedItems}</span> },
                { label: 'Triggered By', value: detailJob.triggeredBy },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <div className="text-sm font-semibold text-slate-800">{item.value}</div>
                </div>
              ))}
            </div>
            <ProgressBar value={detailJob.progress} color={detailJob.status === 'failed' ? 'rose' : 'primary'} showLabel className="mt-2" />
            {detailJob.logs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Job Execution Logs</p>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-4 space-y-1 font-mono text-xs max-h-40 overflow-y-auto border border-slate-800">
                  {detailJob.logs.map((log, i) => (
                    <div key={i} className="text-slate-300">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
