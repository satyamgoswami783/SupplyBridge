import React, { useState } from 'react'
import { Plus, Edit, Trash2, Layers } from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { mockVariantTypes } from '../../data/mockData'

export const Variants: React.FC = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const filtered = mockVariantTypes.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <SectionHeader
        title="Variant Types"
        subtitle="Define product variant dimensions used across all products"
        actions={<button onClick={() => setAddOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Variant Type</button>}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search variant types..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center"><Layers size={14} className="text-violet-600" /></div>
                <div>
                  <p className="font-bold text-slate-800">{v.name}</p>
                  <p className="text-xs text-slate-400">{v.productCount.toLocaleString()} products</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn-icon"><Edit size={13} /></button>
                <button className="btn-icon text-rose-500 hover:bg-rose-50"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {v.values.map(val => (
                <span key={val} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{val}</span>
              ))}
              <button className="px-2.5 py-1 border border-dashed border-slate-300 text-slate-400 rounded-full text-xs hover:border-primary-400 hover:text-primary-600 transition-colors">+ Add</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Variant Type"
        footer={<><button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Create</button></>}
      >
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Variant Type Name *</label><input className="input" placeholder="e.g. Color, Size, Storage" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Values (comma-separated)</label><input className="input" placeholder="e.g. Black, White, Red, Blue" /></div>
        </div>
      </Modal>
    </div>
  )
}
