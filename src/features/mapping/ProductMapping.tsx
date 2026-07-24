import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowLeftRight, Link2, CheckCircle2, AlertCircle, Plus, RefreshCw, Layers, Truck, Image, Tag, Package } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'

const MOCK_PRODUCT_MAPPINGS = [
  { id: '1', supplierSku: 'ASUS-ROG-X570-E', supplierName: 'TechParts Int.', masterSku: 'MB-X570-001', masterName: 'AMD X570 ATX Gaming Motherboard', status: 'mapped', confidence: 98 },
  { id: '2', supplierSku: 'CMK32GX5M2B6000C36', supplierName: 'TechParts Int.', masterSku: 'RAM-DDR5-001', masterName: 'DDR5 32GB 6000MHz Gaming RAM Kit', status: 'mapped', confidence: 99 },
  { id: '3', supplierSku: 'ASUS-TUF-4090-OC', supplierName: 'TechParts Int.', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
  { id: '4', supplierSku: 'MZ-V8P2T0B/AM', supplierName: 'GlobalSource Ltd.', masterSku: 'SSD-980P-001', masterName: 'Samsung 980 Pro 2TB NVMe SSD', status: 'mapped', confidence: 96 },
  { id: '5', supplierSku: 'LOG-MX-M3S-GR', supplierName: 'GlobalSource Ltd.', masterSku: 'MOUSE-MX3S-001', masterName: 'Logitech MX Master 3S Wireless', status: 'review', confidence: 72 },
  { id: '6', supplierSku: 'ACME-CMK-50-BLK', supplierName: 'AcmeDistributors', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
]

const MOCK_CATEGORY_MAPPINGS = [
  { id: '1', supplierCategory: 'PC Components > Boards', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Motherboards', status: 'mapped' },
  { id: '2', supplierCategory: 'Memory & Storage > RAM', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Memory (RAM)', status: 'mapped' },
  { id: '3', supplierCategory: 'Peripherals > Input Devices', supplierName: 'GlobalSource Ltd.', masterCategory: 'Electronics > Peripherals', status: 'mapped' },
  { id: '4', supplierCategory: 'Industrial > Cooling', supplierName: 'AcmeDistributors', masterCategory: '', status: 'unmapped' },
]

const MOCK_SUPPLIER_MAPPINGS = [
  { id: '1', supplierName: 'TechParts International', code: 'TP-INT-01', type: 'REST API', mappedFields: 34, totalFields: 36, syncFreq: 'Every 6 Hours', status: 'mapped' },
  { id: '2', supplierName: 'GlobalSource Limited', code: 'GS-LTD-02', type: 'SFTP (CSV)', mappedFields: 28, totalFields: 30, syncFreq: 'Every 12 Hours', status: 'mapped' },
  { id: '3', supplierName: 'AcmeDistributors', code: 'ACME-03', type: 'FTP (XML)', mappedFields: 18, totalFields: 25, syncFreq: 'Daily Midnight', status: 'review' },
  { id: '4', supplierName: 'QuickShip Supply Co.', code: 'QS-SUP-04', type: 'Excel Upload', mappedFields: 0, totalFields: 24, syncFreq: 'Manual Upload', status: 'unmapped' },
]

const MOCK_VARIANT_MAPPINGS = [
  { id: '1', supplierOption: 'Color: Matte Black', supplierName: 'TechParts Int.', masterAttribute: 'Color: Midnight Black', status: 'mapped', confidence: 95 },
  { id: '2', supplierOption: 'Size: 32GB Kit (2x16GB)', supplierName: 'TechParts Int.', masterAttribute: 'Capacity: 32GB (2x16GB)', status: 'mapped', confidence: 99 },
  { id: '3', supplierOption: 'Storage: 2000GB SSD', supplierName: 'GlobalSource Ltd.', masterAttribute: 'Capacity: 2TB', status: 'mapped', confidence: 94 },
  { id: '4', supplierOption: 'Color: Space Gray', supplierName: 'GlobalSource Ltd.', masterAttribute: '', status: 'unmapped', confidence: 0 },
]

export const ProductMapping: React.FC = () => {
  const location = useLocation()
  const [activeMapping, setActiveMapping] = useState('products')
  const [search, setSearch] = useState('')

  // Sync tab with URL route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('categories')) setActiveMapping('categories')
    else if (path.includes('variants')) setActiveMapping('variants')
    else if (path.includes('suppliers')) setActiveMapping('supplier')
    else setActiveMapping('products')
  }, [location.pathname])

  const tabs = [
    { id: 'products',   label: 'Product Mapping',  count: 6 },
    { id: 'categories', label: 'Category Mapping',  count: 4 },
    { id: 'variants',   label: 'Variant Mapping',   count: 4 },
    { id: 'supplier',   label: 'Supplier Mapping',  count: 4 },
  ]

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Product & Supplier Mapping"
        subtitle="Map supplier catalog structures, SKUs, categories, and attributes to master platform schemas"
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm"><RefreshCw size={14} /> Auto-Map Rules</button>
            <button className="btn-primary btn-sm"><Plus size={14} /> Add Mapping Rule</button>
          </div>
        }
      />

      {/* Compact Mapping KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Mappings', value: '54', color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Mapped & Verified', value: '41', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Unmapped Items',   value: '9',  color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Needs Review',     value: '4',  color: 'text-amber-600 dark:text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-2.5 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-2xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={activeMapping} onChange={setActiveMapping} />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search SKUs, categories, or suppliers...">
        <select className="select input-sm w-auto min-w-[140px]">
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

      {/* Product Mapping Table */}
      {activeMapping === 'products' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier SKU</th>
                  <th>Supplier</th>
                  <th className="text-center">Link</th>
                  <th>Master SKU</th>
                  <th>Master Product</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCT_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td><code className="mono">{m.supplierSku}</code></td>
                    <td><span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{m.supplierName}</span></td>
                    <td className="text-center"><ArrowLeftRight size={14} className="text-primary-500 mx-auto opacity-70" /></td>
                    <td>{m.masterSku ? <code className="mono">{m.masterSku}</code> : <span className="text-slate-400 text-xs italic">Not mapped</span>}</td>
                    <td><span className="text-xs text-slate-800 dark:text-slate-200 font-semibold max-w-[240px] truncate block">{m.masterName || '—'}</span></td>
                    <td>
                      {m.confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${m.confidence > 90 ? 'bg-emerald-500' : m.confidence > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.confidence}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{m.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-2xs text-slate-400">0%</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={m.status === 'mapped' ? 'success' : m.status === 'review' ? 'warning' : 'danger'}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="text-right">
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

      {/* Category Mapping Table */}
      {activeMapping === 'categories' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier Category Taxonomy</th>
                  <th>Supplier</th>
                  <th className="text-center">Link</th>
                  <th>Master PIM Category</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CATEGORY_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.supplierCategory}</span></td>
                    <td><span className="text-xs text-slate-500">{m.supplierName}</span></td>
                    <td className="text-center"><ArrowLeftRight size={14} className="text-primary-500 mx-auto opacity-70" /></td>
                    <td><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.masterCategory || <span className="text-slate-400 italic">Not mapped</span>}</span></td>
                    <td><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td className="text-right"><button className={m.status === 'unmapped' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{m.status === 'unmapped' ? 'Map Now' : 'Edit'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Mapping Table */}
      {activeMapping === 'supplier' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier Partner</th>
                  <th>Supplier Code</th>
                  <th>Integration Protocol</th>
                  <th>Mapped Fields</th>
                  <th>Sync Frequency</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUPPLIER_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 font-bold text-xs">
                          {m.supplierName.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{m.supplierName}</span>
                      </div>
                    </td>
                    <td><code className="mono">{m.code}</code></td>
                    <td><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{m.type}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(m.mappedFields / m.totalFields) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{m.mappedFields}/{m.totalFields}</span>
                      </div>
                    </td>
                    <td><span className="text-xs text-slate-500">{m.syncFreq}</span></td>
                    <td>
                      <Badge variant={m.status === 'mapped' ? 'success' : m.status === 'review' ? 'warning' : 'danger'}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <button className="btn-secondary btn-sm">Configure Field Map</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Variant Mapping Table */}
      {activeMapping === 'variants' && (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier Option / Attribute</th>
                  <th>Supplier</th>
                  <th className="text-center">Link</th>
                  <th>Master Variant Schema</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_VARIANT_MAPPINGS.map(m => (
                  <tr key={m.id}>
                    <td><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.supplierOption}</span></td>
                    <td><span className="text-xs text-slate-500">{m.supplierName}</span></td>
                    <td className="text-center"><ArrowLeftRight size={14} className="text-primary-500 mx-auto opacity-70" /></td>
                    <td><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.masterAttribute || <span className="text-slate-400 italic">Not mapped</span>}</span></td>
                    <td>
                      {m.confidence > 0 ? (
                        <span className="text-xs text-emerald-600 font-bold">{m.confidence}%</span>
                      ) : (
                        <span className="text-2xs text-slate-400">0%</span>
                      )}
                    </td>
                    <td><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td className="text-right"><button className={m.status === 'unmapped' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>{m.status === 'unmapped' ? 'Map Variant' : 'Edit'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
