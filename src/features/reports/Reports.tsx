import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed']

const supplierData = [
  { name: 'TechParts Int.', products: 18420, synced: 18420, errors: 0 },
  { name: 'GlobalSource',    products: 14800, synced: 14600, errors: 200 },
  { name: 'PrimeSup Corp',   products: 11200, synced: 11200, errors: 0 },
  { name: 'AcmeDist.',       products: 9800,  synced: 9200,  errors: 600 },
  { name: 'QuickShip',       products: 7300,  synced: 7300,  errors: 0 },
]

const syncTrend = [
  { month: 'Feb', success: 98.2, failed: 1.8 },
  { month: 'Mar', success: 97.8, failed: 2.2 },
  { month: 'Apr', success: 99.1, failed: 0.9 },
  { month: 'May', success: 98.7, failed: 1.3 },
  { month: 'Jun', success: 99.3, failed: 0.7 },
  { month: 'Jul', success: 98.4, failed: 1.6 },
]

const catalogPie = [
  { name: 'Electronics', value: 45200 },
  { name: 'Home & Garden', value: 12300 },
  { name: 'Sporting Goods', value: 8900 },
  { name: 'Industrial', value: 6200 },
  { name: 'Other', value: 11729 },
]

export const Reports: React.FC = () => {
  const [tab, setTab] = useState('supplier')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Real File Download Handlers ---
  const handleExportPDF = () => {
    showNotification('Generating PDF report...')

    const fileName = `SupplyBridge_Operational_Report_${dateRange.replace(/\s+/g, '_')}.pdf`
    const reportContent = `
============================================================
      SUPPLYBRIDGE ENTERPRISE PIM - OPERATIONAL REPORT
============================================================
Report Generated: ${new Date().toLocaleString()}
Selected Date Range: ${dateRange}
Report Section: ${tab.toUpperCase()}

1. EXECUTIVE SUMMARY & KPIS
------------------------------------------------------------
• Total Suppliers: 27 (+3 this month)
• Active Connections: 23 (+2 this month)
• Total Catalog Products: 84,329 (+1.2K this week)
• Avg Sync Duration: 28 min (-4 min improved)

2. SUPPLIER PRODUCT & ERROR BREAKDOWN
------------------------------------------------------------
${supplierData.map(s => `• ${s.name.padEnd(20)} | Products: ${s.products.toLocaleString().padStart(6)} | Synced: ${s.synced.toLocaleString().padStart(6)} | Errors: ${s.errors}`).join('\n')}

3. HISTORICAL SYNC SUCCESS RATE (LAST 6 MONTHS)
------------------------------------------------------------
${syncTrend.map(t => `• Month ${t.month}: ${t.success}% Success Rate (${t.failed}% Failures)`).join('\n')}

4. CATALOG HEALTH METRICS
------------------------------------------------------------
• Products With High-Res Images: 97.2%
• Products With Full Description: 91.5%
• Mapped To Category Tree: 99.1%
• Products With Retail Pricing: 98.8%
• Storefront Published: 98.1%

============================================================
Confidential - SupplyBridge PIM Enterprise Platform
============================================================
`

    const blob = new Blob([reportContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => {
      showNotification(`File "${fileName}" downloaded to your browser Downloads folder!`)
    }, 500)
  }

  const handleExportCSV = () => {
    showNotification('Generating CSV export file...')

    const fileName = `SupplyBridge_Supplier_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`
    const csvHeaders = 'Supplier Name,Total Products,Synced SKUs,Feed Errors,Sync Health Status\n'
    const csvRows = supplierData
      .map(s => `"${s.name}",${s.products},${s.synced},${s.errors},"${s.errors === 0 ? 'Healthy' : 'Degraded'}"`)
      .join('\n')

    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => {
      showNotification(`File "${fileName}" downloaded to your browser Downloads folder!`)
    }, 500)
  }

  const tabs = [
    { id: 'supplier',  label: 'Supplier Reports' },
    { id: 'catalog',   label: 'Catalog Reports' },
    { id: 'inventory', label: 'Inventory Reports' },
    { id: 'sync',      label: 'Sync Performance' },
    { id: 'validation',label: 'Validation Audit' },
  ]

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
        title="Operational Analytics & Reports"
        subtitle="Comprehensive data insights across supplier feeds, catalog health, and sync performance"
        actions={
          <>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={dateRange}
                onChange={e => {
                  setDateRange(e.target.value)
                  showNotification(`Date range changed to ${e.target.value}`)
                }}
                className="text-sm text-slate-700 bg-transparent outline-none cursor-pointer font-medium"
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              className="btn-secondary btn-sm flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
              title="Download PDF Operational Report"
            >
              <FileText size={14} className="text-rose-600" /> Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
              title="Download CSV Supplier Data"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
            </button>
          </>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'supplier' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Suppliers', value: '27', delta: '+3 this month', up: true },
              { label: 'Active Connections', value: '23', delta: '+2 this month', up: true },
              { label: 'Total Products', value: '84,329', delta: '+1.2K this week', up: true },
              { label: 'Avg Sync Duration', value: '28 min', delta: '-4 min improved', up: true },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <TrendingUp size={10} /> {s.delta}
                </p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Products & Error Breakdown per Supplier</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={supplierData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="synced" name="Synced SKUs" fill="#10b981" radius={[4,4,0,0]} stackId="a" />
                <Bar dataKey="errors" name="Feed Errors" fill="#f43f5e" radius={[4,4,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'sync' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Sync Success Rate (%) — Last 6 Months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={syncTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[95, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="success" name="Success Rate %" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Products by Category Share</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catalogPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {catalogPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => (v as number).toLocaleString()} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Catalog Quality Metrics</h3>
            <div className="space-y-3">
              {[
                { label: 'Products With High-Res Images', pct: 97.2, color: 'bg-emerald-500' },
                { label: 'Products With Full Description', pct: 91.5, color: 'bg-indigo-500' },
                { label: 'Mapped To Category Tree', pct: 99.1, color: 'bg-emerald-500' },
                { label: 'Products With Retail Pricing', pct: 98.8, color: 'bg-emerald-500' },
                { label: 'Storefront Published', pct: 98.1, color: 'bg-emerald-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-slate-600 font-medium">{s.label}</span>
                    <span className="font-semibold text-slate-800">{s.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(tab === 'inventory' || tab === 'validation') && (
        <div className="card p-12 text-center">
          <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-semibold capitalize">{tab} Analytics Report</p>
          <p className="text-xs text-slate-400 mt-1">Data metrics loaded for selected date range: {dateRange}</p>
        </div>
      )}
    </div>
  )
}
