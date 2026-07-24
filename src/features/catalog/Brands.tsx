import React, { useState } from 'react'
import { Plus, Edit, Trash2, Award } from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockBrands } from '../../data/mockData'

export const Brands: React.FC = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const filtered = mockBrands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <SectionHeader
        title="Brands"
        subtitle={`${mockBrands.length} brands in master catalog`}
        actions={<button onClick={() => setAddOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Brand</button>}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search brands..." />
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Brand</th><th>Products</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(brand => (
                <tr key={brand.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Award size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{brand.name}</p>
                        <p className="text-xs text-slate-400">{brand.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-semibold text-slate-700">{brand.productCount.toLocaleString()}</span></td>
                  <td><Badge variant={brand.status === 'active' ? 'success' : 'neutral'} dot>{brand.status}</Badge></td>
                  <td><span className="text-xs text-slate-400">{brand.createdAt.split('T')[0]}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon"><Edit size={14} /></button>
                      <button className="btn-icon text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Brand"
        footer={<><button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Create</button></>}
      >
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand Name *</label><input className="input" placeholder="e.g. Samsung" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Slug</label><input className="input" placeholder="auto-generated" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Logo URL</label><input className="input" placeholder="https://..." /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label><textarea className="input" rows={3} placeholder="Brand description..." /></div>
        </div>
      </Modal>
    </div>
  )
}
