import React, { useState } from 'react'
import { Plus, Edit, Trash2, Tag, ChevronRight } from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockCategories } from '../../data/mockData'

export const Categories: React.FC = () => {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = mockCategories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SectionHeader
        title="Categories"
        subtitle={`${mockCategories.length} categories in master catalog`}
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Category</button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search categories..." />

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Tag size={13} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-400">{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {cat.parentId
                      ? <div className="flex items-center gap-1 text-xs text-slate-500"><ChevronRight size={12} />{mockCategories.find(c => c.id === cat.parentId)?.name}</div>
                      : <span className="text-xs text-slate-400">Root</span>
                    }
                  </td>
                  <td><span className="font-semibold text-slate-700">{cat.productCount.toLocaleString()}</span></td>
                  <td><Badge variant={cat.status === 'active' ? 'success' : 'neutral'} dot>{cat.status}</Badge></td>
                  <td><span className="text-xs text-slate-400">{cat.createdAt.split('T')[0]}</span></td>
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Category"
        footer={<><button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Create</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category Name *</label>
            <input className="input" placeholder="e.g. Motherboards" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Slug</label>
            <input className="input" placeholder="auto-generated" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Parent Category</label>
            <select className="select">
              <option value="">None (Root Category)</option>
              {mockCategories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label>
            <textarea className="input" rows={3} placeholder="Category description..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}
