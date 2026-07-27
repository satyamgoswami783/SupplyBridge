import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sliders, Database, CheckCircle2, AlertTriangle, RefreshCw, Sparkles,
  Plus, Edit2, Trash2, Code, ShieldCheck, Check, X, Search, Layers, FileText
} from 'lucide-react'
import { SectionHeader, FilterBar, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { MappingRuleEngineModal, DEFAULT_MAPPING_RULES } from './MappingRuleEngine'
import type { AttributeDefinition, AttributeFieldMapping, MappingRule } from '../../types'
import { useAuth } from '../../context/AuthContext'

const INITIAL_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'attr_1',
    code: 'SKU_UPC',
    name: 'Universal Product Code (UPC)',
    group: 'General',
    dataType: 'text',
    isRequired: true,
    validationRegex: '^[0-9]{12}$',
    mappedSupplierFieldsCount: 4,
    coveragePct: 99.4,
  },
  {
    id: 'attr_2',
    code: 'WEIGHT_NET',
    name: 'Item Net Weight',
    group: 'Physical Specs',
    dataType: 'number',
    isRequired: true,
    defaultUnit: 'kg',
    mappedSupplierFieldsCount: 3,
    coveragePct: 96.8,
  },
  {
    id: 'attr_3',
    code: 'VOLTAGE_RATING',
    name: 'Operating Input Voltage',
    group: 'Electrical',
    dataType: 'select',
    isRequired: false,
    lookupValues: ['110 VAC', '120 VAC', '220 VAC', '240 VAC', '12 VDC', '24 VDC'],
    mappedSupplierFieldsCount: 2,
    coveragePct: 88.5,
  },
  {
    id: 'attr_4',
    code: 'PKG_DIMENSIONS_VOL',
    name: 'Total Cubic Volume',
    group: 'Packaging',
    dataType: 'formula',
    isRequired: false,
    formulaExpression: 'Length * Width * Height',
    mappedSupplierFieldsCount: 3,
    coveragePct: 92.1,
  },
  {
    id: 'attr_5',
    code: 'COMPLIANCE_ROHS',
    name: 'RoHS Environmental Certificate',
    group: 'Compliance',
    dataType: 'boolean',
    isRequired: true,
    defaultValue: 'true',
    lookupValues: ['Y -> true', 'N -> false', '1 -> true', '0 -> false'],
    mappedSupplierFieldsCount: 4,
    coveragePct: 98.2,
  }
]

