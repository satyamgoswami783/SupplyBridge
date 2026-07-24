import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Truck, Package, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Image, Briefcase, XCircle, PlayCircle,
  Globe, Wifi, Server, Database, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, Zap, RotateCcw,
  ShieldCheck, UserCheck
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { StatsCard, HealthIndicator, ConfirmDialog } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { mockDashboardMetrics, mockSyncChartData, mockProductsBySupplier, mockActivities } from '../../data/mockData'
import { formatNumber } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; subtitle: string; focus: string }> = {
  super_admin: {
    title: 'Super Admin Overview',
    subtitle: 'Complete platform control, system architecture health & full operational status',
    focus: 'Platform Control & Architecture Owner',
  },
  admin: {
    title: 'Business Operations Overview',
    subtitle: 'Daily platform administration, supplier inventory, pricing & catalog performance',
    focus: 'Business Administrator',
  },
  catalog_manager: {
    title: 'Catalog & PIM Dashboard',
    subtitle: 'Product information management, attribute mapping, and validation queue status',
    focus: 'PIM & Merchandising Manager',
  },
  integration_manager: {
    title: 'Supplier Integration Hub',
    subtitle: 'Supplier API connections, FTP file pipelines, import queues and sync jobs',
    focus: 'Supplier & Protocol Manager',
  },
  operations_staff: {
    title: 'Operations & Monitoring Console',
    subtitle: 'Real-time operational monitoring, validation review, failed sync retries & logs',
    focus: 'Operational Staff Specialist',
  },
}

