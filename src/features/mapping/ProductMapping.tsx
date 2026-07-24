import React, { useState } from 'react'
import { ArrowLeftRight, Link2, CheckCircle2, AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'

const MOCK_PRODUCT_MAPPINGS = [
  { id: '1', supplierSku: 'ASUS-ROG-X570-E', supplierName: 'TechParts Int.', masterSku: 'MB-X570-001', masterName: 'AMD X570 ATX Gaming Motherboard', status: 'mapped', confidence: 98 },
  { id: '2', supplierSku: 'CMK32GX5M2B6000C36', supplierName: 'TechParts Int.', masterSku: 'RAM-DDR5-001', masterName: 'DDR5 32GB 6000MHz Gaming RAM Kit', status: 'mapped', confidence: 99 },
  { id: '3', supplierSku: 'ASUS-TUF-4090-OC', supplierName: 'TechParts Int.', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
  { id: '4', supplierSku: 'MZ-V8P2T0B/AM', supplierName: 'GlobalSource Ltd.', masterSku: 'SSD-980P-001', masterName: 'Samsung 980 Pro 2TB NVMe SSD', status: 'mapped', confidence: 96 },
  { id: '5', supplierSku: 'LOG-MX-M3S-GR', supplierName: 'GlobalSource Ltd.', masterSku: 'MOUSE-MX3S-001', masterName: '', status: 'review', confidence: 72 },
  { id: '6', supplierSku: 'ACME-CMK-50-BLK', supplierName: 'AcmeDistributors', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
]

const MOCK_CATEGORY_MAPPINGS = [
  { id: '1', supplierCategory: 'PC Components > Boards', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Motherboards', status: 'mapped' },
  { id: '2', supplierCategory: 'Memory & Storage > RAM', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Memory (RAM)', status: 'mapped' },
  { id: '3', supplierCategory: 'Peripherals > Input Devices', supplierName: 'GlobalSource Ltd.', masterCategory: 'Electronics > Peripherals', status: 'mapped' },
  { id: '4', supplierCategory: 'Industrial > Cooling', supplierName: 'AcmeDistributors', masterCategory: '', status: 'unmapped' },
]

export const ProductMapping: React.FC = () => {
  const [activeMapping, setActiveMapping] = useState('products')
  const [search, setSearch] = useState('')

  const tabs = [
    { id: 'products',   label: 'Product Mapping',  count: 6 },
    { id: 'categories', label: 'Category Mapping',  count: 4 },
    { id: 'variants',   label: 'Variant Mapping',   count: 12 },
    { id: 'attributes', label: 'Attribute Mapping', count: 24 },
    { id: 'images',     label: 'Image Mapping',     count: 8 },
    { id: 'supplier',   label: 'Supplier Mapping',  count: 8 },
  ]

  return (
    <div>
      <SectionHeader
        title="Product Mapping"
        subtitle="Map supplier data to master catalog — SKUs, categories, variants, and attributes"
        actions={
          <>
            <button className="btn-secondary btn-sm"><RefreshCw size={14} /> Auto-Map</button>
            <button className="btn-primary btn-sm"><Plus size={14} /> Add Mapping</button>
          </>
        }
      />

      {/* Mapping Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Mappings', value: '54', color: 'text-slate-800' },
          { label: 'Mapped',         value: '41', color: 'text-emerald-600' },
          { label: 'Unmapped',       value: '9',  color: 'text-rose-600' },
          { label: 'Needs Review',   value: '4',  color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={activeMapping} onChange={setActiveMapping} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search mappings...">
        <select className="select input-sm w-auto min-w-[130px]">
          <option>All Suppliers</option>
          <option>TechParts International</option>
          <option>GlobalSource Limited</option>
          <option>AcmeDistributors</option>
        </select>
        <select className="select input-sm w-auto min-w-[130px]">
          <option>All Status</option>
          <option>Mapped</option>
          <option>Unmapped</option>
          <option>Needs Review</option>
        </select>
      </FilterBar>

      {activeMapping === 'products' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier SKU</th>
                  <th>Supplier</th>
                  <th></th>
                  <th>Master SKU</th>
                  <th>Master Product</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCT_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td><code className="mono">{m.supplierSku}</code></td>
                    <td><span className="text-xs text-slate-500">{m.supplierName}</span></td>
                    <td className="text-center"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                    <td>{m.masterSku ? <code className="mono">{m.masterSku}</code> : <span className="text-slate-300 text-xs">Not mapped</span>}</td>
                    <td><span className="text-sm text-slate-700 max-w-[200px] truncate block">{m.masterName || '—'}</span></td>
                    <td>
                      {m.confidence > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${m.confidence > 90 ? 'bg-emerald-500' : m.confidence > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.confidence}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{m.confidence}%</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant={m.status === 'mapped' ? 'success' : m.status === 'review' ? 'warning' : 'danger'}>
                        {m.status}
                      </Badge>
                    </td>
                    <td>
                      <button className={m.status === 'unmapped' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
                        {m.status === 'unmapped' ? 'Map Now' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeMapping === 'categories' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier Category</th>
                  <th>Supplier</th>
                  <th></th>
                  <th>Master Category</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CATEGORY_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td><span className="text-sm text-slate-700">{m.supplierCategory}</span></td>
                    <td><span className="text-xs text-slate-500">{m.supplierName}</span></td>
                    <td className="text-center"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                    <td><span className="text-sm text-slate-700">{m.masterCategory || <span className="text-slate-300">Not mapped</span>}</span></td>
                    <td><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td><button className={m.status === 'unmapped' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{m.status === 'unmapped' ? 'Map Now' : 'Edit'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeMapping === 'variants' || activeMapping === 'attributes' || activeMapping === 'images' || activeMapping === 'supplier') && (
        <div className="card p-12 text-center">
          <Link2 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {activeMapping.charAt(0).toUpperCase() + activeMapping.slice(1)} mapping — showing {tabs.find(t => t.id === activeMapping)?.count} entries
          </p>
          <p className="text-xs text-slate-400 mt-1">Switch to products or categories tab to see full table examples</p>
        </div>
      )}
    </div>
  )
}
