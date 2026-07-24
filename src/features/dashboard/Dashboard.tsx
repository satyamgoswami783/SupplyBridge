import React from 'react'
import { motion } from 'framer-motion'
import {
  Truck, Package, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Image, Briefcase, XCircle, PlayCircle,
  Globe, Wifi, Server, Database, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, UserCheck, Tag
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { StatsCard, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockDashboardMetrics, mockSyncChartData, mockProductsBySupplier, mockActivities } from '../../data/mockData'
import { formatNumber } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; subtitle: string; focus: string }> = {
  super_admin: {
    title: 'Super Admin Control Center',
    subtitle: 'Complete platform control, system architecture health & full operational status',
    focus: 'Platform Owner',
  },
  admin: {
    title: 'Business Operations Overview',
    subtitle: 'Daily platform administration, supplier inventory, pricing & catalog performance',
    focus: 'Business Administrator',
  },
  catalog_manager: {
    title: 'Catalog & PIM Dashboard',
    subtitle: 'Product information management, attribute mapping, and validation queue status',
    focus: 'PIM Manager',
  },
  integration_manager: {
    title: 'Supplier Integration Hub',
    subtitle: 'Supplier API connections, FTP file pipelines, import queues and sync jobs',
    focus: 'Integration Manager',
  },
  operations_staff: {
    title: 'Operations & Monitoring Console',
    subtitle: 'Real-time operational monitoring, validation review, failed sync retries & logs',
    focus: 'Operations Specialist',
  },
}

