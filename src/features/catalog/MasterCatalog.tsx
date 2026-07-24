import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, MoreVertical, Eye, Edit, CheckCircle2, XCircle, AlertTriangle, Package, ArrowUpRight } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { mockProducts } from '../../data/mockData'
import { statusToVariant, formatDateTime, timeAgo } from '../../utils'

import { useAuth } from '../../context/AuthContext'

export const MasterCatalog: React.FC = () => {
  const { role } = useAuth()
  const canManageCatalog = role === 'super_admin' || role === 'admin' || role === 'catalog_manager'
  const canDelete = role === 'super_admin' || role === 'admin'
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')

  const tabs = [
    { id: 'all', label: 'All Products', count: 84329 },
    { id: 'published', label: 'Published', count: 82770 },
    { id: 'validation_required', label: 'Needs Validation', count: 1247 },
    { id: 'draft', label: 'Draft', count: 200 },
    { id: 'failed', label: 'Failed', count: 312 },
  ]

  const filtered = mockProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || p.status === tab
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchTab && matchStatus
  })

  return (
    <div>
      <SectionHeader
        title="Master Catalog"
        subtitle="Single source of truth for all product data across suppliers and stores"
        actions={
          <>
            <button className="btn-secondary btn-sm"><Filter size={14} /> Filters</button>
            {canManageCatalog && <button className="btn-primary btn-sm"><Plus size={14} /> Add Product</button>}
          </>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: '84,329', color: 'text-slate-800' },
          { label: 'Published', value: '82,770', color: 'text-emerald-600' },
          { label: 'Pending', value: '1,247', color: 'text-amber-600' },
          { label: 'Failed', value: '312', color: 'text-rose-600' },
          { label: 'Suppliers', value: '27', color: 'text-primary-600' },
          { label: 'Stores', value: '7', color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search by name, SKU, brand...">
        <select className="select input-sm w-auto min-w-[130px]" value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
          <option value="all">All Suppliers</option>
          <option value="s1">TechParts International</option>
          <option value="s2">GlobalSource Limited</option>
          <option value="s3">PrimeSupply Corp</option>
        </select>
        <select className="select input-sm w-auto min-w-[120px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="validation_required">Needs Review</option>
          <option value="draft">Draft</option>
          <option value="failed">Failed</option>
        </select>
      </FilterBar>

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" className="rounded border-slate-300" />
        <span className="text-sm text-slate-500">Select all</span>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <button className="btn-ghost btn-sm text-emerald-600">Bulk Publish</button>
        <button className="btn-ghost btn-sm text-amber-600">Bulk Validate</button>
        <button className="btn-ghost btn-sm text-rose-600">Bulk Delete</button>
      </div>

      {/* Product Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Validation</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="cursor-pointer">
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {product.images.length > 0
                          ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover rounded-xl" />
                          : <Package size={16} className="text-slate-400" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm max-w-[200px] truncate">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.brand || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td><code className="mono">{product.sku}</code></td>
                  <td><span className="text-xs text-slate-600">{product.supplierName}</span></td>
                  <td><span className="text-xs text-slate-600">{product.categoryName || '—'}</span></td>
                  <td>
                    <span className="font-semibold text-slate-800">${product.pricing.retailPrice.toFixed(2)}</span>
                    <span className="text-xs text-emerald-600 ml-1">+{product.pricing.margin.toFixed(1)}%</span>
                  </td>
                  <td>
                    <Badge variant={statusToVariant(product.inventory.status)}>
                      {product.inventory.availableStock.toLocaleString()}
                    </Badge>
                  </td>
                  <td><Badge variant={statusToVariant(product.status)}>{product.status.replace(/_/g, ' ')}</Badge></td>
                  <td><Badge variant={statusToVariant(product.validationStatus)}>{product.validationStatus}</Badge></td>
                  <td><span className="text-xs text-slate-400">{timeAgo(product.updatedAt)}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn-icon"><Eye size={14} /></button>
                      <button className="btn-icon"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {filtered.length} of 84,329 products</p>
          <div className="flex items-center gap-2">
            <select className="select input-sm w-auto">
              <option>25 per page</option>
              <option>50 per page</option>
              <option>100 per page</option>
            </select>
            <div className="flex gap-1">
              {[1,2,3,'...',3373].map((p, i) => (
                <button key={i} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${p === 1 ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
