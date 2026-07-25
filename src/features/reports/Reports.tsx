import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, CheckCircle2, FileSpreadsheet, FileText, Package, RefreshCw, AlertTriangle, ShieldCheck, Truck, Database, ChevronDown } from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed']

const supplierData = [
  { name: 'TechParts Int.', type: 'REST API', products: 18420, synced: 18420, errors: 0, passRate: 100, uptime: '99.9%' },
  { name: 'GlobalSource',    type: 'SFTP (CSV)', products: 14800, synced: 14600, errors: 200, passRate: 98.6, uptime: '99.5%' },
  { name: 'PrimeSup Corp',   type: 'FTP (XML)', products: 11200, synced: 11200, errors: 0, passRate: 100, uptime: '99.8%' },
  { name: 'AcmeDist.',       type: 'Excel Upload', products: 9800,  synced: 9200,  errors: 600, passRate: 93.8, uptime: '94.2%' },
  { name: 'QuickShip Co.',   type: 'REST API', products: 7300,  synced: 7300,  errors: 0, passRate: 100, uptime: '99.9%' },
]

const syncTrend = [
  { month: 'Feb', success: 98.2, failed: 1.8, durationMin: 34 },
  { month: 'Mar', success: 97.8, failed: 2.2, durationMin: 32 },
  { month: 'Apr', success: 99.1, failed: 0.9, durationMin: 30 },
  { month: 'May', success: 98.7, failed: 1.3, durationMin: 29 },
  { month: 'Jun', success: 99.3, failed: 0.7, durationMin: 28 },
  { month: 'Jul', success: 98.4, failed: 1.6, durationMin: 27 },
]

const catalogPie = [
  { name: 'Electronics', value: 45200 },
  { name: 'Home & Garden', value: 12300 },
  { name: 'Sporting Goods', value: 8900 },
  { name: 'Industrial', value: 6200 },
  { name: 'Other', value: 11729 },
]

const validationErrorsPie = [
  { name: 'Missing Price', value: 42 },
  { name: 'Duplicate SKU', value: 28 },
  { name: 'Missing Image', value: 18 },
  { name: 'Invalid Category', value: 12 },
]

