import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Sliders, CheckCircle2, AlertTriangle, RefreshCw, Sparkles,
  Plus, Edit2, Trash2, ArrowRight, ShieldCheck, Check, X, Search, Cpu
} from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { MappingRuleEngineModal, DEFAULT_MAPPING_RULES } from './MappingRuleEngine'
import type { VariantType, VariantMappingRule, MappingRule } from '../../types'
import { useAuth } from '../../context/AuthContext'

const VARIANT_DIMENSIONS = [
  'Color', 'Size', 'Memory', 'Storage', 'Voltage', 'Length',
  'Width', 'Height', 'Material', 'Region', 'Language', 'Model'
]

const INITIAL_VARIANT_RULES: VariantMappingRule[] = [
  {
    id: 'v_rule_1',
    variantType: 'Memory',
    rawSupplierValue: '16GB DDR5',
    standardizedValue: '16 GB RAM',
    targetUnit: 'GB',
    conversionFactor: 1,
    supplierId: 's_techparts',
    appliedCount: 840,
  },
  {
    id: 'v_rule_2',
    variantType: 'Storage',
    rawSupplierValue: '1024 GB SSD',
    standardizedValue: '1 TB SSD',
    targetUnit: 'TB',
    conversionFactor: 0.001,
    supplierId: 's_techparts',
    appliedCount: 1240,
  },
  {
    id: 'v_rule_3',
    variantType: 'Voltage',
    rawSupplierValue: '110V - 120V AC',
    standardizedValue: '120 VAC',
    targetUnit: 'VAC',
    conversionFactor: 1,
    supplierId: 's_globalsource',
    appliedCount: 410,
  },
  {
    id: 'v_rule_4',
    variantType: 'Size',
    rawSupplierValue: 'XL / X-Large',
    standardizedValue: 'XL',
    supplierId: 's_primesup',
    appliedCount: 620,
  },
  {
    id: 'v_rule_5',
    variantType: 'Length',
    rawSupplierValue: '12 Inches',
    standardizedValue: '30.48 cm',
    targetUnit: 'cm',
    conversionFactor: 2.54,
    supplierId: 's_quickship',
    appliedCount: 290,
  }
]

