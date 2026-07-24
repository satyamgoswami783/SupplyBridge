import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, PlayCircle, CheckCircle2, XCircle, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockSyncChartData } from '../../data/mockData'

export const InventorySync: React.FC = () => {
  const [syncing, setSyncing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSyncNow = () => {
    setSyncing(true)
    showNotification('Inventory sync initialized for all suppliers...')
    setTimeout(() => {
      setSyncing(false)
      showNotification('Inventory synchronization completed! 342 stock levels updated.')
    }, 2000)
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Inventory Synchronization"
        subtitle="Manage stock levels, automated supplier feeds, and store stock adjustments"
        actions={
          <button className="btn-primary flex items-center gap-1.5" disabled={syncing} onClick={handleSyncNow}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing Stock...' : 'Sync All Inventory Now'}
          </button>
        }
      />

      {/* Status KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Last Full Sync', value: '28 min ago', color: 'text-slate-700', sub: 'PrimeSupply Corp' },
          { label: 'Pending Updates', value: '342', color: 'text-amber-600', sub: 'across 3 suppliers' },
          { label: 'Sync Success Rate', value: '98.4%', color: 'text-emerald-600', sub: 'last 24 hours' },
          { label: 'Failed Updates', value: '23', color: 'text-rose-600', sub: '5 retrying' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Inventory Status & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Supplier Sync Progress</h3>
          <div className="space-y-4">
            {[
              { name: 'TechParts International', products: 18420, pending: 0, progress: 100, status: 'healthy' as const, lastSync: '4 min ago' },
              { name: 'GlobalSource Limited',    products: 14800, pending: 120, progress: 68, status: 'degraded' as const, lastSync: '2 hr ago' },
              { name: 'PrimeSupply Corp',        products: 11200, pending: 0,   progress: 100, status: 'healthy' as const, lastSync: '28 min ago' },
              { name: 'AcmeDistributors',        products: 9800, pending: 222,  progress: 23, status: 'critical' as const, lastSync: '6 hr ago' },
              { name: 'QuickShip LLC',           products: 7300, pending: 0,    progress: 100, status: 'healthy' as const, lastSync: '5 min ago' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{s.name}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2 font-mono">{s.lastSync}</span>
                  </div>
                  <ProgressBar value={s.progress} color={s.progress === 100 ? 'emerald' : s.progress > 50 ? 'primary' : 'rose'} />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-2xs text-slate-400">{s.products.toLocaleString()} products</span>
                    {s.pending > 0 && <span className="text-2xs text-amber-600 font-semibold">{s.pending} pending</span>}
                  </div>
                </div>
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : s.status === 'degraded' ? 'Lag' : 'Error'} />
              </div>
            ))}
          </div>
        </div>

        {/* Sync Timeline Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Inventory Updates — 7 Day Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockSyncChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="inventory" name="Updates" stroke="#4f46e5" strokeWidth={2} fill="url(#invGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Inventory Changes */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Inventory Changes Log</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Change</th>
                <th>Old Stock</th>
                <th>New Stock</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'AMD X570 ATX Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', change: +45, old: 75, new: 120, ok: true },
                { name: 'DDR5 32GB 6000MHz Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', change: -30, old: 325, new: 295, ok: true },
                { name: 'Samsung 980 Pro 2TB SSD', sku: 'SSD-980P-001', supplier: 'GlobalSource', change: -15, old: 195, new: 180, ok: true },
                { name: 'Logitech MX Master 3S', sku: 'MOUSE-MX3S', supplier: 'GlobalSource', change: 0, old: 82, new: 82, ok: false },
                { name: 'Industrial Fan 12V 120mm', sku: 'ACME-IF-120', supplier: 'Acme', change: +200, old: 0, new: 200, ok: true },
              ].map((row, i) => (
                <tr key={i}>
                  <td><span className="font-medium text-slate-800 text-sm">{row.name}</span></td>
                  <td><code className="mono">{row.sku}</code></td>
                  <td><span className="text-xs text-slate-500">{row.supplier}</span></td>
                  <td>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${row.change > 0 ? 'text-emerald-600' : row.change < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {row.change > 0 ? <TrendingUp size={13} /> : row.change < 0 ? <TrendingDown size={13} /> : '→'}
                      {row.change > 0 ? '+' : ''}{row.change}
                    </span>
                  </td>
                  <td><span className="text-slate-600">{row.old}</span></td>
                  <td><span className="font-semibold text-slate-800">{row.new}</span></td>
                  <td><Badge variant={row.ok ? 'success' : 'warning'}>{row.ok ? 'Synced' : 'Pending'}</Badge></td>
                  <td><span className="text-xs text-slate-400 font-mono">Just now</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