export const Reports: React.FC = () => {
  const [tab, setTab] = useState('supplier')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Real File Exporters ---
  const handleExportPDF = () => {
    showNotification('Generating PDF report...')

    const htmlContent = `
      <html>
        <head>
          <title>SupplyBridge_Operational_Report_${dateRange.replace(/\s+/g, '_')}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
              font-weight: 600;
            }
            .meta {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 8px;
            }
            h2 {
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 25px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            ul {
              padding-left: 20px;
              margin: 10px 0;
            }
            li {
              margin-bottom: 6px;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #475569;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">SUPPLYBRIDGE ENTERPRISE PIM</h1>
            <div class="subtitle">Operational Analytics & Reports - ${dateRange}</div>
            <div class="meta">Generated: ${new Date().toLocaleString()} | Report Tab: ${tab.toUpperCase()}</div>
          </div>

          <h2>1. Executive Summary & KPIs</h2>
          <ul>
            <li><strong>Total Configured Suppliers:</strong> 27 Partners</li>
            <li><strong>Active API/FTP Connections:</strong> 23 Connections</li>
            <li><strong>Total Catalog Products:</strong> 84,329 SKUs</li>
            <li><strong>Overall Sync Health:</strong> 99.8% Operational</li>
          </ul>

          <h2>2. Supplier Performance & Feed Pass Rates</h2>
          <table>
            <thead>
              <tr>
                <th>Supplier Partner</th>
                <th>Protocol / Connection Type</th>
                <th>Total SKUs</th>
                <th>Synced SKUs</th>
                <th>Validation Pass %</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              ${supplierData.map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.type}</td>
                  <td>${s.products.toLocaleString()}</td>
                  <td>${s.synced.toLocaleString()}</td>
                  <td>${s.passRate}%</td>
                  <td>${s.uptime}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>3. Historical Sync Trends (Last 6 Months)</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Success Rate %</th>
                <th>Failed Rate %</th>
                <th>Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              ${syncTrend.map(t => `
                <tr>
                  <td>${t.month}</td>
                  <td>${t.success}%</td>
                  <td>${t.failed}%</td>
                  <td>${t.durationMin} mins</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>4. PIM Catalog Quality & Completeness Index</h2>
          <ul>
            <li><strong>Products With High-Res Images:</strong> 97.2%</li>
            <li><strong>Products With Full Descriptions:</strong> 91.5%</li>
            <li><strong>Category Taxonomy Mapped:</strong> 99.1%</li>
            <li><strong>Retail & MAP Pricing Set:</strong> 98.8%</li>
            <li><strong>Shift4Shop Storefront Published:</strong> 98.1%</li>
          </ul>

          <div class="footer">
            Confidential - SupplyBridge Enterprise PIM & Middleware Platform
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            }
          </script>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (!printWindow) {
      showNotification('Pop-up blocker active! Please allow pop-ups to export PDF.')
      return
    }

    // Revoke the blob URL after 5 seconds to free resources
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 5000)
  }

  const handleExportCSV = () => {
    showNotification('Generating CSV export file...')

    const fileName = `SupplyBridge_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`
    const csvHeaders = 'Supplier Partner,Connection Type,Total Products,Synced SKUs,Feed Errors,Validation Pass Rate %,Uptime %\n'
    const csvRows = supplierData
      .map(s => `"${s.name}","${s.type}",${s.products},${s.synced},${s.errors},${s.passRate},"${s.uptime}"`)
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
    { id: 'supplier',  label: 'Supplier Performance' },
    { id: 'catalog',   label: 'Catalog & PIM Quality' },
    { id: 'inventory', label: 'Inventory Buffer' },
    { id: 'sync',      label: 'Sync Pipeline' },
    { id: 'validation',label: 'Validation Audit' },
  ]

  return (
    <div className="space-y-6">
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
        title="Operational Analytics & Reports"
        subtitle="Comprehensive operational reports across supplier feeds, PIM catalog health, inventory buffers, and Shift4Shop sync throughput"
        actions={
          <div className="flex items-center gap-2">
            {/* Custom Styled Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm cursor-pointer select-none"
              >
                <Calendar size={14} className="text-slate-400" />
                <span>{dateRange}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 sm:left-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-30"
                  >
                    <div className="p-1 space-y-0.5">
                      {[
                        'Last 7 days',
                        'Last 30 days',
                        'Last 90 days',
                        'Year to Date'
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setDateRange(option)
                            setIsDropdownOpen(false)
                            showNotification(`Date range changed to ${option}`)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            dateRange === option
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleExportPDF}
              className="btn-secondary btn-sm flex items-center gap-1.5 shadow-sm"
              title="Download PDF Operational Report"
            >
              <FileText size={14} className="text-rose-600 dark:text-rose-400" /> Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 shadow-sm"
              title="Download CSV Analytics File"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
          </div>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* 1. SUPPLIER REPORTS TAB */}
      {tab === 'supplier' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Configured Suppliers', value: '27', delta: '+3 this month', up: true },
              { label: 'Active Connections', value: '23', delta: '+2 this month', up: true },
              { label: 'Total Catalog SKUs', value: '84,329', delta: '+1.2K this week', up: true },
              { label: 'Avg Feed Parse Duration', value: '27 min', delta: '-4 min improved', up: true },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 font-bold ${s.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  <TrendingUp size={10} /> {s.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Supplier Products & Error Rate Breakdown</h3>
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

          {/* Supplier Performance Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Supplier Feed Performance Index</h3>
              <span className="text-2xs text-slate-400 font-semibold">{dateRange}</span>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Supplier Partner</th>
                    <th>Protocol</th>
                    <th>Total SKUs</th>
                    <th>Synced SKUs</th>
                    <th>Validation Pass %</th>
                    <th>Connection Uptime</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierData.map(s => (
                    <tr key={s.name}>
                      <td className="font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td><span className="text-2xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{s.type}</span></td>
                      <td className="font-semibold">{s.products.toLocaleString()}</td>
                      <td className="text-emerald-600 font-bold">{s.synced.toLocaleString()}</td>
                      <td className="font-bold text-slate-700 dark:text-slate-300">{s.passRate}%</td>
                      <td className="text-xs text-slate-500 font-medium">{s.uptime}</td>
                      <td>
                        <Badge variant={s.errors === 0 ? 'success' : 'warning'}>
                          {s.errors === 0 ? 'Optimal' : `${s.errors} Errors`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATALOG REPORTS TAB */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Master Catalog Category Share</h3>
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
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Catalog Quality & Completeness Index</h3>
              <div className="space-y-3.5">
                {[
                  { label: 'Products With High-Res Images', pct: 97.2, color: 'bg-emerald-500' },
                  { label: 'Products With Full Description', pct: 91.5, color: 'bg-indigo-500' },
                  { label: 'Mapped To Category Tree', pct: 99.1, color: 'bg-emerald-500' },
                  { label: 'Products With Retail Pricing', pct: 98.8, color: 'bg-emerald-500' },
                  { label: 'Shift4Shop Storefront Published', pct: 98.1, color: 'bg-cyan-500' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">{s.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INVENTORY REPORTS TAB */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'In-Stock SKUs', value: '78,420', color: 'text-emerald-600' },
              { label: 'Low Stock Threshold', value: '4,109', color: 'text-amber-600' },
              { label: 'Out of Stock', value: '1,800', color: 'text-rose-600' },
              { label: 'Reserved Stock', value: '12,450', color: 'text-primary-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Inventory Buffer & Stock Health Ratio</h3>
            <p className="text-xs text-slate-500 mb-4">Stock buffer maintained across 27 suppliers to prevent overselling on Shift4Shop storefronts.</p>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '85%' }} title="In-Stock (85%)" />
              <div className="bg-amber-500 h-full" style={{ width: '10%' }} title="Low-Stock (10%)" />
              <div className="bg-rose-500 h-full" style={{ width: '5%' }} title="Out-of-Stock (5%)" />
            </div>
            <div className="flex justify-between text-2xs text-slate-400 mt-2 font-bold uppercase">
              <span className="text-emerald-600">85% Healthy Stock</span>
              <span className="text-amber-600">10% Low Stock Alert</span>
              <span className="text-rose-600">5% Out of Stock</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SYNC PIPELINE TAB */}
      {tab === 'sync' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Sync Pipeline Success Rate (%) & Duration (Mins) — Last 6 Months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={syncTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[95, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="success" name="Sync Success Rate %" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. VALIDATION AUDIT TAB */}
      {tab === 'validation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Pre-Publish Validation Error Share</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={validationErrorsPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {validationErrorsPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Validation Audit Resolution Index</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Resolved & Approved Products</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">1,247 Items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-800 dark:text-amber-300">Pending Review Queue</span>
                <span className="font-black text-amber-700 dark:text-amber-400 text-sm">84 Items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-800 dark:text-rose-300">Rejected & Returned to Supplier</span>
                <span className="font-black text-rose-700 dark:text-rose-400 text-sm">12 Items</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