const stagger = {
  parent: { transition: { staggerChildren: 0.06 } },
  child:  { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
}

const m = mockDashboardMetrics

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { role, currentUser } = useAuth()
  const roleInfo = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.super_admin
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Updated just now')

  // Quick Action Modal states
  const [manualSyncOpen, setManualSyncOpen] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState('TechParts International')
  const [selectedSyncType, setSelectedSyncType] = useState('Inventory Sync')
  const [syncLaunching, setSyncLaunching] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated('Updated just now')
    }, 600)
  }

  const handleLaunchSync = () => {
    setSyncLaunching(true)
    setTimeout(() => {
      setSyncLaunching(false)
      setManualSyncOpen(false)
      setSyncSuccessMsg(`Manual ${selectedSyncType} triggered successfully for ${selectedSupplier}!`)
      setTimeout(() => setSyncSuccessMsg(''), 4000)
    }, 600)
  }

  const handleConfirmRetryAll = () => {
    setRetryModalOpen(false)
    setSyncSuccessMsg('Re-queued all 17 failed sync jobs for immediate retry!')
    setTimeout(() => setSyncSuccessMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Role-Specific Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-primary-900/10 via-slate-900/5 to-transparent p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" dot>{roleInfo.focus}</Badge>
            <span className="text-2xs text-slate-400 font-semibold">• Logged in as {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{roleInfo.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{roleInfo.subtitle}</p>
        </div>

        {/* Header Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <HealthIndicator status="operational" label="All Systems" />

          {/* Trigger Manual Sync Button */}
          <button
            onClick={() => setManualSyncOpen(true)}
            className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Zap size={14} />
            <span>Trigger Manual Sync</span>
          </button>

          {/* Retry Failed Jobs Button */}
          <button
            onClick={() => setRetryModalOpen(true)}
            className="btn-secondary btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Retry Failed (17)</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
            title="Click to refresh dashboard metrics"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary-600' : 'text-slate-500'} />
            <span>{isRefreshing ? 'Refreshing...' : lastUpdated}</span>
          </button>
        </div>
      </div>

      {/* Instant Action Alert Banner */}
      {syncSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{syncSuccessMsg}</span>
        </motion.div>
      )}

      {/* Top KPI Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        variants={stagger.parent}
        initial="initial"
        animate="animate"
      >
        {[
          { label: 'Connected Suppliers', value: m.connectedSuppliers, icon: <Truck size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+2 this week', changeType: 'positive' as const, path: '/suppliers' },
          { label: 'Disconnected',        value: m.disconnectedSuppliers, icon: <Wifi size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '-1 resolved', changeType: 'positive' as const, path: '/suppliers' },
          { label: 'Total Products',      value: formatNumber(m.totalProducts), icon: <Package size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', change: '+1.2K today', changeType: 'positive' as const, path: '/mapping/products' },
          { label: 'Pending Validation',  value: m.pendingProducts, icon: <AlertTriangle size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', change: '-84 resolved', changeType: 'positive' as const, path: '/validation' },
          { label: 'Published Products',  value: formatNumber(m.publishedProducts), icon: <CheckCircle2 size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+982 today', changeType: 'positive' as const, path: '/sync/website' },
          { label: 'Failed Products',     value: m.failedProducts, icon: <XCircle size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '+12 today', changeType: 'negative' as const, path: '/import-queue' },
        ].map((item, i) => (
          <motion.div key={i} variants={stagger.child} transition={{ duration: 0.3 }}>
            <StatsCard {...item} onClick={() => navigate(item.path)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Sync Status + Jobs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sync Status */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <RefreshCw size={15} className="text-primary-600 dark:text-primary-400" /> Synchronization Status
          </p>
          <div className="space-y-3.5">
            {[
              { label: 'Inventory Sync', status: m.inventorySyncStatus, last: '4 min ago', icon: <RefreshCw size={14} />, path: '/sync/inventory' },
              { label: 'Pricing Sync',   status: m.pricingSyncStatus,   last: '12 min ago', icon: <DollarSign size={14} />, path: '/sync/pricing' },
              { label: 'Image Sync',     status: m.imageSyncStatus,     last: '2 hr ago', icon: <Image size={14} />, path: '/sync/images' },
            ].map(s => (
              <div
                key={s.label}
                onClick={() => navigate(s.path)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <span className="opacity-60">{s.icon}</span>
                  {s.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{s.last}</span>
                  <HealthIndicator status={s.status as any} label={s.status === 'healthy' ? 'Healthy' : s.status === 'degraded' ? 'Degraded' : 'Critical'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs Status */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Briefcase size={15} className="text-primary-600 dark:text-primary-400" /> Job Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Running',   value: m.runningJobs,   color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-50',    icon: <PlayCircle size={18} /> },
              { label: 'Queued',    value: m.queuedJobs,    color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50',   icon: <Clock size={18} /> },
              { label: 'Completed', value: m.completedJobs, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50', icon: <CheckCircle2 size={18} /> },
              { label: 'Failed',    value: m.failedJobs,    color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50',    icon: <XCircle size={18} /> },
            ].map(j => (
              <div
                key={j.label}
                onClick={() => navigate('/sync/jobs')}
                className={`${j.bg} rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <span className={j.color}>{j.icon}</span>
                <p className={`text-2xl font-bold ${j.color}`}>{j.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium">{j.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Server size={15} className="text-primary-600 dark:text-primary-400" /> System Status
          </p>
          <div className="space-y-3">
            {[
              { label: 'API Gateway',    status: m.apiStatus,    icon: <Wifi size={14} /> },
              { label: 'FTP Service',    status: m.ftpStatus,    icon: <Server size={14} /> },
              { label: 'Import Queue',   status: 'operational',  icon: <Database size={14} /> },
              { label: 'Stores Online',  status: m.storesSynced === m.totalStores ? 'operational' : 'degraded', icon: <Globe size={14} /> },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <span className="opacity-50">{s.icon}</span>
                  {s.label}
                </div>
                <HealthIndicator status={s.status as any} label={s.status === 'operational' ? 'OK' : 'Degraded'} />
              </div>
            ))}
            {/* Health bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-slate-500">Overall Health</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{m.systemHealth}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-emerald"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.systemHealth}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sync Jobs Area Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Synchronization Activity</p>
              <p className="text-xs text-slate-400">Last 8 days — jobs completed per day</p>
            </div>
            <Badge variant="primary" dot>Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockSyncChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colPri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colImg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="inventory" name="Inventory" stroke="#4f46e5" strokeWidth={2} fill="url(#colInv)" dot={false} />
              <Area type="monotone" dataKey="pricing"   name="Pricing"   stroke="#10b981" strokeWidth={2} fill="url(#colPri)" dot={false} />
              <Area type="monotone" dataKey="image"     name="Images"    stroke="#06b6d4" strokeWidth={2} fill="url(#colImg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Supplier Bar */}
        <div className="card p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Products by Supplier</p>
            <p className="text-xs text-slate-400">Top 6 suppliers by product count</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockProductsBySupplier} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={85} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="products" name="Products" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Activity + Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity size={15} className="text-primary-600 dark:text-primary-400" /> Recent Activity
            </p>
            <button
              onClick={() => navigate('/logs')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              View all logs →
            </button>
          </div>
          <div className="space-y-3">
            {mockActivities.map(act => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
                blue:    'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
                rose:    'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
                amber:   'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
                violet:  'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
              }
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[act.color]}`}>
                    <span className="text-xs">●</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{act.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Queue + Store Status */}
        <div className="space-y-4">
          {/* Import Queue */}
          <div
            onClick={() => navigate('/import-queue')}
            className="card p-5 cursor-pointer hover:shadow-card-md transition-all"
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Database size={15} className="text-primary-600 dark:text-primary-400" /> Import Queue
            </p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{m.queueSize}</div>
              <div className="flex-1">
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.queueSize / 500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{m.queueSize} items processing — queue capacity 500</p>
              </div>
            </div>
          </div>

          {/* Store Status */}
          <div
            onClick={() => navigate('/sync/website')}
            className="card p-5 cursor-pointer hover:shadow-card-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Globe size={15} className="text-primary-600 dark:text-primary-400" /> Store Status
              </p>
              <span className="text-xs text-slate-500">{m.storesSynced}/{m.totalStores} synced</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'US Store', ok: true }, { label: 'EU Store', ok: true },
                { label: 'TechHub', ok: true },  { label: 'UK Store', ok: true },
                { label: 'CA Store', ok: false }, { label: 'AutoParts', ok: true },
                { label: 'SportGear', ok: false },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-2 text-center ${s.ok ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-2xs font-medium text-slate-600 dark:text-slate-300 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Manual Sync Modal */}
      <Modal
        open={manualSyncOpen}
        onClose={() => setManualSyncOpen(false)}
        title="Trigger Manual Synchronization"
        subtitle="Manually launch an instant synchronization pipeline for a specific supplier"
        size="md"
        footer={
          <>
            <button onClick={() => setManualSyncOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleLaunchSync}
              disabled={syncLaunching}
              className="btn-primary flex items-center gap-1.5"
            >
              {syncLaunching ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Triggering Job...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Run Sync Now</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="select w-full"
            >
              <option>TechParts International</option>
              <option>PrimeSupply Corp</option>
              <option>AcmeDistributors</option>
              <option>EastWest Imports</option>
              <option>QuickShip LLC</option>
              <option>NovaTech Supplies</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Synchronization Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Inventory Sync', label: 'Inventory Sync', desc: 'Stock level updates' },
                { id: 'Pricing Sync',   label: 'Pricing Sync',   desc: 'Cost & MSRP updates' },
                { id: 'Image Sync',     label: 'Image Sync',     desc: 'Media & gallery sync' },
                { id: 'Full Sync',      label: 'Full Pipeline',  desc: 'Complete data pull' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedSyncType(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSyncType === st.id
                      ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{st.label}</p>
                  <p className="text-2xs text-slate-500 mt-0.5">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Retry All Failed Jobs Confirmation Dialog */}
      <ConfirmDialog
        open={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        onConfirm={handleConfirmRetryAll}
        title="Retry All Failed Sync Jobs?"
        message="Are you sure you want to re-queue all 17 failed synchronization jobs across connected suppliers? This will trigger automated retry attempts immediately."
        confirmLabel="Retry All Jobs (17)"
        danger={false}
      />
    </div>
  )
}
