import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Play, Layers, Code, Check } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import type { MappingRule, RuleCondition, RuleAction } from '../../types'

interface MappingRuleEngineProps {
  open: boolean
  onClose: () => void
  rules: MappingRule[]
  onSaveRules: (rules: MappingRule[]) => void
  onNotify?: (msg: string) => void
}

export const DEFAULT_MAPPING_RULES: MappingRule[] = [
  {
    id: 'rule_1',
    name: 'Auto-Assign Manufacturer for Samsung Brand',
    priority: 1,
    isEnabled: true,
    version: 3,
    appliedCount: 1420,
    lastExecuted: new Date(Date.now() - 3600000).toISOString(),
    conditions: [
      { field: 'brand', operator: 'equals', value: 'Samsung' }
    ],
    actions: [
      { targetField: 'manufacturer', actionType: 'set_value', value: 'Samsung Electronics Co., Ltd.' }
    ]
  },
  {
    id: 'rule_2',
    name: 'Map Storage Category for SSD Products',
    priority: 2,
    isEnabled: true,
    version: 2,
    appliedCount: 890,
    lastExecuted: new Date(Date.now() - 7200000).toISOString(),
    conditions: [
      { field: 'category', operator: 'contains', value: 'SSD' }
    ],
    actions: [
      { targetField: 'masterCategory', actionType: 'assign_category', value: 'CAT-COMP-STORAGE-SSD' }
    ]
  },
  {
    id: 'rule_3',
    name: 'Validation Error for Empty Weight Attribute',
    priority: 3,
    isEnabled: true,
    version: 1,
    appliedCount: 42,
    lastExecuted: new Date(Date.now() - 86400000).toISOString(),
    conditions: [
      { field: 'weight', operator: 'is_empty', value: '' }
    ],
    actions: [
      { targetField: 'weight', actionType: 'trigger_validation_error', value: 'Shipping Weight is required for Master Catalog publication.' }
    ]
  },
  {
    id: 'rule_4',
    name: 'Convert Grams to Kilograms for Heavy Components',
    priority: 4,
    isEnabled: true,
    version: 1,
    appliedCount: 650,
    lastExecuted: new Date(Date.now() - 14400000).toISOString(),
    conditions: [
      { field: 'unit', operator: 'equals', value: 'g' }
    ],
    actions: [
      { targetField: 'weight', actionType: 'convert_unit', value: 'kg' }
    ]
  }
]

