import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tag, Folder, ChevronRight, ChevronDown, ArrowRight, CheckCircle2,
  AlertTriangle, RefreshCw, Sliders, Eye, Plus, Search, Layers, ShieldCheck,
  Check, X, Sparkles, HelpCircle, Link as LinkIcon, Unlink
} from 'lucide-react'
import { SectionHeader, FilterBar, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { MappingRuleEngineModal, DEFAULT_MAPPING_RULES } from './MappingRuleEngine'
import { mockCategories } from '../../data/mockData'
import type { SupplierCategoryNode, MasterCategoryNode, MappingRule } from '../../types'
import { useAuth } from '../../context/AuthContext'

// Sample Enterprise Supplier Categories Tree (Multi-level)
const INITIAL_SUPPLIER_TREE: SupplierCategoryNode[] = [
  {
    id: 'sup_cat_1',
    supplierId: 's_techparts',
    code: 'TP-COMP-01',
    name: 'Computer Components & Hardware',
    fullPath: 'TechParts Int. > Computer Components & Hardware',
    productCount: 4520,
    status: 'mapped',
    mappedMasterCategoryId: 'cat_electronics',
    mappedMasterCategoryName: 'Electronics & Computer Hardware',
    confidence: 98,
    children: [
      {
        id: 'sup_cat_1_1',
        supplierId: 's_techparts',
        code: 'TP-COMP-PROC',
        name: 'Processors & CPUs',
        fullPath: 'TechParts Int. > Computer Components > Processors & CPUs',
        productCount: 1240,
        status: 'mapped',
        mappedMasterCategoryId: 'cat_processors',
        mappedMasterCategoryName: 'CPUs & Processors',
        confidence: 96,
      },
      {
        id: 'sup_cat_1_2',
        supplierId: 's_techparts',
        code: 'TP-COMP-STOR',
        name: 'Solid State Drives & Storage',
        fullPath: 'TechParts Int. > Computer Components > Solid State Drives & Storage',
        productCount: 1890,
        status: 'mapped',
        mappedMasterCategoryId: 'cat_storage',
        mappedMasterCategoryName: 'Internal & External Storage',
        confidence: 99,
      },
      {
        id: 'sup_cat_1_3',
        supplierId: 's_techparts',
        code: 'TP-COMP-GPU',
        name: 'Graphics Acceleration Cards',
        fullPath: 'TechParts Int. > Computer Components > Graphics Acceleration Cards',
        productCount: 820,
        status: 'unmapped',
        confidence: 84,
      }
    ]
  },
  {
    id: 'sup_cat_2',
    supplierId: 's_globalsource',
    code: 'GS-AUTO-ACC',
    name: 'Automotive Accessories & Electrical',
    fullPath: 'GlobalSource > Automotive Accessories & Electrical',
    productCount: 2310,
    status: 'unmapped',
    children: [
      {
        id: 'sup_cat_2_1',
        supplierId: 's_globalsource',
        code: 'GS-AUTO-DIAG',
        name: 'OBD-II Diagnostic Tools',
        fullPath: 'GlobalSource > Automotive > OBD-II Diagnostic Tools',
        productCount: 650,
        status: 'conflict',
        mappedMasterCategoryId: 'cat_tools',
        mappedMasterCategoryName: 'Hand Tools & Maintenance',
        confidence: 62,
      }
    ]
  },
  {
    id: 'sup_cat_3',
    supplierId: 's_primesup',
    code: 'PS-IND-SAFE',
    name: 'Industrial Safety & Workwear',
    fullPath: 'PrimeSup Corp > Industrial Safety & Workwear',
    productCount: 1450,
    status: 'unmapped',
  }
]

// Master Category Tree (Shift4Shop PIM Target)
const INITIAL_MASTER_TREE: MasterCategoryNode[] = [
  {
    id: 'cat_electronics',
    code: 'MASTER-ELEC',
    name: 'Electronics & Computer Hardware',
    fullPath: 'Master Catalog > Electronics & Computer Hardware',
    productCount: 18420,
    mappedSupplierCategoriesCount: 3,
    children: [
      {
        id: 'cat_processors',
        code: 'MASTER-CPU',
        name: 'CPUs & Processors',
        fullPath: 'Master Catalog > Electronics > CPUs & Processors',
        productCount: 4200,
        mappedSupplierCategoriesCount: 2,
      },
      {
        id: 'cat_storage',
        code: 'MASTER-STORAGE',
        name: 'Internal & External Storage',
        fullPath: 'Master Catalog > Electronics > Internal & External Storage',
        productCount: 6800,
        mappedSupplierCategoriesCount: 3,
      },
      {
        id: 'cat_graphics',
        code: 'MASTER-GPU',
        name: 'Video & Graphics Cards',
        fullPath: 'Master Catalog > Electronics > Video & Graphics Cards',
        productCount: 2900,
        mappedSupplierCategoriesCount: 0,
      }
    ]
  },
  {
    id: 'cat_automotive',
    code: 'MASTER-AUTO',
    name: 'Automotive Electronics & Tools',
    fullPath: 'Master Catalog > Automotive Electronics & Tools',
    productCount: 9200,
    mappedSupplierCategoriesCount: 1,
  },
  {
    id: 'cat_industrial',
    code: 'MASTER-IND',
    name: 'Industrial & Safety Gear',
    fullPath: 'Master Catalog > Industrial & Safety Gear',
    productCount: 5400,
    mappedSupplierCategoriesCount: 0,
  }
]

export const CategoryMapping: React.FC = () => {
  const { role } = useAuth()
  const canEdit = role === 'platform_owner' || role === 'administrator' || role === 'catalog_manager' || role === 'super_admin' || role === 'admin'

  const [supplierTree, setSupplierTree] = useState<SupplierCategoryNode[]>(INITIAL_SUPPLIER_TREE)
  const [masterTree] = useState<MasterCategoryNode[]>(INITIAL_MASTER_TREE)

  const [expandedSupplier, setExpandedSupplier] = useState<Record<string, boolean>>({ sup_cat_1: true, sup_cat_2: true })
  const [expandedMaster, setExpandedMaster] = useState<Record<string, boolean>>({ cat_electronics: true })

  const [selectedSupplierNode, setSelectedSupplierNode] = useState<SupplierCategoryNode | null>(null)
  const [selectedMasterNode, setSelectedMasterNode] = useState<MasterCategoryNode | null>(null)

  const [searchSupplier, setSearchSupplier] = useState('')
  const [searchMaster, setSearchMaster] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [previewCategory, setPreviewCategory] = useState<SupplierCategoryNode | null>(null)
  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(DEFAULT_MAPPING_RULES)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleSupplierExpand = (id: string) => {
    setExpandedSupplier(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleMasterExpand = (id: string) => {
    setExpandedMaster(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Handle Mapping Action (Connect Left selected to Right selected)
  const handleConnectMapping = () => {
    if (!selectedSupplierNode || !selectedMasterNode) return

    const mapNode = (nodes: SupplierCategoryNode[]): SupplierCategoryNode[] => {
      return nodes.map(node => {
        if (node.id === selectedSupplierNode.id) {
          return {
            ...node,
            status: 'mapped',
            mappedMasterCategoryId: selectedMasterNode.id,
            mappedMasterCategoryName: selectedMasterNode.name,
            confidence: 100
          }
        }
        if (node.children) {
          return { ...node, children: mapNode(node.children) }
        }
        return node
      })
    }

    setSupplierTree(mapNode(supplierTree))
    showNotification(`Mapped "${selectedSupplierNode.name}" → "${selectedMasterNode.name}"`)
    setSelectedSupplierNode(null)
  }

  // Handle Unmap Action
  const handleUnmapNode = (node: SupplierCategoryNode) => {
    const unmapNode = (nodes: SupplierCategoryNode[]): SupplierCategoryNode[] => {
      return nodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            status: 'unmapped',
            mappedMasterCategoryId: undefined,
            mappedMasterCategoryName: undefined,
            confidence: undefined
          }
        }
        if (n.children) {
          return { ...n, children: unmapNode(n.children) }
        }
        return n
      })
    }

    setSupplierTree(unmapNode(supplierTree))
    showNotification(`Unmapped category "${node.name}"`)
  }

  // Run AI Auto Suggestions
  const handleAutoSuggest = () => {
    showNotification('Running AI Taxonomy Matching Algorithm...')
    setTimeout(() => {
      setSupplierTree(prev =>
        prev.map(root => ({
          ...root,
          children: root.children?.map(child =>
            child.id === 'sup_cat_1_3'
              ? {
                  ...child,
                  status: 'mapped',
                  mappedMasterCategoryId: 'cat_graphics',
                  mappedMasterCategoryName: 'Video & Graphics Cards',
                  confidence: 97
                }
              : child
          )
        }))
      )
      showNotification('AI Auto-matched 1 unmapped category with 97% confidence!')
    }, 1200)
  }

  // Dynamic Metrics Calculation (No hardcoded values)
  const getAllSupplierNodes = (nodes: SupplierCategoryNode[]): SupplierCategoryNode[] => {
    let result: SupplierCategoryNode[] = []
    nodes.forEach(n => {
      result.push(n)
      if (n.children) result = result.concat(getAllSupplierNodes(n.children))
    })
    return result
  }

  const allSupplierNodes = getAllSupplierNodes(supplierTree)
  const totalCount = allSupplierNodes.length
  const mappedCount = allSupplierNodes.filter(n => n.status === 'mapped').length
  const unmappedCount = allSupplierNodes.filter(n => n.status === 'unmapped').length
  const conflictCount = allSupplierNodes.filter(n => n.status === 'conflict').length
  const coveragePct = Math.round((mappedCount / (totalCount || 1)) * 100)

  return (
    <div className="relative space-y-6">
      {/* Toast Notification Banner */}
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
        title="Category Mapping & Taxonomy Alignment"
        subtitle="Dual-tree hierarchical category mapping engine between supplier category trees and Shift4Shop Master PIM Taxonomy"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoSuggest}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> AI Auto-Match Taxonomy
            </button>
            <button
              onClick={() => setRuleEngineOpen(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sliders size={14} /> Category Rules ({mappingRules.length})
            </button>
          </div>
        }
      />

      {/* Dynamic Taxonomy Coverage KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Taxonomy Coverage</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{coveragePct}%</span>
            <span className="text-xs text-emerald-600 font-bold">({mappedCount}/{totalCount} mapped)</span>
          </div>
          <ProgressBar value={coveragePct} color="emerald" className="mt-2" />
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Unmapped Supplier Categories</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{unmappedCount}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Require taxonomy assignment</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Conflict / Mismatch Warnings</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{conflictCount}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Low confidence or deprecated path</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Master Taxonomy Nodes</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">24 Categories</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Shift4Shop Store Tree</p>
        </div>
      </div>

      {/* Interactive Dual Tree Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT TREE: Supplier Categories */}
        <div className="lg:col-span-5 card p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Folder size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Supplier Categories</h3>
            </div>
            <select
              className="select input-sm text-2xs py-1 px-2"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unmapped">Unmapped Only ({unmappedCount})</option>
              <option value="mapped">Mapped Only ({mappedCount})</option>
              <option value="conflict">Conflicts ({conflictCount})</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier categories..."
              className="input pl-8 py-1.5 text-xs"
              value={searchSupplier}
              onChange={e => setSearchSupplier(e.target.value)}
            />
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            {supplierTree.map(node => (
              <SupplierTreeNode
                key={node.id}
                node={node}
                expanded={expandedSupplier}
                selectedNode={selectedSupplierNode}
                onToggleExpand={toggleSupplierExpand}
                onSelectNode={setSelectedSupplierNode}
                onPreview={setPreviewCategory}
                onUnmap={handleUnmapNode}
                filterStatus={filterStatus}
                searchQuery={searchSupplier}
              />
            ))}
          </div>
        </div>

        {/* CENTER ACTION CONNECTOR */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-4 card p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-center space-y-1">
            <span className="text-2xs font-bold text-slate-400 uppercase block">Category Action</span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Select one node from left and right to link</p>
          </div>

          {selectedSupplierNode && selectedMasterNode ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full text-center space-y-3"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-left text-2xs space-y-1">
                <p className="font-bold text-indigo-900 dark:text-indigo-300 truncate">{selectedSupplierNode.name}</p>
                <div className="text-center font-bold text-indigo-500">↓ MAP TO ↓</div>
                <p className="font-bold text-emerald-700 dark:text-emerald-300 truncate">{selectedMasterNode.name}</p>
              </div>

              {canEdit && (
                <button
                  onClick={handleConnectMapping}
                  className="w-full btn-primary btn-sm flex items-center justify-center gap-1.5 font-bold shadow-md"
                >
                  <LinkIcon size={14} /> Map Category Now
                </button>
              )}
            </motion.div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-2xs text-slate-400">
              <LinkIcon size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <span>Select a Supplier Category on the left and a Master Category on the right to map.</span>
            </div>
          )}

          <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 text-2xs text-slate-400 space-y-2">
            <p className="font-bold uppercase text-slate-500">Mapping Rules Active</p>
            <div className="flex items-center justify-between">
              <span>Auto-Matches:</span>
              <span className="font-bold text-emerald-600">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rule Engine:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{mappingRules.filter(r=>r.isEnabled).length} Rules</span>
            </div>
          </div>
        </div>

        {/* RIGHT TREE: Master PIM Taxonomy */}
        <div className="lg:col-span-5 card p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Folder size={16} className="text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Master PIM Category Taxonomy</h3>
            </div>
            <Badge variant="primary">Shift4Shop Store Tree</Badge>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search master categories..."
              className="input pl-8 py-1.5 text-xs"
              value={searchMaster}
              onChange={e => setSearchMaster(e.target.value)}
            />
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            {masterTree.map(node => (
              <MasterTreeNode
                key={node.id}
                node={node}
                expanded={expandedMaster}
                selectedNode={selectedMasterNode}
                onToggleExpand={toggleMasterExpand}
                onSelectNode={setSelectedMasterNode}
                searchQuery={searchMaster}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category Preview Modal */}
      {previewCategory && (
        <Modal
          open
          onClose={() => setPreviewCategory(null)}
          title={`Category Preview: ${previewCategory.name}`}
          subtitle={`Path: ${previewCategory.fullPath} · Product Count: ${previewCategory.productCount.toLocaleString()}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <span className="text-2xs text-slate-400 font-bold uppercase block">Mapped Destination</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {previewCategory.mappedMasterCategoryName || 'Unmapped Category'}
                </span>
              </div>
              {previewCategory.confidence && (
                <Badge variant="success">AI Match Confidence: {previewCategory.confidence}%</Badge>
              )}
            </div>

            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Sample SKUs Under This Category:</h4>
            <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
              {[
                { sku: 'TP-PROC-7950X', name: 'AMD Ryzen 9 7950X 16-Core Processor', price: '$599.00' },
                { sku: 'TP-PROC-14900K', name: 'Intel Core i9-14900K Desktop Processor', price: '$589.00' },
                { sku: 'TP-STOR-4TB-NVME', name: 'Samsung 990 PRO 4TB NVMe SSD', price: '$349.99' },
              ].map(item => (
                <div key={item.sku} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                    <span className="text-2xs text-slate-400">SKU: {item.sku}</span>
                  </div>
                  <span className="font-bold text-emerald-600">{item.price}</span>
                </div>
              ))}
            </div>
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

// Supplier Tree Node Component
const SupplierTreeNode: React.FC<{
  node: SupplierCategoryNode
  expanded: Record<string, boolean>
  selectedNode: SupplierCategoryNode | null
  onToggleExpand: (id: string) => void
  onSelectNode: (node: SupplierCategoryNode) => void
  onPreview: (node: SupplierCategoryNode) => void
  onUnmap: (node: SupplierCategoryNode) => void
  filterStatus: string
  searchQuery: string
}> = ({ node, expanded, selectedNode, onToggleExpand, onSelectNode, onPreview, onUnmap, filterStatus, searchQuery }) => {
  const isExpanded = expanded[node.id] ?? false
  const isSelected = selectedNode?.id === node.id

  if (filterStatus !== 'all' && node.status !== filterStatus) return null
  if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase()) && !node.code.toLowerCase().includes(searchQuery.toLowerCase())) return null

  return (
    <div className="space-y-1">
      <div
        onClick={() => onSelectNode(node)}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
            : node.status === 'mapped'
            ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100'
            : node.status === 'conflict'
            ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/30'
            : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/30'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {node.children && node.children.length > 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{node.name}</span>
              <span className="text-2xs text-slate-400 font-mono">({node.code})</span>
            </div>
            {node.mappedMasterCategoryName ? (
              <p className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1 mt-0.5">
                <span>→ {node.mappedMasterCategoryName}</span>
                {node.confidence && <span className="font-bold">({node.confidence}%)</span>}
              </p>
            ) : (
              <p className="text-2xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">Unmapped Category</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onPreview(node)}
            className="btn-icon text-slate-400 hover:text-slate-700"
            title="Preview SKUs"
          >
            <Eye size={13} />
          </button>
          {node.status === 'mapped' && (
            <button
              onClick={() => onUnmap(node)}
              className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              title="Unmap Category"
            >
              <Unlink size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Render Children */}
      {isExpanded && node.children && (
        <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-1">
          {node.children.map(child => (
            <SupplierTreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              selectedNode={selectedNode}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
              onPreview={onPreview}
              onUnmap={onUnmap}
              filterStatus={filterStatus}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Master Tree Node Component
const MasterTreeNode: React.FC<{
  node: MasterCategoryNode
  expanded: Record<string, boolean>
  selectedNode: MasterCategoryNode | null
  onToggleExpand: (id: string) => void
  onSelectNode: (node: MasterCategoryNode) => void
  searchQuery: string
}> = ({ node, expanded, selectedNode, onToggleExpand, onSelectNode, searchQuery }) => {
  const isExpanded = expanded[node.id] ?? false
  const isSelected = selectedNode?.id === node.id

  if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase()) && !node.code.toLowerCase().includes(searchQuery.toLowerCase())) return null

  return (
    <div className="space-y-1">
      <div
        onClick={() => onSelectNode(node)}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {node.children && node.children.length > 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate block">{node.name}</span>
            <span className="text-2xs text-slate-400 font-mono">Code: {node.code} · {node.productCount.toLocaleString()} SKUs</span>
          </div>
        </div>

        <Badge variant={node.mappedSupplierCategoriesCount > 0 ? 'success' : 'neutral'}>
          {node.mappedSupplierCategoriesCount} linked
        </Badge>
      </div>

      {isExpanded && node.children && (
        <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-1">
          {node.children.map(child => (
            <MasterTreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              selectedNode={selectedNode}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}
