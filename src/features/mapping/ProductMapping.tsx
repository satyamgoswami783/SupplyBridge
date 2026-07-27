import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, ArrowLeftRight, CheckCircle2, XCircle, AlertTriangle, Sparkles,
  RefreshCw, Sliders, Eye, Plus, Search, Layers, ShieldCheck, Check, X,
  Split, GitMerge, History, Clock, User, Download, ExternalLink, HelpCircle
} from 'lucide-react'
import { SectionHeader, FilterBar, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { MappingRuleEngineModal, DEFAULT_MAPPING_RULES } from './MappingRuleEngine'
import { mockProducts } from '../../data/mockData'
import type { Product, MappingRule, MappingHistoryItem } from '../../types'
import { useAuth } from '../../context/AuthContext'

export const ProductMapping: React.FC = () => {
  const { role, currentUser } = useAuth()
  const canEdit = role === 'platform_owner' || role === 'administrator' || role === 'catalog_manager' || role === 'super_admin' || role === 'admin'

  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(mockProducts[0] || null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('all')

  // Modals & Panels
  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(DEFAULT_MAPPING_RULES)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [beforeAfterModalOpen, setBeforeAfterModalOpen] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Action Handlers
  const handleApproveMapping = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const updatedHistory: MappingHistoryItem[] = [
            ...(p.mappingHistory || []),
            {
              id: `hist_${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: currentUser.name,
              action: 'Approved Mapping',
              previousValue: p.status,
              newValue: 'published',
              reason: 'Pre-publish validation passed & reviewer confirmed.'
            }
          ]
          return {
            ...p,
            status: 'published',
            validationStatus: 'passed',
            confidenceScore: 100,
            mappingHistory: updatedHistory
          }
        }
        return p
      })
    )
    showNotification(`Product mapping approved & ready to publish!`)
    if (selectedProduct?.id === productId) {
      setSelectedProduct(prev => prev ? { ...prev, status: 'published', validationStatus: 'passed', confidenceScore: 100 } : null)
    }
  }

  const handleRejectMapping = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, status: 'failed', validationStatus: 'failed' }
        }
        return p
      })
    )
    showNotification(`Product mapping rejected & flagged for supplier review.`)
  }

  const handleMergeProducts = (productId: string) => {
    showNotification(`Merged duplicate supplier records into Master SKU: ${selectedProduct?.masterSku || 'PIM-MASTER-01'}`)
  }

  const handleSplitVariant = (productId: string) => {
    showNotification(`Split supplier product variants into individual standalone Master SKUs.`)
  }

  const handleAutoMatchAll = () => {
    showNotification('Running AI Confidence Matching Engine...')
    setTimeout(() => {
      setProducts(prev =>
        prev.map(p => ({
          ...p,
          confidenceScore: p.confidenceScore ? Math.min(100, p.confidenceScore + 10) : 92,
          isAutoMatched: true
        }))
      )
      showNotification('AI Auto-matched 18 products with high confidence scores!')
    }, 1200)
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(p => p.id) : [])
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Filtered Products
  const filtered = products.filter(p => {
    const matchSupplier = filterSupplier === 'all' || p.supplierId === filterSupplier
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierSku.toLowerCase().includes(search.toLowerCase())
    return matchSupplier && matchSearch
  })

  // Dynamic Metrics (Calculated dynamically, no fake counters)
  const totalCount = products.length
  const mappedCount = products.filter(p => p.status === 'published' || p.status === 'draft').length
  const pendingCount = products.filter(p => p.status === 'validation_required').length
  const failedCount = products.filter(p => p.status === 'failed').length
  const avgConfidence = Math.round(products.reduce((sum, p) => sum + (p.confidenceScore || 85), 0) / (totalCount || 1))
  const duplicatesCount = products.filter(p => p.duplicateDetected).length

  return (
    <div className="relative space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Product Data Mapping & Validation Workbench"
        subtitle="Side-by-side comparison, AI confidence scoring, duplicate SKU detection, and pre-publish validation workflow"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoMatchAll}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> AI Auto-Match
            </button>
            <button
              onClick={() => setRuleEngineOpen(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sliders size={14} /> Mapping Rules ({mappingRules.length})
            </button>
          </div>
        }
      />

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Total In Feed</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalCount.toLocaleString()}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Catalog SKUs</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Mapped & Approved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{mappedCount.toLocaleString()}</p>
          <p className="text-2xs text-emerald-600 mt-0.5 font-bold">Ready to publish</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount.toLocaleString()}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Requires validation</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Average Match Confidence</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{avgConfidence}%</p>
          <ProgressBar value={avgConfidence} color="primary" className="mt-2" />
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Duplicate SKU/UPC Alerts</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{duplicatesCount}</p>
          <p className="text-2xs text-rose-600 mt-0.5 font-bold">Merge recommended</p>
        </div>
      </div>

      {/* Main Dual View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Product Queue Selection Table */}
        <div className="lg:col-span-5 card p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <Package size={16} className="text-amber-500" /> Products Queue ({filtered.length})
            </h3>
            <select
              className="select input-sm text-2xs py-1 px-2"
              value={filterSupplier}
              onChange={e => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              <option value="s_techparts">TechParts Int.</option>
              <option value="s_globalsource">GlobalSource</option>
              <option value="s_primesup">PrimeSup Corp</option>
            </select>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, UPC, or Product Name..."
              className="input pl-8 py-1.5 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {filtered.map(product => {
              const isSelected = selectedProduct?.id === product.id
              const isChecked = selectedIds.includes(product.id)

              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/60 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectOne(product.id)}
                      onClick={e => e.stopPropagation()}
                      className="rounded border-slate-300 mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-2xs text-slate-400 font-mono">
                        <span>SKU: {product.supplierSku}</span>
                        <span>•</span>
                        <span>{product.supplierName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge variant={product.status === 'published' ? 'success' : product.status === 'failed' ? 'danger' : 'warning'}>
                      {product.status === 'published' ? 'Mapped' : product.status === 'failed' ? 'Rejected' : 'Pending'}
                    </Badge>
                    {product.confidenceScore && (
                      <span className="text-2xs font-bold text-indigo-600 dark:text-indigo-400">
                        {product.confidenceScore}% AI Confidence
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Side-by-Side Product Comparison & Workstation */}
        <div className="lg:col-span-7 card p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[700px] overflow-y-auto">
          {selectedProduct ? (
            <div className="space-y-5">
              {/* Product Workbench Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Selected Target SKU</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Supplier SKU: <strong className="text-slate-800 dark:text-slate-200">{selectedProduct.supplierSku}</strong> · Master PIM SKU: <strong className="text-amber-500">{selectedProduct.masterSku}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setBeforeAfterModalOpen(true)}
                    className="btn-secondary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <Eye size={13} /> Before/After Preview
                  </button>
                  <button
                    onClick={() => setHistoryModalOpen(true)}
                    className="btn-secondary btn-sm flex items-center gap-1 font-bold text-xs"
                  >
                    <History size={13} /> History Log
                  </button>
                </div>
              </div>

              {/* SIDE-BY-SIDE COMPARISON MATRIX */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left Panel: Supplier Raw Product Feed */}
                <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl border border-rose-200/80 dark:border-rose-900/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                    <span className="text-2xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">Raw Supplier Feed</span>
                    <Badge variant="neutral">{selectedProduct.supplierName}</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-2xs">Raw Title:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Supplier Category:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProduct.categoryName || 'Computer Hardware'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Raw Price:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${selectedProduct.pricing.supplierPrice.toFixed(2)} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Feed Stock Count:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedProduct.inventory.supplierStock} Units</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Master PIM Catalog Record */}
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-2xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Master PIM Spec</span>
                    <Badge variant="success">Confidence {selectedProduct.confidenceScore || 95}%</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-2xs">Standardized PIM Title:</span>
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">{selectedProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Shift4Shop Master Category:</span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">Electronics & Computer Hardware</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Calculated Retail / MAP:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">${selectedProduct.pricing.retailPrice.toFixed(2)} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-2xs">Allocated Inventory Buffer:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{selectedProduct.inventory.availableStock} Units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DUPLICATE & ANOMALY DETECTION BANNER */}
              {selectedProduct.duplicateDetected && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                    <span><strong>Duplicate SKU Detected:</strong> Matches existing catalog SKU <code>TP-PROC-7950X</code>.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMergeProducts(selectedProduct.id)}
                      className="btn-secondary btn-sm py-0.5 px-2 text-2xs flex items-center gap-1 font-bold"
                    >
                      <GitMerge size={12} /> Merge SKUs
                    </button>
                    <button
                      onClick={() => handleSplitVariant(selectedProduct.id)}
                      className="btn-secondary btn-sm py-0.5 px-2 text-2xs flex items-center gap-1 font-bold"
                    >
                      <Split size={12} /> Split Variant
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION WORKFLOW FOOTER */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <User size={14} /> Assigned Reviewer: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectMapping(selectedProduct.id)}
                      className="btn-danger btn-sm flex items-center gap-1.5 font-bold"
                    >
                      <XCircle size={14} /> Reject Mapping
                    </button>
                    <button
                      onClick={() => handleApproveMapping(selectedProduct.id)}
                      className="btn-success btn-sm flex items-center gap-1.5 font-bold shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={14} /> Approve & Publish Mapping
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-2">
              <Package size={40} className="text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-sm">Select a product from the queue on the left to start mapping.</p>
            </div>
          )}
        </div>
      </div>

      {/* Before / After Preview Modal */}
      {selectedProduct && beforeAfterModalOpen && (
        <Modal
          open
          onClose={() => setBeforeAfterModalOpen(false)}
          title={`Before / After Spec Preview: ${selectedProduct.name}`}
          subtitle={`Comparing Supplier Raw Data vs Master PIM Publication Format`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300 border-b pb-1">BEFORE (Raw Supplier Feed)</p>
                <p>Title: {selectedProduct.name}</p>
                <p>SKU: {selectedProduct.supplierSku}</p>
                <p>Price: ${selectedProduct.pricing.supplierPrice}</p>
                <p>Stock: {selectedProduct.inventory.supplierStock}</p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl space-y-2 font-mono text-xs border border-emerald-300 dark:border-emerald-800">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 pb-1">AFTER (Shift4Shop Master PIM Spec)</p>
                <p>Title: {selectedProduct.name}</p>
                <p>Master SKU: {selectedProduct.masterSku}</p>
                <p>Retail MAP: ${selectedProduct.pricing.retailPrice}</p>
                <p>Allocated Stock: {selectedProduct.inventory.availableStock}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Audit History Log Modal */}
      {selectedProduct && historyModalOpen && (
        <Modal
          open
          onClose={() => setHistoryModalOpen(false)}
          title={`Mapping Version History: ${selectedProduct.name}`}
          subtitle={`Complete audit trail of all mapping changes and reviewer approvals`}
          size="lg"
        >
          <div className="space-y-3 font-mono text-xs">
            {(selectedProduct.mappingHistory || [
              {
                id: 'h1',
                timestamp: new Date().toISOString(),
                user: currentUser.name,
                action: 'Auto-Matched by Rule #1',
                previousValue: 'Unmapped',
                newValue: 'Mapped to CAT-COMP-01',
                reason: 'Taxonomy Match Score 95%'
              }
            ]).map((hist, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{hist.action}</span>
                  <span className="text-2xs text-slate-400">{hist.timestamp}</span>
                </div>
                <p className="text-2xs text-slate-500">By: {hist.user} · Reason: {hist.reason}</p>
                <div className="text-2xs text-slate-400">
                  Previous: <code className="text-rose-500">{hist.previousValue}</code> → New: <code className="text-emerald-500">{hist.newValue}</code>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Rule Engine Modal */}
      <MappingRuleEngineModal
        open={ruleEngineOpen}
        onClose={() => setRuleEngineOpen(false)}
        rules={mappingRules}
        onSaveRules={setMappingRules}
        onNotify={showNotification}
      />
    </div>
  )
}