export const MappingRuleEngineModal: React.FC<MappingRuleEngineProps> = ({
  open,
  onClose,
  rules,
  onSaveRules,
  onNotify
}) => {
  const [ruleList, setRuleList] = useState<MappingRule[]>(rules.length > 0 ? rules : DEFAULT_MAPPING_RULES)
  const [editingRule, setEditingRule] = useState<MappingRule | null>(null)
  const [isBuildingNew, setIsBuildingNew] = useState(false)

  // Rule Form State
  const [ruleName, setRuleName] = useState('')
  const [priority, setPriority] = useState(1)
  const [condField, setCondField] = useState('brand')
  const [condOp, setCondOp] = useState<RuleCondition['operator']>('equals')
  const [condVal, setCondVal] = useState('')
  const [actionTarget, setActionTarget] = useState('manufacturer')
  const [actionType, setActionType] = useState<RuleAction['actionType']>('set_value')
  const [actionVal, setActionVal] = useState('')

  const handleToggleRule = (id: string) => {
    const updated = ruleList.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r)
    setRuleList(updated)
    onSaveRules(updated)
    onNotify?.(`Rule state updated`)
  }

  const handleStartCreate = () => {
    setRuleName('')
    setPriority(ruleList.length + 1)
    setCondField('brand')
    setCondOp('equals')
    setCondVal('')
    setActionTarget('manufacturer')
    setActionType('set_value')
    setActionVal('')
    setEditingRule(null)
    setIsBuildingNew(true)
  }

  const handleSaveRuleForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName.trim()) return

    const newRule: MappingRule = {
      id: editingRule ? editingRule.id : `rule_${Date.now()}`,
      name: ruleName.trim(),
      priority,
      isEnabled: true,
      version: editingRule ? editingRule.version + 1 : 1,
      appliedCount: editingRule ? editingRule.appliedCount : 0,
      lastExecuted: new Date().toISOString(),
      conditions: [{ field: condField, operator: condOp, value: condVal }],
      actions: [{ targetField: actionTarget, actionType: actionType, value: actionVal }]
    }

    let updated: MappingRule[]
    if (editingRule) {
      updated = ruleList.map(r => r.id === editingRule.id ? newRule : r)
    } else {
      updated = [...ruleList, newRule]
    }

    setRuleList(updated)
    onSaveRules(updated)
    setIsBuildingNew(false)
    setEditingRule(null)
    onNotify?.(`Rule "${newRule.name}" saved successfully!`)
  }

  const handleDeleteRule = (id: string) => {
    const updated = ruleList.filter(r => r.id !== id)
    setRuleList(updated)
    onSaveRules(updated)
    onNotify?.(`Rule deleted.`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reusable Data Mapping Rule Engine"
      subtitle="Configure IF-THEN conditional rules, validation triggers, and automated transformations"
      size="xl"
    >
      <div className="space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Rule Engine v2.4</span>
            <p className="text-sm font-semibold text-slate-200">{ruleList.filter(r => r.isEnabled).length} Active Mapping Rules Operating</p>
          </div>
          <button
            onClick={handleStartCreate}
            className="btn-primary btn-sm flex items-center gap-1.5 shadow-md"
          >
            <Plus size={14} /> Create New Rule
          </button>
        </div>

        {/* Rule Form Modal/Drawer */}
        {isBuildingNew && (
          <form onSubmit={handleSaveRuleForm} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {editingRule ? `Edit Rule (v${editingRule.version})` : 'New IF-THEN Rule Configuration'}
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IF Brand = Samsung THEN Map Manufacturer"
                  className="input text-xs"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Priority</label>
                <input
                  type="number"
                  min={1}
                  className="input text-xs"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Condition Section */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-900/60 space-y-2">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">IF (Condition)</span>
              <div className="grid grid-cols-3 gap-2">
                <select className="select input-sm text-xs" value={condField} onChange={e => setCondField(e.target.value)}>
                  <option value="brand">Brand</option>
                  <option value="category">Category</option>
                  <option value="supplier_sku">Supplier SKU</option>
                  <option value="weight">Weight Attribute</option>
                  <option value="voltage">Voltage</option>
                  <option value="unit">Unit Symbol</option>
                </select>
                <select className="select input-sm text-xs" value={condOp} onChange={e => setCondOp(e.target.value as any)}>
                  <option value="equals">Equals (==)</option>
                  <option value="contains">Contains</option>
                  <option value="starts_with">Starts With</option>
                  <option value="is_empty">Is Empty / Null</option>
                </select>
                <input
                  type="text"
                  placeholder="Target value..."
                  className="input input-sm text-xs"
                  value={condVal}
                  onChange={e => setCondVal(e.target.value)}
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200/60 dark:border-indigo-900/60 space-y-2">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">THEN (Action)</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Target Field (e.g. manufacturer)"
                  className="input input-sm text-xs"
                  value={actionTarget}
                  onChange={e => setActionTarget(e.target.value)}
                />
                <select className="select input-sm text-xs" value={actionType} onChange={e => setActionType(e.target.value as any)}>
                  <option value="set_value">Set Static Value</option>
                  <option value="assign_category">Assign Category</option>
                  <option value="trigger_validation_error">Trigger Validation Error</option>
                  <option value="convert_unit">Convert Unit</option>
                  <option value="map_field">Map Field Direct</option>
                </select>
                <input
                  type="text"
                  placeholder="Action payload / error text..."
                  className="input input-sm text-xs"
                  value={actionVal}
                  onChange={e => setActionVal(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsBuildingNew(false)} className="btn-secondary btn-sm">Cancel</button>
              <button type="submit" className="btn-primary btn-sm flex items-center gap-1">
                <Check size={14} /> Save Rule
              </button>
            </div>
          </form>
        )}

        {/* Existing Rules Table */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {ruleList.map(rule => (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                rule.isEnabled
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                  #{rule.priority}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{rule.name}</span>
                    <Badge variant={rule.isEnabled ? 'success' : 'neutral'}>v{rule.version}</Badge>
                  </div>

                  {/* Conditions & Actions Summary */}
                  <div className="flex items-center gap-2 mt-1 font-mono text-2xs">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      IF {rule.conditions[0]?.field} {rule.conditions[0]?.operator} "{rule.conditions[0]?.value}"
                    </span>
                    <ArrowRight size={10} className="text-slate-400" />
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      THEN {rule.actions[0]?.actionType} → {rule.actions[0]?.targetField}: "{rule.actions[0]?.value}"
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xs text-slate-400 font-mono hidden sm:inline">Applied {rule.appliedCount.toLocaleString()} times</span>
                <button
                  type="button"
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors ${
                    rule.isEnabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rule.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Rule"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
