import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Eye, AlertTriangle, RefreshCw, Filter } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockValidationItems } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { ValidationItem } from '../../types'

export const ValidationCenter: React.FC = () => {
  const [tab, setTab]                   = useState('pending')
  const [search, setSearch]             = useState('')
  const [reviewItem, setReviewItem]     = useState<ValidationItem | null>(null)
  const [selectedIds, setSelectedIds]   = useState<string[]>([])

  const tabs = [
    { id: 'pending',  label: 'Pending Review',  count: mockValidationItems.filter(v => v.status === 'pending').length },
    { id: 'review',   label: 'In Review',        count: mockValidationItems.filter(v => v.status === 'review').length },
    { id: 'approved', label: 'Approved',          count: mockValidationItems.filter(v => v.status === 'approved').length },
    { id: 'rejected', label: 'Rejected',          count: 0 },
    { id: 'all',      label: 'All',               count: mockValidationItems.length },
  ]

  const filtered = mockValidationItems.filter(v => {
    const matchTab = tab === 'all' || v.status === tab
    const matchSearch = v.productName.toLowerCase().includes(search.toLowerCase()) || v.supplierSku.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const errorTypeLabel: Record<string, string> = {
    missing_image: 'Missing Image', duplicate_sku: 'Duplicate SKU', invalid_category: 'Invalid Category',
    missing_price: 'Missing Price', invalid_attribute: 'Invalid Attribute', duplicate_product: 'Duplicate Product',
    missing_description: 'Missing Description',
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div>
      <SectionHeader
        title="Validation Center"
        subtitle="Review and approve products before they enter the master catalog"
        actions={
          <>
            {selectedIds.length > 0 && (
              <>
                <button className="btn-success btn-sm"><CheckCircle2 size={14} /> Approve {selectedIds.length}</button>
                <button className="btn-danger btn-sm"><XCircle size={14} /> Reject {selectedIds.length}</button>
              </>
            )}
            <button className="btn-secondary btn-sm"><RefreshCw size={14} /> Refresh</button>
          </>
        }
      />

      {/* Error Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Pending', value: 3, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Review', value: 1, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'Missing Images', value: 2, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Duplicate SKU', value: 1, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Missing Price', value: 1, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Invalid Cat.', value: 2, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search products...">
        <select className="select input-sm w-auto min-w-[130px]">
          <option>All Suppliers</option>
          <option>TechParts International</option>
          <option>GlobalSource Limited</option>
          <option>AcmeDistributors</option>
        </select>
        <select className="select input-sm w-auto">
          <option>All Error Types</option>
          <option>Missing Image</option>
          <option>Duplicate SKU</option>
          <option>Missing Price</option>
          <option>Invalid Category</option>
        </select>
      </FilterBar>

      {/* Bulk select bar */}
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" className="rounded border-slate-300"
          onChange={e => setSelectedIds(e.target.checked ? filtered.map(v => v.id) : [])} />
        <span className="text-sm text-slate-500">{selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}</span>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-16 text-center text-slate-400">
            <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium text-slate-600">No items in this category</p>
          </div>
        )}
        {filtered.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 hover:shadow-card-md transition-all cursor-pointer"
            onClick={() => setReviewItem(item)}
          >
            <div className="flex items-start gap-4">
              <input type="checkbox" className="rounded border-slate-300 mt-1 flex-shrink-0"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      SKU: <code className="mono">{item.supplierSku}</code> · {item.supplierName} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusToVariant(item.status)}>{item.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.errors.map((err, i) => (
                    <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      err.severity === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {err.severity === 'error' ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                      {errorTypeLabel[err.type] ?? err.type}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button className="btn-success btn-sm" onClick={() => {}}><CheckCircle2 size={13} /> Approve</button>
                <button className="btn-danger btn-sm" onClick={() => {}}><XCircle size={13} /> Reject</button>
                <button className="btn-secondary btn-sm" onClick={() => setReviewItem(item)}><Eye size={13} /> Review</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewItem && (
        <Modal
          open
          onClose={() => setReviewItem(null)}
          title={reviewItem.productName}
          subtitle={`Supplier: ${reviewItem.supplierName} · SKU: ${reviewItem.supplierSku}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setReviewItem(null)} className="btn-secondary">Close</button>
              <button className="btn-danger"><XCircle size={14} /> Reject</button>
              <button className="btn-success"><CheckCircle2 size={14} /> Approve</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-rose-800 mb-2">Validation Errors ({reviewItem.errors.length})</p>
              {reviewItem.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-rose-700 mt-1.5">
                  {err.severity === 'error' ? <XCircle size={14} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />}
                  <span><strong>{errorTypeLabel[err.type]}:</strong> {err.message}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Review Notes</label>
              <textarea className="input" rows={3} placeholder="Add notes for this review decision..." />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
