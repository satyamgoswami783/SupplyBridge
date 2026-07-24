import React, { useState } from 'react'
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
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [detailJob, setDetailJob] = useState<SyncJob | null>(null)

  const tabs = [
    { id: 'all',       label: 'All Jobs',  count: mockSyncJobs.length },
    { id: 'running',   label: 'Running',   count: mockSyncJobs.filter(j => j.status === 'running').length },
    { id: 'queued',    label: 'Queued',    count: mockSyncJobs.filter(j => j.status === 'queued').length },
    { id: 'completed', label: 'Completed', count: mockSyncJobs.filter(j => j.status === 'completed').length },
    { id: 'failed',    label: 'Failed',    count: mockSyncJobs.filter(j => j.status === 'failed').length },
  ]

  const filtered = mockSyncJobs.filter(j => {
    const matchTab    = tab === 'all' || j.status === tab
    const matchSearch = j.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Synchronization Jobs"
        subtitle="Monitor, manage, and trigger synchronization jobs across all suppliers and stores"
        actions={
          <>
            <button className="btn-secondary btn-sm"><RefreshCw size={14} /> Refresh</button>
            <button className="btn-primary btn-sm"><PlayCircle size={14} /> Trigger Sync</button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Running', value: 2, color: 'text-cyan-600', bg: 'bg-cyan-50', icon: <RefreshCw size={16} className="animate-spin-slow" /> },
          { label: 'Queued',  value: 1, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={16} /> },
          { label: 'Completed', value: 2, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
          { label: 'Failed',  value: 1, color: 'text-rose-600', bg: 'bg-rose-50', icon: <XCircle size={16} /> },
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
      <FilterBar search={search} onSearch={setSearch} placeholder="Search jobs...">
        <select className="select input-sm w-auto"><option>All Types</option><option>Inventory</option><option>Pricing</option><option>Image</option><option>Website</option><option>Full</option></select>
        <select className="select input-sm w-auto"><option>All Suppliers</option><option>TechParts International</option><option>GlobalSource Limited</option></select>
      </FilterBar>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Items</th>
                <th>Started</th>
                <th>Triggered By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} className="cursor-pointer" onClick={() => setDetailJob(job)}>
                  <td>
                    <p className="font-semibold text-slate-800 text-sm">{job.name}</p>
                    {job.supplierName && <p className="text-xs text-slate-400">{job.supplierName}</p>}
                    {job.storeName    && <p className="text-xs text-slate-400">{job.storeName}</p>}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${jobTypeColor[job.type]}`}>
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
                      {job.failedItems > 0 && <span className="text-rose-500 ml-1">({job.failedItems} failed)</span>}
                    </div>
                  </td>
                  <td><span className="text-xs text-slate-400">{job.startedAt ? timeAgo(job.startedAt) : job.scheduledAt ? formatDateTime(job.scheduledAt) : '—'}</span></td>
                  <td><span className="text-xs text-slate-500">{job.triggeredBy}</span></td>
                  <td>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {job.status === 'running' && <button className="btn-ghost btn-sm text-rose-600"><XCircle size={13} /> Cancel</button>}
                      {job.canRetry && <button className="btn-secondary btn-sm"><RotateCcw size={13} /> Retry</button>}
                      <button className="btn-icon"><MoreVertical size={14} /></button>
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
              {detailJob.canRetry && <button className="btn-primary"><RotateCcw size={14} /> Retry Job</button>}
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
                <p className="text-xs font-semibold text-slate-600 mb-2">Job Logs</p>
                <div className="bg-slate-900 rounded-xl p-4 space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
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