export const VariantMapping: React.FC = () => {
  const { role } = useAuth()
  const canEdit = role === 'platform_owner' || role === 'administrator' || role === 'catalog_manager' || role === 'super_admin' || role === 'admin'

  const [activeDimension, setActiveDimension] = useState<string>('Memory')
  const [variantRules, setVariantRules] = useState<VariantMappingRule[]>(INITIAL_VARIANT_RULES)
  const [search, setSearch] = useState('')

  const [addRuleModal, setAddRuleModal] = useState(false)
  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(DEFAULT_MAPPING_RULES)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State for Add Normalization Rule
  const [rawVal, setRawVal] = useState('')
  const [stdVal, setStdVal] = useState('')
  const [unit, setUnit] = useState('')
  const [factor, setFactor] = useState(1)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Add Rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawVal.trim() || !stdVal.trim()) return

    const newRule: VariantMappingRule = {
      id: `v_rule_${Date.now()}`,
      variantType: activeDimension,
      rawSupplierValue: rawVal.trim(),
      standardizedValue: stdVal.trim(),
      targetUnit: unit.trim() || undefined,
      conversionFactor: Number(factor) || 1,
      appliedCount: 0,
    }

    setVariantRules([newRule, ...variantRules])
    setAddRuleModal(false)
    setRawVal('')
    setStdVal('')
    setUnit('')
    setFactor(1)
    showNotification(`Variant Normalization Rule added for ${activeDimension}!`)
  }

  const handleDeleteRule = (id: string) => {
    setVariantRules(prev => prev.filter(r => r.id !== id))
    showNotification(`Rule removed.`)
  }

  const handleBulkStandardize = () => {
    showNotification('Running AI Variant Normalization across catalog...')
    setTimeout(() => {
      setVariantRules(prev =>
        prev.map(r => ({ ...r, appliedCount: r.appliedCount + 45 }))
      )
      showNotification('Variant Normalization applied to 225 variant SKUs!')
    }, 1200)
  }

  // Filter Rules
  const filteredRules = variantRules.filter(r => {
    const matchDim = r.variantType === activeDimension
    const matchSearch = r.rawSupplierValue.toLowerCase().includes(search.toLowerCase()) || r.standardizedValue.toLowerCase().includes(search.toLowerCase())
    return matchDim && matchSearch
  })

  // Dynamic Metrics Calculation
  const totalApplied = variantRules.reduce((sum, r) => sum + r.appliedCount, 0)

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
        title="Variant Normalization & Standardization Engine"
        subtitle="Normalize unit values, sizes, colors, memory, storage, and voltages across supplier product feeds into master PIM specifications"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkStandardize}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> AI Bulk Standardize
            </button>
            {canEdit && (
              <button
                onClick={() => setAddRuleModal(true)}
                className="btn-primary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Plus size={14} /> Add Normalization Rule
              </button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Supported Dimensions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{VARIANT_DIMENSIONS.length}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Color, Size, Memory, Voltage, etc.</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Active Normalization Rules</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{variantRules.length}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Standardization rules configured</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Total Variant Normalizations</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalApplied.toLocaleString()}</p>
          <p className="text-2xs text-emerald-600 mt-0.5 font-bold">Applied to Master Catalog</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Duplicate Variant Warnings</p>
          <p className="text-2xl font-black text-amber-600 mt-1">2 Alerts</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Overlapping unit specs</p>
        </div>
      </div>

      {/* Dimension Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-hide">
        {VARIANT_DIMENSIONS.map(dim => (
          <button
            key={dim}
            onClick={() => setActiveDimension(dim)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDimension === dim
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {dim}
          </button>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder={`Search raw or standardized ${activeDimension} values...`} />

      {/* Rules Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">DIMENSION</th>
                <th className="whitespace-nowrap px-4 py-3.5">RAW SUPPLIER VALUE</th>
                <th className="whitespace-nowrap px-4 py-3.5">TRANSFORMATION</th>
                <th className="whitespace-nowrap px-4 py-3.5">STANDARDIZED PIM VALUE</th>
                <th className="whitespace-nowrap px-4 py-3.5">TARGET UNIT</th>
                <th className="whitespace-nowrap px-4 py-3.5">APPLIED COUNT</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No normalization rules found for dimension <strong>{activeDimension}</strong>.
                  </td>
                </tr>
              ) : (
                filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-xs">
                      <Badge variant="primary">{rule.variantType}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
                      "{rule.rawSupplierValue}"
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ArrowRight size={14} className="text-slate-400 mx-auto" />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      "{rule.standardizedValue}"
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {rule.targetUnit ? `${rule.targetUnit} (x${rule.conversionFactor || 1})` : '—'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-xs text-slate-700 dark:text-slate-200">
                      {rule.appliedCount.toLocaleString()} SKUs
                    </td>
                    <td className="px-4 py-3.5 text-right pr-4">
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Rule"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        open={addRuleModal}
        onClose={() => setAddRuleModal(false)}
        title={`Add Normalization Rule for ${activeDimension}`}
        subtitle="Map raw supplier variations to standardized PIM specifications and unit formulas"
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Raw Supplier Input Value *</label>
            <input
              type="text"
              required
              placeholder="e.g. 1024 GB SSD or 12 Inches"
              className="input font-mono text-xs"
              value={rawVal}
              onChange={e => setRawVal(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Standardized PIM Value *</label>
            <input
              type="text"
              required
              placeholder="e.g. 1 TB SSD or 30.48 cm"
              className="input font-mono text-xs"
              value={stdVal}
              onChange={e => setStdVal(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Unit (Optional)</label>
              <input
                type="text"
                placeholder="e.g. TB or cm"
                className="input font-mono text-xs"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Conversion Factor</label>
              <input
                type="number"
                step="any"
                className="input font-mono text-xs"
                value={factor}
                onChange={e => setFactor(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAddRuleModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Normalization Rule</button>
          </div>
        </form>
      </Modal>

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
