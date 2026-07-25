import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Plus, Edit2, Trash2, CheckCircle2, FileSpreadsheet } from 'lucide-react'
import { SectionHeader, FilterBar, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const priceChartData = [
  { sku: 'MB-X570', supplier: 245, cost: 245, retail: 299 },
  { sku: 'RAM-DDR5', supplier: 89, cost: 89, retail: 119 },
  { sku: 'SSD-980', supplier: 119, cost: 119, retail: 149 },
  { sku: 'GPU-4090', supplier: 1450, cost: 1450, retail: 1699 },
  { sku: 'CPU-7950', supplier: 520, cost: 520, retail: 649 },
]

interface PriceRule {
  id: string
  name: string
  formula: string
  applies: string
  products: number
}

const INITIAL_RULES: PriceRule[] = [
  { id: 'r1', name: 'Electronics — Standard Markup',  formula: 'Cost × 1.22 + $5', applies: 'Electronics', products: 45200 },
  { id: 'r2', name: 'Components — Volume Pricing',    formula: 'Cost × 1.18',      applies: 'PC Components', products: 18400 },
  { id: 'r3', name: 'Accessories — High Margin',      formula: 'Cost × 1.35',      applies: 'Accessories', products: 8900 },
  { id: 'r4', name: 'Industrial — Fixed Margin',      formula: 'Cost + 15%',       applies: 'Industrial', products: 6200 },
]

export const PricingSync: React.FC = () => {
  const [rulesList, setRulesList] = useState<PriceRule[]>(INITIAL_RULES)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [addRuleOpen, setAddRuleOpen] = useState(false)
  const [editRuleOpen, setEditRuleOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [editingRule, setEditingRule] = useState<PriceRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<PriceRule | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    formula: '',
    applies: 'Electronics',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSyncPrices = () => {
    setSyncing(true)
    showNotification('Pricing sync initialized...')
    setTimeout(() => {
      setSyncing(false)
      showNotification('Pricing synchronization complete! 486 retail prices updated.')
    }, 2000)
  }

  const handleOpenAddRule = () => {
    setRuleFormData({ name: '', formula: '', applies: 'Electronics' })
    setAddRuleOpen(true)
  }

  const handleCreateRule = () => {
    if (!ruleFormData.name.trim() || !ruleFormData.formula.trim()) {
      alert('Please enter Rule Name and Formula.')
      return
    }

    const created: PriceRule = {
      id: `r_${Date.now()}`,
      name: ruleFormData.name,
      formula: ruleFormData.formula,
      applies: ruleFormData.applies,
      products: 0,
    }

    setRulesList([created, ...rulesList])
    setAddRuleOpen(false)
    showNotification(`Price Rule "${created.name}" created successfully!`)
  }

  const handleOpenEditRule = (rule: PriceRule) => {
    setEditingRule(rule)
    setRuleFormData({
      name: rule.name,
      formula: rule.formula,
      applies: rule.applies,
    })
    setEditRuleOpen(true)
  }

  const handleSaveEditRule = () => {
    if (!editingRule || !ruleFormData.name.trim() || !ruleFormData.formula.trim()) return

    setRulesList(prev =>
      prev.map(r => {
        if (r.id === editingRule.id) {
          return {
            ...r,
            name: ruleFormData.name,
            formula: ruleFormData.formula,
            applies: ruleFormData.applies,
          }
        }
        return r
      })
    )

    setEditRuleOpen(false)
    setEditingRule(null)
    showNotification(`Price Rule "${ruleFormData.name}" updated successfully!`)
  }

  const handleConfirmDeleteRule = () => {
    if (!deletingRule) return

    setRulesList(prev => prev.filter(r => r.id !== deletingRule.id))
    showNotification(`Price Rule "${deletingRule.name}" deleted.`)
    setDeleteDialogOpen(false)
    setDeletingRule(null)
  }

  const handleExportPricingCSV = () => {
    showNotification('Generating Price Update Audit Log CSV export...')
    const csvHeaders = 'Product Name,SKU,Supplier,Old Price,New Price,Change,Margin %,Status,Time\n'
    const auditRows = [
      { name: 'AMD X570 Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', old: 289.99, new: 299.99, margin: 18.3, ok: true, time: '2 hr ago' },
      { name: 'DDR5 32GB Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', old: 124.99, new: 119.99, margin: 25.8, ok: true, time: '2 hr ago' },
      { name: 'Samsung 980 Pro 2TB', sku: 'SSD-980P-001', supplier: 'GlobalSource', old: 144.99, new: 149.99, margin: 20.7, ok: true, time: '2 hr ago' },
      { name: 'NVIDIA RTX 4090', sku: 'GPU-4090-001', supplier: 'TechParts', old: 0, new: 1699.99, margin: 14.7, ok: false, time: '2 hr ago' },
    ]
    const csvRows = auditRows.map(r =>
      `"${r.name}","${r.sku}","${r.supplier}",${r.old},${r.new},${(r.new - r.old).toFixed(2)},${r.margin},"${r.ok ? 'Synced' : 'Pending'}","${r.time}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Pricing_Audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Price Audit Log CSV file downloaded!')
  }

  const auditLogRows = [
    { name: 'AMD X570 Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', old: 289.99, new: 299.99, margin: 18.3, ok: true, time: '2 hr ago' },
    { name: 'DDR5 32GB Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', old: 124.99, new: 119.99, margin: 25.8, ok: true, time: '2 hr ago' },
    { name: 'Samsung 980 Pro 2TB', sku: 'SSD-980P-001', supplier: 'GlobalSource', old: 144.99, new: 149.99, margin: 20.7, ok: true, time: '2 hr ago' },
    { name: 'NVIDIA RTX 4090', sku: 'GPU-4090-001', supplier: 'TechParts', old: 0, new: 1699.99, margin: 14.7, ok: false, time: '2 hr ago' },
  ].filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative space-y-6">
      {/* Toast Notification Banner */}
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
        title="Pricing Synchronization"
        subtitle="Manage pricing markup rules and synchronize supplier price updates to storefronts"
        actions={
          <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
            <button
              onClick={handleExportPricingCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-semibold cursor-pointer px-2 sm:px-3 text-xs"
              title="Download Pricing Audit Log CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleOpenAddRule}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-semibold cursor-pointer px-2 sm:px-3 text-xs"
            >
              <Plus size={14} /> Add Rule
            </button>
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer px-2 sm:px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin text-white' : ''} />
              <span>{syncing ? 'Syncing...' : <><span className="sm:hidden">Sync Prices</span><span className="hidden sm:inline">Sync Prices Now</span></>}</span>
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Catalog Margin', value: '22.4%', color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-100', trend: '+1.2% margin' },
          { label: 'Pending Price Updates', value: '486 SKUs', color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-100', trend: 'Awaiting sync' },
          { label: 'Active Rules', value: rulesList.length.toString(), color: 'text-primary-700', bg: 'bg-primary-50/80 border-primary-100', trend: 'Formula active' },
          { label: 'Last Price Sync', value: '12 min ago', color: 'text-slate-800', bg: 'bg-white border-slate-200', trend: '486 updated' },
        ].map(s => (
          <div key={s.label} className={`card p-4 border ${s.bg}`}>
            <p className="text-xs text-slate-500 font-semibold mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              {s.trend && <span className="text-2xs text-slate-500 font-medium">{s.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Active Pricing Rules */}
        <div className="card p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-primary-600" /> Active Pricing Markup Rules
          </h3>
          <div className="space-y-3">
            {rulesList.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div>
                  <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <code className="mono font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-800 rounded-md">{rule.formula}</code>
                    <span>• {rule.products.toLocaleString()} SKUs</span>
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="success">{rule.applies}</Badge>
                  <button
                    onClick={() => handleOpenEditRule(rule)}
                    className="btn-icon text-slate-600 hover:bg-slate-200"
                    title="Edit Rule"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => { setDeletingRule(rule); setDeleteDialogOpen(true); }}
                    className="btn-icon text-rose-500 hover:bg-rose-50"
                    title="Delete Rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Comparison Chart */}
        <div className="card p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Supplier Cost vs Retail Price Comparison</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={priceChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sku" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${v as number}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="supplier" name="Supplier Cost" fill="#06b6d4" radius={[4,4,0,0]} />
              <Bar dataKey="retail"   name="Retail Price"   fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price History Table */}
      <div className="card p-5 border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Price Update Audit Log</h3>
            <p className="text-xs text-slate-400 font-medium">Recent supplier price updates and margin calculations</p>
          </div>
        </div>

        <FilterBar search={search} onSearch={setSearch} placeholder="Search product name or SKU..." />

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[200px]">Product Name</th>
                <th className="min-w-[130px]">SKU</th>
                <th className="min-w-[120px]">Supplier</th>
                <th className="min-w-[100px]">Old Price</th>
                <th className="min-w-[100px]">New Price</th>
                <th className="min-w-[110px]">Change</th>
                <th className="min-w-[90px]">Margin</th>
                <th className="min-w-[100px]">Status</th>
                <th className="min-w-[110px]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogRows.map((row, i) => {
                const change = row.new - row.old
                return (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Product Name"><span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{row.name}</span></td>
                    <td data-label="SKU">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold inline-block whitespace-nowrap">
                        {row.sku}
                      </span>
                    </td>
                    <td data-label="Supplier"><span className="text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">{row.supplier}</span></td>
                    <td data-label="Old Price"><span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium whitespace-nowrap">${row.old.toFixed(2)}</span></td>
                    <td data-label="New Price"><span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">${row.new.toFixed(2)}</span></td>
                    <td data-label="Change">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap ${change > 0 ? 'text-emerald-600 dark:text-emerald-400' : change < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : '='}
                        {change > 0 ? '+' : ''}${change.toFixed(2)}
                      </span>
                    </td>
                    <td data-label="Margin"><span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">{row.margin}%</span></td>
                    <td data-label="Status"><Badge variant={row.ok ? 'success' : 'warning'} dot>{row.ok ? 'Synced' : 'Pending'}</Badge></td>
                    <td data-label="Time"><span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{row.time}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD PRICE RULE MODAL --- */}
      <Modal
        open={addRuleOpen}
        onClose={() => setAddRuleOpen(false)}
        title="Add Pricing Rule"
        subtitle="Define dynamic markup formulas for supplier catalog prices"
        size="md"
        footer={
          <>
            <button onClick={() => setAddRuleOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateRule} className="btn-primary">Create Price Rule</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              placeholder="e.g. Components — 20% Standard Markup"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              placeholder="e.g. Cost * 1.20 + $3"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Applies To Category</label>
            <select
              className="select font-medium"
              value={ruleFormData.applies}
              onChange={e => setRuleFormData({ ...ruleFormData, applies: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="PC Components">PC Components</option>
              <option value="Accessories">Accessories</option>
              <option value="Industrial">Industrial</option>
              <option value="All Catalog">All Catalog</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- EDIT PRICE RULE MODAL --- */}
      <Modal
        open={editRuleOpen}
        onClose={() => setEditRuleOpen(false)}
        title="Edit Pricing Rule"
        subtitle={`Updating formula for ${editingRule?.name}`}
        size="md"
        footer={
          <>
            <button onClick={() => setEditRuleOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEditRule} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Applies To Category</label>
            <select
              className="select font-medium"
              value={ruleFormData.applies}
              onChange={e => setRuleFormData({ ...ruleFormData, applies: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="PC Components">PC Components</option>
              <option value="Accessories">Accessories</option>
              <option value="Industrial">Industrial</option>
              <option value="All Catalog">All Catalog</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteRule}
        title="Delete Pricing Rule"
        message={`Are you sure you want to delete rule "${deletingRule?.name}"?`}
        confirmLabel="Yes, Delete Rule"
        danger
      />
    </div>
  )
}
