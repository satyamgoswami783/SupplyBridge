import React, { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Plus, Edit } from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const priceChartData = [
  { sku: 'MB-X570', supplier: 245, cost: 245, retail: 299 },
  { sku: 'RAM-DDR5', supplier: 89, cost: 89, retail: 119 },
  { sku: 'SSD-980', supplier: 119, cost: 119, retail: 149 },
  { sku: 'GPU-4090', supplier: 1450, cost: 1450, retail: 1699 },
  { sku: 'CPU-7950', supplier: 520, cost: 520, retail: 649 },
]

export const PricingSync: React.FC = () => {
  const [search, setSearch] = useState('')

  return (
    <div>
      <SectionHeader
        title="Pricing Synchronization"
        subtitle="Manage pricing rules and synchronize prices from suppliers to stores"
        actions={
          <>
            <button className="btn-secondary btn-sm"><Plus size={14} /> Add Price Rule</button>
            <button className="btn-primary btn-sm"><RefreshCw size={14} /> Sync Prices Now</button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Margin', value: '22.4%', color: 'text-emerald-600', trend: '+1.2%' },
          { label: 'Pending Updates', value: '486', color: 'text-amber-600', trend: '' },
          { label: 'Price Rules', value: '12', color: 'text-primary-600', trend: '' },
          { label: 'Last Sync', value: '12 min ago', color: 'text-slate-700', trend: '' },
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
        {/* Price Rules */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-primary-600" /> Active Pricing Rules
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Electronics — Standard Markup',  formula: 'Cost × 1.22 + $5', applies: 'Electronics', products: 45200 },
              { name: 'Components — Volume Pricing',    formula: 'Cost × 1.18',      applies: 'PC Components', products: 18400 },
              { name: 'Accessories — High Margin',      formula: 'Cost × 1.35',      applies: 'Accessories', products: 8900 },
              { name: 'Industrial — Fixed Margin',      formula: 'Cost + 15%',       applies: 'Industrial', products: 6200 },
            ].map(rule => (
              <div key={rule.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{rule.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <code className="mono">{rule.formula}</code> · {rule.products.toLocaleString()} products
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="success">{rule.applies}</Badge>
                  <button className="btn-icon"><Edit size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Comparison Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Price Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priceChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sku" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${v as number}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="supplier" name="Supplier Price" fill="#06b6d4" radius={[4,4,0,0]} />
              <Bar dataKey="retail"   name="Retail Price"   fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price History Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Price Update History</h3>
        </div>
        <FilterBar search={search} onSearch={setSearch} placeholder="Search products..." />
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Product</th><th>SKU</th><th>Supplier</th><th>Old Price</th><th>New Price</th><th>Change</th><th>Margin</th><th>Status</th><th>Time</th></tr></thead>
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
                    <td><span className="text-xs text-slate-400">2 hr ago</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