export const AttributeMapping: React.FC = () => {
  const { role } = useAuth()
  const canEdit = role === 'platform_owner' || role === 'administrator' || role === 'catalog_manager' || role === 'super_admin' || role === 'admin'

  const [attributes, setAttributes] = useState<AttributeDefinition[]>(INITIAL_ATTRIBUTES)
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [search, setSearch] = useState('')

  const [addAttrModal, setAddAttrModal] = useState(false)
  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(DEFAULT_MAPPING_RULES)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [group, setGroup] = useState<AttributeDefinition['group']>('General')
  const [dataType, setDataType] = useState<AttributeDefinition['dataType']>('text')
  const [isRequired, setIsRequired] = useState(false)
  const [regex, setRegex] = useState('')

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return

    const created: AttributeDefinition = {
      id: `attr_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      group,
      dataType,
      isRequired,
      validationRegex: regex.trim() || undefined,
      mappedSupplierFieldsCount: 0,
      coveragePct: 0,
    }

    setAttributes([created, ...attributes])
    setAddAttrModal(false)
    setCode('')
    setName('')
    setRegex('')
    showNotification(`Attribute "${created.name}" added to Master Catalog Schema!`)
  }

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(a => a.id !== id))
    showNotification(`Attribute definition removed.`)
  }

  const filtered = attributes.filter(a => {
    const matchGroup = activeGroup === 'all' || a.group === activeGroup
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  // Dynamic Coverage Average
  const avgCoverage = Math.round(attributes.reduce((sum, a) => sum + a.coveragePct, 0) / (attributes.length || 1))

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
        title="Master Attribute Engine & Data Validation Schema"
        subtitle="Manage required PIM attributes, regex validation rules, formula attributes, lookup dictionaries, and data type constraints"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRuleEngineOpen(true)}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Sliders size={14} /> Attribute Mapping Rules ({mappingRules.length})
            </button>
            {canEdit && (
              <button
                onClick={() => setAddAttrModal(true)}
                className="btn-primary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Plus size={14} /> Define New Attribute
              </button>
            )}
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Defined Attributes</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{attributes.length}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">{attributes.filter(a=>a.isRequired).length} Required for Publish</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Average Attribute Coverage</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{avgCoverage}%</p>
          <ProgressBar value={avgCoverage} color="emerald" className="mt-2" />
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Formula Attributes</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{attributes.filter(a=>a.dataType === 'formula').length}</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Dynamic math expressions</p>
        </div>

        <div className="card p-4">
          <p className="text-2xs text-slate-400 font-bold uppercase">Validation Constraints</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{attributes.filter(a=>a.validationRegex).length} Regex</p>
          <p className="text-2xs text-slate-400 mt-0.5 font-medium">Data integrity rules</p>
        </div>
      </div>

      {/* Group Filters */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'General', 'Physical Specs', 'Electrical', 'Packaging', 'Compliance', 'Marketing'].map(grp => (
          <button
            key={grp}
            onClick={() => setActiveGroup(grp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeGroup === grp
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {grp === 'all' ? 'All Attribute Groups' : grp}
          </button>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Search attribute code, name, or validation rule..." />

      {/* Attribute Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">ATTRIBUTE CODE</th>
                <th className="whitespace-nowrap px-4 py-3.5">ATTRIBUTE NAME</th>
                <th className="whitespace-nowrap px-4 py-3.5">GROUP</th>
                <th className="whitespace-nowrap px-4 py-3.5">DATA TYPE</th>
                <th className="whitespace-nowrap px-4 py-3.5">REQUIRED?</th>
                <th className="whitespace-nowrap px-4 py-3.5">VALIDATION / FORMULA</th>
                <th className="whitespace-nowrap px-4 py-3.5">COVERAGE</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(attr => (
                <tr key={attr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                    {attr.code}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                    {attr.name}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-xs">
                    <Badge variant="neutral">{attr.group}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    {attr.dataType}
                  </td>
                  <td className="px-4 py-3.5">
                    {attr.isRequired ? (
                      <Badge variant="danger" dot>REQUIRED</Badge>
                    ) : (
                      <Badge variant="neutral">Optional</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-2xs text-slate-600 dark:text-slate-300">
                    {attr.formulaExpression ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">f(x): {attr.formulaExpression}</span>
                    ) : attr.validationRegex ? (
                      <span className="text-rose-600 dark:text-rose-400">Regex: {attr.validationRegex}</span>
                    ) : attr.lookupValues ? (
                      <span className="text-indigo-600 dark:text-indigo-400">Lookup ({attr.lookupValues.length} values)</span>
                    ) : (
                      'Standard Direct'
                    )}
                  </td>
                  <td className="px-4 py-3.5 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{attr.coveragePct}%</span>
                      <ProgressBar value={attr.coveragePct} color="emerald" className="flex-1" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right pr-4">
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Attribute"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Attribute Modal */}
      <Modal
        open={addAttrModal}
        onClose={() => setAddAttrModal(false)}
        title="Define New Master Attribute"
        subtitle="Add custom spec attribute definition with data type constraints and regex rules"
      >
        <form onSubmit={handleCreateAttribute} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Attribute Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. WEIGHT_NET"
                className="input font-mono uppercase text-xs"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Attribute Label *</label>
              <input
                type="text"
                required
                placeholder="e.g. Net Item Weight"
                className="input text-xs"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Attribute Group</label>
              <select className="select text-xs" value={group} onChange={e => setGroup(e.target.value as any)}>
                <option value="General">General</option>
                <option value="Physical Specs">Physical Specs</option>
                <option value="Electrical">Electrical</option>
                <option value="Packaging">Packaging</option>
                <option value="Compliance">Compliance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Data Type</label>
              <select className="select text-xs" value={dataType} onChange={e => setDataType(e.target.value as any)}>
                <option value="text">Text String</option>
                <option value="number">Numeric</option>
                <option value="boolean">Boolean (Yes/No)</option>
                <option value="select">Dropdown Select</option>
                <option value="formula">Formula Expression</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Validation Regex Pattern (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ^[0-9]{12}$"
              className="input font-mono text-xs"
              value={regex}
              onChange={e => setRegex(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="reqCheck"
              checked={isRequired}
              onChange={e => setIsRequired(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600"
            />
            <label htmlFor="reqCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark as Required for Master Catalog Publication
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAddAttrModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Define Attribute</button>
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
