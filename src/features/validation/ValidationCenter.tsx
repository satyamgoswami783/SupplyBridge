import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Eye, AlertTriangle, RefreshCw, Loader2, Check, Info, PhoneForwarded } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, Spinner } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockValidationItems } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { ValidationItem, ValidationStatus } from '../../types'
import { useAuth } from '../../context/AuthContext'

const errorTypeLabel: Record<string, string> = {
  missing_image: 'Missing Image',
  duplicate_sku: 'Duplicate SKU',
  invalid_category: 'Invalid Category',
  missing_price: 'Missing Price',
  invalid_attribute: 'Invalid Attribute',
  duplicate_product: 'Duplicate Product',
  missing_description: 'Missing Description',
}

export const ValidationCenter: React.FC = () => {
  const { role } = useAuth()
  const [items, setItems] = useState<ValidationItem[]>(mockValidationItems)
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers')
  const [selectedErrorType, setSelectedErrorType] = useState('All Error Types')
  
  const [reviewItem, setReviewItem] = useState<ValidationItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Auto-clear toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Reset notes when selected item changes
  useEffect(() => {
    setReviewNotes('')
  }, [reviewItem])

  // Extract unique suppliers from current items for the dropdown
  const suppliersList = ['All Suppliers', ...Array.from(new Set(items.map(item => item.supplierName)))]

  // Tab count configuration
  const tabs = [
    { id: 'pending',  label: 'Pending Review',  count: items.filter(v => v.status === 'pending').length },
    { id: 'review',   label: 'In Review',        count: items.filter(v => v.status === 'review').length },
    { id: 'approved', label: 'Approved',          count: items.filter(v => v.status === 'approved').length },
    { id: 'rejected', label: 'Rejected',          count: items.filter(v => v.status === 'rejected').length },
    { id: 'all',      label: 'All Items',         count: items.length },
  ]

  // Filter items based on tab, search, supplier, and error type
  const filtered = items.filter(v => {
    // Tab Filter
    const matchTab = tab === 'all' || v.status === tab

    // Search Filter (by Product Name or Supplier SKU)
    const matchSearch =
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.supplierSku.toLowerCase().includes(search.toLowerCase()) ||
      v.supplierName.toLowerCase().includes(search.toLowerCase())

    // Supplier Filter
    const matchSupplier = selectedSupplier === 'All Suppliers' || v.supplierName === selectedSupplier

    // Error Type Filter
    const matchErrorType =
      selectedErrorType === 'All Error Types' ||
      v.errors.some(err => errorTypeLabel[err.type] === selectedErrorType || err.type === selectedErrorType)

    return matchTab && matchSearch && matchSupplier && matchErrorType
  })

  // Count helper for Top Summary Cards
  const getErrorCount = (type: string) => {
    return items.filter(item => item.errors.some(err => err.type === type)).length
  }
  // Toggle selection for a single item
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  // Handlers for action flows
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setItems(mockValidationItems)
      setSelectedIds([])
      setIsLoading(false)
      setToastMessage({ text: 'Validation queue refreshed.', type: 'success' })
    }, 800)
  }

  const handleApproveSingle = (id: string, name?: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" approved successfully.`, type: 'success' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleRejectSingle = (id: string, name?: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" rejected.`, type: 'info' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} items approved successfully.`, type: 'success' })
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} items rejected.`, type: 'info' })
    setSelectedIds([])
  }

  const handleOpenReview = (item: ValidationItem) => {
    // When review opens, move status to 'review' if it's currently 'pending'
    if (item.status === 'pending') {
      setItems(prev =>
        prev.map(x => (x.id === item.id ? { ...x, status: 'review' } : x))
      )
    }
    // Set item to active modal review view
    setReviewItem({ ...item, status: item.status === 'pending' ? 'review' : item.status })
  }

  return (
    <div className="relative">
      <SectionHeader
        title="Validation Center"
        subtitle="Review, audit, and approve products before publishing to the master catalog"
        actions={
          <>
            {selectedIds.length > 0 && role !== 'operations_staff' && (
              <>
                <button onClick={handleBulkApprove} className="btn-success btn-sm">
                  <CheckCircle2 size={14} /> Approve {selectedIds.length}
                </button>
                <button onClick={handleBulkReject} className="btn-danger btn-sm">
                  <XCircle size={14} /> Reject {selectedIds.length}
                </button>
              </>
            )}
            {selectedIds.length > 0 && role === 'operations_staff' && (
              <button
                onClick={() => setToastMessage({ text: `${selectedIds.length} issue(s) escalated to Catalog Manager.`, type: 'info' })}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <PhoneForwarded size={14} /> Escalate {selectedIds.length} Issue{selectedIds.length > 1 ? 's' : ''}
              </button>
            )}
            <button onClick={handleRefresh} className="btn-secondary btn-sm flex items-center gap-1.5" disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh Queue
            </button>
          </>
        }
      />

      {/* Floating Status Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs flex items-center gap-2 font-semibold transition-all ${
              toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Info size={16} />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Pending Review', value: items.filter(v => v.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Review', value: items.filter(v => v.status === 'review').length, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'Missing Images', value: getErrorCount('missing_image'), color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Duplicate SKU', value: getErrorCount('duplicate_sku'), color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Missing Price', value: getErrorCount('missing_price'), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Invalid Cat.', value: getErrorCount('invalid_category'), color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      
      <FilterBar search={search} onSearch={setSearch} placeholder="Search product name or SKU...">
        <select
          className="select input-sm w-auto min-w-[130px]"
          value={selectedSupplier}
          onChange={e => setSelectedSupplier(e.target.value)}
        >
          {suppliersList.map(sup => (
            <option key={sup} value={sup}>{sup}</option>
          ))}
        </select>
        <select
          className="select input-sm w-auto"
          value={selectedErrorType}
          onChange={e => setSelectedErrorType(e.target.value)}
        >
          <option value="All Error Types">All Error Types</option>
          <option value="Missing Image">Missing Image</option>
          <option value="Duplicate SKU">Duplicate SKU</option>
          <option value="Missing Price">Missing Price</option>
          <option value="Invalid Category">Invalid Category</option>
          <option value="Missing Description">Missing Description</option>
          <option value="Invalid Attribute">Invalid Attribute</option>
          <option value="Duplicate Product">Duplicate Product</option>
        </select>
      </FilterBar>

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
        {isLoading ? (
          <div className="card p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Spinner size={32} />
            <p className="font-medium text-slate-505">Fetching validation logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center text-slate-400">
            <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium text-slate-600">No items in this validation tab</p>
          </div>
        ) : (
          filtered.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-card-md transition-all cursor-pointer"
              onClick={() => handleOpenReview(item)}
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
                  {role !== 'operations_staff' && (
                    <>
                      <button
                        onClick={() => handleApproveSingle(item.id, item.productName)}
                        className="btn-success btn-sm flex items-center gap-1"
                        disabled={item.status === 'approved'}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectSingle(item.id, item.productName)}
                        className="btn-danger btn-sm flex items-center gap-1"
                        disabled={item.status === 'rejected'}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {role === 'operations_staff' && (
                    <button
                      onClick={() => setToastMessage({ text: `Issue for "${item.productName}" escalated to Catalog Manager.`, type: 'info' })}
                      className="btn-secondary btn-sm flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <PhoneForwarded size={13} /> Escalate
                    </button>
                  )}
                  <button onClick={() => handleOpenReview(item)} className="btn-secondary btn-sm flex items-center gap-1">
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              <button onClick={() => setReviewItem(null)} className="btn-secondary">
                Close
              </button>
              {role === 'operations_staff' ? (
                <button
                  onClick={() => {
                    setToastMessage({ text: `Issue for "${reviewItem.productName}" escalated to Catalog Manager.`, type: 'info' })
                    setReviewItem(null)
                  }}
                  className="btn-secondary flex items-center gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <PhoneForwarded size={14} /> Escalate to Catalog Manager
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleRejectSingle(reviewItem.id, reviewItem.productName)
                      setReviewItem(null)
                    }}
                    className="btn-danger flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject Item
                  </button>
                  <button
                    onClick={() => {
                      handleApproveSingle(reviewItem.id, reviewItem.productName)
                      setReviewItem(null)
                    }}
                    className="btn-success flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Approve Item
                  </button>
                </>
              )}
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
