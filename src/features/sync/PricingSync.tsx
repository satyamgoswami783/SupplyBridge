import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
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

  return (
    <div className="relative">
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
          <>
            <button
              onClick={handleOpenAddRule}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Price Rule
            </button>
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Prices Now'}
            </button>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Catalog Margin', value: '22.4%', color: 'text-emerald-600', trend: '+1.2%' },
          { label: 'Pending Price Updates', value: '486', color: 'text-amber-600', trend: '' },
          { label: 'Active Rules', value: rulesList.length.toString(), color: 'text-primary-600', trend: '' },
          { label: 'Last Price Sync', value: '12 min ago', color: 'text-slate-700', trend: '' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
            <div className="flex items-end gap-2">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              {s.trend && <span className="text-xs text-emerald-600 font-medium mb-0.5">{s.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Active Pricing Rules */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-primary-600" /> Active Pricing Rules
          </h3>
          <div className="space-y-3">
            {rulesList.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{rule.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <code className="mono">{rule.formula}</code> · {rule.products.toLocaleString()} products
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
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Supplier Cost vs Retail Price Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priceChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sku" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${v as number}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="supplier" name="Supplier Cost" fill="#06b6d4" radius={[4,4,0,0]} />
              <Bar dataKey="retail"   name="Retail Price"   fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price History Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Price Update Audit Log</h3>
        </div>
        <FilterBar search={search} onSearch={setSearch} placeholder="Search product name or SKU..." />
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Change</th>
                <th>Margin</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'AMD X570 Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', old: 289.99, new: 299.99, margin: 18.3, ok: true },
                { name: 'DDR5 32GB Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', old: 124.99, new: 119.99, margin: 25.8, ok: true },
                { name: 'Samsung 980 Pro 2TB', sku: 'SSD-980P-001', supplier: 'GlobalSource', old: 144.99, new: 149.99, margin: 20.7, ok: true },
                { name: 'NVIDIA RTX 4090', sku: 'GPU-4090-001', supplier: 'TechParts', old: 0, new: 1699.99, margin: 14.7, ok: false },
              ].map((row, i) => {
                const change = row.new - row.old
                return (
                  <tr key={i}>
                    <td><span className="font-medium text-slate-800 text-sm">{row.name}</span></td>
                    <td><code className="mono">{row.sku}</code></td>
                    <td><span className="text-xs text-slate-500">{row.supplier}</span></td>
                    <td><span className="text-slate-500">${row.old.toFixed(2)}</span></td>
                    <td><span className="font-semibold text-slate-800">${row.new.toFixed(2)}</span></td>
                    <td>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : '='}
                        {change > 0 ? '+' : ''}{change.toFixed(2)}
                      </span>
                    </td>
                    <td><span className="text-emerald-600 font-semibold text-sm">{row.margin}%</span></td>
                    <td><Badge variant={row.ok ? 'success' : 'warning'}>{row.ok ? 'Synced' : 'Pending'}</Badge></td>
                    <td><span className="text-xs text-slate-400 font-mono">2 hr ago</span></td>
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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              placeholder="e.g. Components — 20% Standard Markup"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              placeholder="e.g. Cost * 1.20 + $3"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Applies To Category</label>
            <select
              className="select"
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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Applies To Category</label>
            <select
              className="select"
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