const stagger = {
  parent: { transition: { staggerChildren: 0.05 } },
  child:  { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
}

const m = mockDashboardMetrics

export const Dashboard: React.FC = () => {
  const { role, currentUser } = useAuth()
  const roleInfo = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.super_admin

  const getKpis = () => {
    if (role === 'catalog_manager') {
      return [
        { label: 'Total Products',      value: formatNumber(m.totalProducts), icon: <Package size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', change: '+1.2K today', changeType: 'positive' as const },
        { label: 'Pending Validation',  value: m.pendingProducts, icon: <AlertTriangle size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', change: '-84 resolved', changeType: 'positive' as const },
        { label: 'Draft Products',      value: formatNumber(Math.round(m.totalProducts * 0.12)), icon: <Clock size={18} className="text-slate-600" />, iconBg: 'bg-slate-50', change: '+32 this week', changeType: 'positive' as const },
        { label: 'Products Missing Images', value: 8, icon: <Image size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: 'Require review', changeType: 'negative' as const },
        { label: 'Missing Categories',  value: 3, icon: <Tag size={18} className="text-violet-600" />, iconBg: 'bg-violet-50', change: 'Require review', changeType: 'negative' as const },
        { label: 'Duplicate SKU Count',  value: 1, icon: <XCircle size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: 'High priority', changeType: 'negative' as const },
      ]
    }
    // Default KPIs for other roles
    return [
      { label: 'Connected Suppliers', value: m.connectedSuppliers, icon: <Truck size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+2 this week', changeType: 'positive' as const },
      { label: 'Disconnected',        value: m.disconnectedSuppliers, icon: <Wifi size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '-1 resolved', changeType: 'positive' as const },
      { label: 'Total Products',      value: formatNumber(m.totalProducts), icon: <Package size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', change: '+1.2K today', changeType: 'positive' as const },
      { label: 'Pending Validation',  value: m.pendingProducts, icon: <AlertTriangle size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', change: '-84 resolved', changeType: 'positive' as const },
      { label: 'Published Products',  value: formatNumber(m.publishedProducts), icon: <CheckCircle2 size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+982 today', changeType: 'positive' as const },
      { label: 'Failed Products',     value: m.failedProducts, icon: <XCircle size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '+12 today', changeType: 'negative' as const },
    ]
  }

  return (
    <div className="relative space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="purple" dot>{roleInfo.focus}</Badge>
            <span className="text-xs text-slate-500 font-semibold">• Logged in as <strong className="text-slate-800">{currentUser.name}</strong></span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{roleInfo.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{roleInfo.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <HealthIndicator status="operational" label="All Systems Operational" />
          <span className="text-2xs text-slate-400 font-mono">Updated just now</span>
        </div>
      </div>

      {/* Top KPI Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        variants={stagger.parent}
        initial="initial"
        animate="animate"
      >
        {getKpis().map((item, i) => (
          <motion.div key={i} variants={stagger.child} transition={{ duration: 0.3 }}>
            <StatsCard {...item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Sync Status + Jobs Summary + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sync Status */}
        <div className="card p-5 border border-slate-200">
          <p className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-primary-600" /> Synchronization Channels
          </p>
          <div className="space-y-3.5">
            {[
              { label: 'Inventory Sync', status: m.inventorySyncStatus, last: '4 min ago', icon: <RefreshCw size={14} /> },
              { label: 'Pricing Sync',   status: m.pricingSyncStatus,   last: '12 min ago', icon: <DollarSign size={14} /> },
              { label: 'Image Sync',     status: m.imageSyncStatus,     last: '2 hr ago', icon: <Image size={14} /> },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 text-slate-800 text-xs font-bold">
                  <span className="text-slate-400">{s.icon}</span>
                  {s.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-400 font-mono">{s.last}</span>
                  <HealthIndicator status={s.status as any} label={s.status === 'healthy' ? 'Healthy' : s.status === 'degraded' ? 'Degraded' : 'Critical'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs Status Summary */}
        <div className="card p-5 border border-slate-200">
          <p className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-600" /> Job Execution Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Running',   value: m.runningJobs,   color: 'text-cyan-700',    bg: 'bg-cyan-50 border border-cyan-100',    icon: <RefreshCw size={16} className="animate-spin text-cyan-600" /> },
              { label: 'Queued',    value: m.queuedJobs,    color: 'text-amber-700',   bg: 'bg-amber-50 border border-amber-100',   icon: <Clock size={16} className="text-amber-600" /> },
              { label: 'Completed', value: m.completedJobs, color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-100', icon: <CheckCircle2 size={16} className="text-emerald-600" /> },
              { label: 'Failed',    value: m.failedJobs,    color: 'text-rose-700',    bg: 'bg-rose-50 border border-rose-100',    icon: <XCircle size={16} className="text-rose-600" /> },
            ].map(j => (
              <div key={j.label} className={`${j.bg} rounded-xl p-3 flex flex-col gap-1`}>
                <span>{j.icon}</span>
                <p className={`text-2xl font-black ${j.color}`}>{j.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-semibold">{j.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="card p-5 border border-slate-200">
          <p className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server size={16} className="text-primary-600" /> System Infrastructure
          </p>
          <div className="space-y-3">
            {[
              { label: 'API Gateway',    status: m.apiStatus,    icon: <Wifi size={14} /> },
              { label: 'FTP Service',    status: m.ftpStatus,    icon: <Server size={14} /> },
              { label: 'Import Queue',   status: 'operational',  icon: <Database size={14} /> },
              { label: 'Stores Online',  status: m.storesSynced === m.totalStores ? 'operational' : 'degraded', icon: <Globe size={14} /> },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{s.icon}</span>
                  {s.label}
                </div>
                <HealthIndicator status={s.status as any} label={s.status === 'operational' ? 'OK' : 'Degraded'} />
              </div>
            ))}
            {/* Health bar */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-semibold">Overall System Health</span>
                <span className="text-xs font-black text-emerald-600">{m.systemHealth}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.systemHealth}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sync Jobs Area Chart */}
        <div className="xl:col-span-2 card p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Synchronization Activity Trend</p>
              <p className="text-xs text-slate-400 font-medium">Daily synchronized jobs across Inventory, Pricing & Images</p>
            </div>
            <Badge variant="primary" dot>Real-time</Badge>
          </div>
          <ResponsiveContainer width="100%" height={230}>
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
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="inventory" name="Inventory Sync" stroke="#4f46e5" strokeWidth={2} fill="url(#colInv)" dot={false} />
              <Area type="monotone" dataKey="pricing"   name="Pricing Sync"   stroke="#10b981" strokeWidth={2} fill="url(#colPri)" dot={false} />
              <Area type="monotone" dataKey="image"     name="Image Sync"     stroke="#06b6d4" strokeWidth={2} fill="url(#colImg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Supplier Bar Chart */}
        <div className="card p-5 border border-slate-200">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-900">Products by Supplier</p>
            <p className="text-xs text-slate-400 font-medium">Top supplier distribution by catalog count</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={mockProductsBySupplier} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="products" name="Products" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Import Queue & Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="card p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity size={16} className="text-primary-600" /> Recent Activity Feed
            </p>
          </div>
          <div className="space-y-3.5">
            {mockActivities.map(act => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-700',
                blue:    'bg-blue-100 text-blue-700',
                rose:    'bg-rose-100 text-rose-700',
                amber:   'bg-amber-100 text-amber-700',
                violet:  'bg-violet-100 text-violet-700',
              }
              return (
                <div key={act.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[act.color]}`}>
                    <span className="text-xs font-bold">●</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-snug">{act.message}</p>
                    <p className="text-2xs text-slate-400 font-mono mt-0.5">{act.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Queue + Store Status */}
        <div className="space-y-5">
          {/* Import Queue */}
          <div className="card p-5 border border-slate-200">
            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database size={16} className="text-primary-600" /> Active Import Queue Capacity
            </p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-slate-900">{m.queueSize}</div>
              <div className="flex-1">
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    className="h-full rounded-full bg-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.queueSize / 500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5">{m.queueSize} items currently processing — total queue capacity 500</p>
              </div>
            </div>
          </div>

          {/* Store Status */}
          <div className="card p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe size={16} className="text-primary-600" /> Multi-Store Status
              </p>
              <span className="text-xs text-slate-600 font-bold">{m.storesSynced}/{m.totalStores} Synced</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'US Store', ok: true }, { label: 'EU Store', ok: true },
                { label: 'TechHub', ok: true },  { label: 'UK Store', ok: true },
                { label: 'CA Store', ok: false }, { label: 'AutoParts', ok: true },
                { label: 'SportGear', ok: false },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-2 text-center border ${s.ok ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-2xs font-bold text-slate-700 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
