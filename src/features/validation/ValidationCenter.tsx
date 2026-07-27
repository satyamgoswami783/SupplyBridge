import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Eye, AlertTriangle, RefreshCw, Info, PhoneForwarded } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, Spinner } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockValidationItems } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { ValidationItem } from '../../types'
import { useAuth } from '../../context/AuthContext'

const errorTypeLabel: Record<string, string> = {
  duplicate_sku: 'Duplicate SKUs',
  duplicate_upc: 'Duplicate UPCs',
  missing_image: 'Missing Images',
  missing_price: 'Missing Pricing',
  missing_inventory: 'Missing Inventory',
  invalid_category: 'Missing Categories',
  missing_attribute: 'Missing Attributes',
  invalid_variant: 'Invalid Variants',
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
    const targetItem = items.find(i => i.id === id)
    if (!targetItem) return
    if (targetItem.errors.length > 0) {
      setToastMessage({
        text: `Cannot approve "${name || 'Item'}". All validation issues must be resolved first.`,
        type: 'error',
      })
      return
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" approved and moved to Approved tab.`, type: 'success' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleRejectSingle = (id: string, name?: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" moved to Rejected tab.`, type: 'info' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    const selectedItems = items.filter(i => selectedIds.includes(i.id))
    const invalidItems = selectedItems.filter(i => i.errors.length > 0)
    if (invalidItems.length > 0) {
      setToastMessage({
        text: `Approval Blocked: ${invalidItems.length} selected item(s) have unresolved validation issues.`,
        type: 'error',
      })
      return
    }
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} item(s) approved and moved to Approved tab.`, type: 'success' })
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} items moved to Rejected tab.`, type: 'info' })
    setSelectedIds([])
  }

  const handleOpenReview = (item: ValidationItem) => {
    // When review opens, move status to 'review' if it's currently 'pending'
    if (item.status === 'pending') {
      setItems(prev =>
        prev.map(x => (x.id === item.id ? { ...x, status: 'review' } : x))
      )
    }
    setReviewItem({ ...item, status: item.status === 'pending' ? 'review' : item.status })
  }

  const handleResolveSingleError = (itemId: string, errorIndex: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item
        const updatedErrors = item.errors.filter((_, idx) => idx !== errorIndex)
        return { ...item, errors: updatedErrors }
      })
    )
    if (reviewItem && reviewItem.id === itemId) {
      const updatedErrors = reviewItem.errors.filter((_, idx) => idx !== errorIndex)
      setReviewItem({ ...reviewItem, errors: updatedErrors })
    }
    setToastMessage({ text: 'Validation issue marked as resolved.', type: 'success' })
  }

  const handleResolveAll = (itemId: string) => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, errors: [] } : item))
    )
    if (reviewItem && reviewItem.id === itemId) {
      setReviewItem({ ...reviewItem, errors: [] })
    }
    setToastMessage({ text: 'All validation issues resolved. Product is now Ready For Approval.', type: 'success' })
  }

  return (
    <div className="relative pb-12 sm:pb-6">
      <SectionHeader
        title="Validation Center"
        subtitle="Review and audit product validation errors before publishing to the master catalog"
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

      {/* Publishing Guard Alert Banner */}
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <span className="font-bold">Publishing Guard Active:</span>
          <span>Validation issues should be resolved before publishing.</span>
        </div>
        <Badge variant="warning" dot>PUBLISH BLOCKED</Badge>
      </div>

      {/* Error Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-6">
        {[
          { label: 'Duplicate SKUs', value: getErrorCount('duplicate_sku'), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60' },
          { label: 'Duplicate UPCs', value: getErrorCount('duplicate_upc'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
          { label: 'Missing Images', value: getErrorCount('missing_image'), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60' },
          { label: 'Missing Pricing', value: getErrorCount('missing_price'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
          { label: 'Missing Inventory', value: getErrorCount('missing_inventory'), color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60' },
          { label: 'Missing Categories', value: getErrorCount('invalid_category'), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
          { label: 'Missing Attributes', value: getErrorCount('missing_attribute'), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Invalid Variants', value: getErrorCount('invalid_variant'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center border border-slate-100 dark:border-slate-800`}>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      
      <FilterBar search={search} onSearch={setSearch} placeholder="Search product name or SKU...">
        <div className="flex justify-center gap-3 w-full sm:justify-start sm:w-auto">
          <select
            className="select input-sm w-[130px] font-medium"
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
          >
            {suppliersList.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
          <select
            className="select input-sm w-[160px] font-medium"
            value={selectedErrorType}
            onChange={e => setSelectedErrorType(e.target.value)}
          >
            <option value="All Error Types">All Error Types</option>
            <option value="Duplicate SKUs">Duplicate SKUs</option>
            <option value="Duplicate UPCs">Duplicate UPCs</option>
            <option value="Missing Images">Missing Images</option>
            <option value="Missing Pricing">Missing Pricing</option>
            <option value="Missing Inventory">Missing Inventory</option>
            <option value="Missing Categories">Missing Categories</option>
            <option value="Missing Attributes">Missing Attributes</option>
            <option value="Invalid Variants">Invalid Variants</option>
          </select>
        </div>
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
              className="card p-4 sm:p-5 hover:shadow-card-md transition-all cursor-pointer"
              onClick={() => handleOpenReview(item)}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 w-full flex-1">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 mt-1 flex-shrink-0"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug break-words">{item.productName}</p>
                        <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 break-all">
                          <span>SKU:</span>
                          <code className="mono">{item.supplierSku}</code>
                          <span>·</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{item.supplierName}</span>
                          <span>·</span>
                          <span>{timeAgo(item.createdAt)}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                        {item.errors.length === 0 && item.status !== 'approved' && item.status !== 'rejected' ? (
                          <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-1 rounded-full">
                            Ready For Approval
                          </span>
                        ) : (
                          <Badge variant={statusToVariant(item.status)}>
                            {item.status === 'pending' ? 'Pending Review' : item.status === 'review' ? 'In Review' : item.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                      {item.errors.length > 0 ? (
                        item.errors.map((err, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              err.severity === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {err.severity === 'error' ? <XCircle size={11} className="flex-shrink-0" /> : <AlertTriangle size={11} className="flex-shrink-0" />}
                            <span>{errorTypeLabel[err.type] ?? err.type}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle2 size={11} className="flex-shrink-0" />
                          <span>All Issues Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                  {role !== 'operations_staff' && (
                    <>
                      <button
                        onClick={() => handleApproveSingle(item.id, item.productName)}
                        className={`btn-sm flex items-center justify-center gap-1 flex-1 md:flex-none ${
                          item.errors.length > 0
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                            : 'btn-success'
                        }`}
                        disabled={item.status === 'approved' || item.errors.length > 0}
                        title={item.errors.length > 0 ? 'Cannot approve until validation issues are resolved' : 'Approve product'}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectSingle(item.id, item.productName)}
                        className="btn-danger btn-sm flex items-center justify-center gap-1 flex-1 md:flex-none"
                        disabled={item.status === 'rejected'}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {role === 'operations_staff' && (
                    <button
                      onClick={() => setToastMessage({ text: `Issue for "${item.productName}" escalated to Catalog Manager.`, type: 'info' })}
                      className="btn-secondary btn-sm flex items-center justify-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 flex-1 md:flex-none"
                    >
                      <PhoneForwarded size={13} /> Escalate
                    </button>
                  )}
                  <button onClick={() => handleOpenReview(item)} className="btn-secondary btn-sm flex items-center justify-center gap-1 flex-1 md:flex-none" title="View Validation Details">
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Review Modal - View Details & Resolve Issues */}
      {reviewItem && (
        <Modal
          open
          onClose={() => setReviewItem(null)}
          title={`Validation Details: ${reviewItem.productName}`}
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
                  {reviewItem.errors.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      <AlertTriangle size={14} />
                      <span>Approval Blocked (Resolve issues first)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleApproveSingle(reviewItem.id, reviewItem.productName)
                        setReviewItem(null)
                      }}
                      className="btn-success flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Approve Item
                    </button>
                  )}
                </>
              )}
            </>
          }
        >
          <div className="space-y-4">
            {reviewItem.errors.length > 0 ? (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    Validation Issues to Resolve ({reviewItem.errors.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => handleResolveAll(reviewItem.id)}
                    className="text-2xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2 py-1 rounded"
                  >
                    Mark All Issues Resolved
                  </button>
                </div>
                {reviewItem.errors.map((err, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm text-rose-700 dark:text-rose-400 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                    <div className="flex items-start gap-2 min-w-0">
                      {err.severity === 'error' ? (
                        <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong>{errorTypeLabel[err.type] || err.type}:</strong> {err.message}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveSingleError(reviewItem.id, i)}
                      className="btn-secondary btn-xs text-xs flex-shrink-0 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">All Validation Issues Resolved!</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">This product is now ready for approval and publishing.</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Review Notes / Validation Audit Log</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Add audit notes for this validation review..."
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
