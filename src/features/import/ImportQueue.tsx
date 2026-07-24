import React, { useState } from 'react'
import { Download, CheckCircle2, XCircle, RefreshCw, RotateCcw, AlertCircle } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockImportQueue } from '../../data/mockData'
import { statusToVariant, connectionTypeLabel, timeAgo } from '../../utils'

export const ImportQueue: React.FC = () => {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const tabs = [
    { id: 'all',        label: 'All',        count: mockImportQueue.length },
    { id: 'processing', label: 'Processing', count: mockImportQueue.filter(i => i.status === 'processing').length },
    { id: 'pending',    label: 'Pending',    count: mockImportQueue.filter(i => i.status === 'pending').length },
    { id: 'completed',  label: 'Completed',  count: mockImportQueue.filter(i => i.status === 'completed').length },
    { id: 'failed',     label: 'Failed',     count: mockImportQueue.filter(i => i.status === 'failed').length },
  ]

  const filtered = mockImportQueue.filter(q => {
    const matchTab = tab === 'all' || q.status === tab
    const matchSearch = q.supplierName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Import Queue"
        subtitle="Monitor and manage product import jobs from all suppliers"
        actions={<button className="btn-secondary btn-sm"><RefreshCw size={14} /> Refresh</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Items', value: mockImportQueue.reduce((s, q) => s + q.totalRecords, 0).toLocaleString(), color: 'text-slate-800' },
          { label: 'Processing',  value: mockImportQueue.filter(q => q.status === 'processing').length, color: 'text-cyan-600' },
          { label: 'Pending',     value: mockImportQueue.filter(q => q.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Failed',      value: mockImportQueue.filter(q => q.status === 'failed').length, color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search suppliers..." />

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.status === 'completed' ? 'bg-emerald-50' :
                  item.status === 'failed' ? 'bg-rose-50' :
                  item.status === 'processing' ? 'bg-cyan-50' : 'bg-amber-50'
                }`}>
                  <Download size={16} className={
                    item.status === 'completed' ? 'text-emerald-600' :
                    item.status === 'failed' ? 'text-rose-600' :
                    item.status === 'processing' ? 'text-cyan-600' : 'text-amber-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">{item.supplierName}</p>
                    <Badge variant="info">{connectionTypeLabel(item.connectionType)}</Badge>
                    <Badge variant={statusToVariant(item.status)}>{item.status}</Badge>
                  </div>
                  {item.fileName && <p className="text-xs text-slate-400 mb-2">File: <code className="mono">{item.fileName}</code></p>}
                  {item.errorMessage && (
                    <p className="text-xs text-rose-600 mb-2 flex items-center gap-1">
                      <AlertCircle size={11} /> {item.errorMessage}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span><CheckCircle2 size={10} className="inline mr-1 text-emerald-500" />{item.processedRecords.toLocaleString()} processed</span>
                    {item.failedRecords > 0 && <span><XCircle size={10} className="inline mr-1 text-rose-500" />{item.failedRecords.toLocaleString()} failed</span>}
                    <span>of {item.totalRecords.toLocaleString()} total</span>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                  {item.status === 'processing' && (
                    <ProgressBar
                      value={item.processedRecords}
                      max={item.totalRecords}
                      color="cyan"
                      showLabel
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {item.status === 'failed' && <button className="btn-secondary btn-sm"><RotateCcw size={12} /> Retry</button>}
                {item.status === 'processing' && <button className="btn-ghost btn-sm text-rose-600"><XCircle size={12} /> Cancel</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
