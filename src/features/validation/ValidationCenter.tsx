import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Eye, AlertTriangle, RefreshCw, Filter } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockValidationItems } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { ValidationItem, ValidationStatus } from '../../types'

export const ValidationCenter: React.FC = () => {
  const [itemsList, setItemsList] = useState<ValidationItem[]>(mockValidationItems)
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [reviewItem, setReviewItem] = useState<ValidationItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewNotes, setReviewNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleApproveSingle = (id: string, name: string) => {
    setItemsList(prev =>
      prev.map(v => (v.id === id ? { ...v, status: 'approved' } : v))
    )
    showNotification(`Product "${name}" approved successfully!`)
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleRejectSingle = (id: string, name: string) => {
    setItemsList(prev =>
      prev.map(v => (v.id === id ? { ...v, status: 'rejected' } : v))
    )
    showNotification(`Product "${name}" rejected.`)
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    setItemsList(prev =>
      prev.map(v => (selectedIds.includes(v.id) ? { ...v, status: 'approved' } : v))
    )
    showNotification(`${selectedIds.length} items approved!`)
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setItemsList(prev =>
      prev.map(v => (selectedIds.includes(v.id) ? { ...v, status: 'rejected' } : v))
    )
    showNotification(`${selectedIds.length} items rejected.`)
    setSelectedIds([])
  }

  const tabs = [
    { id: 'pending',  label: 'Pending Review',  count: itemsList.filter(v => v.status === 'pending').length },
    { id: 'review',   label: 'In Review',        count: itemsList.filter(v => v.status === 'review').length },
    { id: 'approved', label: 'Approved',          count: itemsList.filter(v => v.status === 'approved').length },
    { id: 'rejected', label: 'Rejected',          count: itemsList.filter(v => v.status === 'rejected').length },
    { id: 'all',      label: 'All Items',         count: itemsList.length },
  ]

  const filtered = itemsList.filter(v => {
    const matchTab = tab === 'all' || v.status === tab
    const matchSearch =
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.supplierSku.toLowerCase().includes(search.toLowerCase()) ||
      v.supplierName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const errorTypeLabel: Record<string, string> = {
    missing_image: 'Missing Image',
    duplicate_sku: 'Duplicate SKU',
    invalid_category: 'Invalid Category',
    missing_price: 'Missing Price',
    invalid_attribute: 'Invalid Attribute',
    duplicate_product: 'Duplicate Product',
    missing_description: 'Missing Description',
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

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
        title="Validation Center"
        subtitle="Review, audit, and approve products before publishing to the master catalog"
        actions={
          <>
            {selectedIds.length > 0 && (
              <>
                <button onClick={handleBulkApprove} className="btn-success btn-sm flex items-center gap-1">
                  <CheckCircle2 size={14} /> Approve ({selectedIds.length})
                </button>
                <button onClick={handleBulkReject} className="btn-danger btn-sm flex items-center gap-1">
                  <XCircle size={14} /> Reject ({selectedIds.length})
                </button>
              </>
            )}
            <button
              onClick={() => showNotification('Validation queue refreshed.')}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </>
        }
      />

      {/* Error Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Pending Review', value: itemsList.filter(v => v.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Review', value: itemsList.filter(v => v.status === 'review').length, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'Approved', value: itemsList.filter(v => v.status === 'approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: itemsList.filter(v => v.status === 'rejected').length, color: 'text-rose-600', bg: 'bg-rose-50' },
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
      <FilterBar search={search} onSearch={setSearch} placeholder="Search product name or SKU..." />

      {/* Bulk Select Bar */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          checked={filtered.length > 0 && filtered.every(v => selectedIds.includes(v.id))}
          onChange={e => setSelectedIds(e.target.checked ? filtered.map(v => v.id) : [])}
        />
        <span className="text-xs font-semibold text-slate-700">
          {selectedIds.length > 0 ? `${selectedIds.length} items selected` : 'Select All Items'}
        </span>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-16 text-center text-slate-400">
            <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium text-slate-600">No items in this validation tab</p>
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
              <input
                type="checkbox"
                className="rounded border-slate-300 mt-1 flex-shrink-0"
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
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        err.severity === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {err.severity === 'error' ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                      {errorTypeLabel[err.type] ?? err.type}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  className="btn-success btn-sm flex items-center gap-1"
                  onClick={() => handleApproveSingle(item.id, item.productName)}
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button
                  className="btn-danger btn-sm flex items-center gap-1"
                  onClick={() => handleRejectSingle(item.id, item.productName)}
                >
                  <XCircle size={13} /> Reject
                </button>
                <button
                  className="btn-secondary btn-sm flex items-center gap-1"
                  onClick={() => setReviewItem(item)}
                >
                  <Eye size={13} /> Review
                </button>
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
              <button
                onClick={() => handleRejectSingle(reviewItem.id, reviewItem.productName)}
                className="btn-danger flex items-center gap-1.5"
              >
                <XCircle size={14} /> Reject Item
              </button>
              <button
                onClick={() => handleApproveSingle(reviewItem.id, reviewItem.productName)}
                className="btn-success flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Approve Item
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-rose-800 mb-2">
                Validation Errors ({reviewItem.errors.length})
              </p>
              {reviewItem.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-rose-700 mt-1.5">
                  {err.severity === 'error' ? (
                    <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  )}
                  <span>
                    <strong>{errorTypeLabel[err.type]}:</strong> {err.message}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Review Notes</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Add audit notes for this validation review decision..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
