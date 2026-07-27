import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Truck, Package, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Image, Briefcase, XCircle, PlayCircle,
  Globe, Wifi, Server, Database, Clock, TrendingUp,

  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, UserCheck, Tag,
  Zap, RotateCcw, Search, Filter
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
import { useSuppliers } from '../../context/SupplierContext'
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
} as any

const stagger = {
  parent: { transition: { staggerChildren: 0.05 } },
  child: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
}

const m = mockDashboardMetrics

export const Dashboard: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const cards = [
    { id: 'connected', label: 'Connected Suppliers', value: m.connectedSuppliers, icon: <Truck size={13} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: '+2 this week', changeType: 'positive' as const, activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'disconnected', label: 'Disconnected', value: m.disconnectedSuppliers, icon: <Wifi size={13} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: '-1 resolved', changeType: 'positive' as const, activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
    { id: 'total-products', label: 'Total Products', value: formatNumber(m.totalProducts), icon: <Package size={13} className="text-primary-600 dark:text-primary-400" />, iconBg: 'bg-primary-50 dark:bg-primary-950/60', change: '+1.2K today', changeType: 'positive' as const, activeClass: 'border-primary-500 ring-2 ring-primary-500/10 bg-primary-25/50 dark:bg-primary-950/40', activeNumberClass: 'text-primary-600 dark:text-primary-400' },
    { id: 'imported-today', label: 'Products Imported Today', value: formatNumber(m.productsImportedToday), icon: <Package size={13} className="text-cyan-600 dark:text-cyan-400" />, iconBg: 'bg-cyan-50 dark:bg-cyan-950/60', change: '+1.4K today', changeType: 'positive' as const, activeClass: 'border-cyan-500 ring-2 ring-cyan-500/10 bg-cyan-25/50 dark:bg-cyan-950/40', activeNumberClass: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'ready-publish', label: 'Products Ready to Publish', value: formatNumber(m.productsReadyToPublish), icon: <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: 'Ready', changeType: 'positive' as const, activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'pending-validation', label: 'Pending Validation', value: m.pendingProducts, icon: <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: '-84 resolved', changeType: 'positive' as const, activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
    { id: 'published-products', label: 'Published Products', value: formatNumber(m.publishedProducts), icon: <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: '+982 today', changeType: 'positive' as const, activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'awaiting-review', label: 'Products Awaiting Review', value: m.productsAwaitingReview, icon: <Clock size={13} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: 'Review', changeType: 'positive' as const, activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
    { id: 'duplicate-products', label: 'Duplicate Products', value: m.duplicateProducts, icon: <XCircle size={13} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: 'Fix needed', changeType: 'negative' as const, activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
    { id: 'missing-images', label: 'Missing Images', value: m.missingImages, icon: <Image size={13} className="text-violet-600 dark:text-violet-400" />, iconBg: 'bg-violet-50 dark:bg-violet-950/60', change: 'Fix needed', changeType: 'negative' as const, activeClass: 'border-violet-500 ring-2 ring-violet-500/10 bg-violet-25/50 dark:bg-violet-950/40', activeNumberClass: 'text-violet-600 dark:text-violet-400' },
    { id: 'missing-categories', label: 'Missing Categories', value: m.missingCategories, icon: <Tag size={13} className="text-indigo-600 dark:text-indigo-400" />, iconBg: 'bg-indigo-50 dark:bg-indigo-950/60', change: 'Fix needed', changeType: 'negative' as const, activeClass: 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-25/50 dark:bg-indigo-950/40', activeNumberClass: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'missing-pricing', label: 'Missing Pricing', value: m.missingPricing, icon: <DollarSign size={13} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: 'Fix needed', changeType: 'negative' as const, activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
    { id: 'failed-products', label: 'Failed Products', value: m.failedProducts, icon: <XCircle size={13} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: '+12 today', changeType: 'negative' as const, activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
  ]

  const { role, currentUser } = useAuth()
  const { suppliersList } = useSuppliers()
  const roleInfo = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.integration_manager
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Updated just now')

  // Action Modal states
  const [manualSyncOpen, setManualSyncOpen] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState('TechParts International')
  const [selectedSyncType, setSelectedSyncType] = useState('Inventory Sync')
  const [syncLaunching, setSyncLaunching] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('')

  // Activity Feed Filter State
  const [activityFilter, setActivityFilter] = useState('All')
  const [activitySearch, setActivitySearch] = useState('')

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

  const getKpis = () => {
    if (role === 'catalog_manager') {
      return [
        { label: 'Total Products', value: formatNumber(m.totalProducts), icon: <Package size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', change: '+1.2K today', changeType: 'positive' as const },
        { label: 'Pending Validation', value: m.pendingProducts, icon: <AlertTriangle size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', change: '-84 resolved', changeType: 'positive' as const },
        { label: 'Draft Products', value: formatNumber(Math.round(m.totalProducts * 0.12)), icon: <Clock size={18} className="text-slate-600" />, iconBg: 'bg-slate-50', change: '+32 this week', changeType: 'positive' as const },
        { label: 'Products Missing Images', value: 8, icon: <Image size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: 'Require review', changeType: 'negative' as const },
        { label: 'Missing Categories', value: 3, icon: <Tag size={18} className="text-violet-600" />, iconBg: 'bg-violet-50', change: 'Require review', changeType: 'negative' as const },
        { label: 'Duplicate SKU Count', value: 1, icon: <XCircle size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: 'High priority', changeType: 'negative' as const },
      ]
    }
    // Default KPIs for other roles
    return [
      { label: 'Connected Suppliers', value: m.connectedSuppliers, icon: <Truck size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+2 this week', changeType: 'positive' as const },
      { label: 'Disconnected', value: m.disconnectedSuppliers, icon: <Wifi size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '-1 resolved', changeType: 'positive' as const },
      { label: 'Total Products', value: formatNumber(m.totalProducts), icon: <Package size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', change: '+1.2K today', changeType: 'positive' as const },
      { label: 'Pending Validation', value: m.pendingProducts, icon: <AlertTriangle size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', change: '-84 resolved', changeType: 'positive' as const },
      { label: 'Published Products', value: formatNumber(m.publishedProducts), icon: <CheckCircle2 size={18} className="text-emerald-600" />, iconBg: 'bg-emerald-50', change: '+982 today', changeType: 'positive' as const },
      { label: 'Failed Products', value: m.failedProducts, icon: <XCircle size={18} className="text-rose-600" />, iconBg: 'bg-rose-50', change: '+12 today', changeType: 'negative' as const },
    ]
  }

  return (
    <div className="relative space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" dot>{roleInfo.focus}</Badge>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">• Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">SupplyBridge Control Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time catalog middleware, supplier feed pipelines, and Shift4Shop storefront sync</p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center mt-1 sm:mt-0">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
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

      {/* Static Top KPI Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5"
        variants={stagger.parent}
        initial="initial"
        animate="animate"
      >
        {cards
          .filter(c => c.id !== 'published-products' && c.id !== 'failed-products')
          .map((card) => {
            const isSelected = activeCard === card.id;
            return (
              <motion.div
                key={card.id}
                variants={stagger.child}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveCard(prev => (prev === card.id ? null : card.id))}
                className={`kpi-card group cursor-pointer transition-all duration-200 ${isSelected ? card.activeClass : 'border-surface-border'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.change && (
                    <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${card.changeType === 'positive' ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800' : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800'
                      }`}>
                      {card.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="kpi-label">{card.label}</p>
                  <p className={`kpi-value mt-0.5 transition-colors duration-200 ${isSelected ? card.activeNumberClass : 'text-slate-900 dark:text-slate-100'
                    }`}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
      </motion.div>

      {/* Static Sync Status + Jobs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sync Channels */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-primary-600 dark:text-primary-400" /> Synchronization Channels
          </p>
          <div className="space-y-3.5">
            {[
              { label: 'Inventory Sync', status: m.inventorySyncStatus, last: '4 min ago', icon: <RefreshCw size={14} /> },
              { label: 'Pricing Sync', status: m.pricingSyncStatus, last: '12 min ago', icon: <DollarSign size={14} /> },
              { label: 'Image Sync', status: m.imageSyncStatus, last: '2 hr ago', icon: <Image size={14} /> },
            ].map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 text-xs font-bold">
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

        {/* Job Execution Summary */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-600 dark:text-primary-400" /> Job Execution Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Running', value: m.runningJobs, color: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50', icon: <RefreshCw size={16} className="animate-spin text-cyan-600" /> },
              { label: 'Queued', value: m.queuedJobs, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50', icon: <Clock size={16} className="text-amber-600" /> },
              { label: 'Completed', value: m.completedJobs, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50', icon: <CheckCircle2 size={16} className="text-emerald-600" /> },
              { label: 'Failed', value: m.failedJobs, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50', icon: <XCircle size={16} className="text-rose-600" /> },
            ].map(j => (
              <div
                key={j.label}
                className={`${j.bg} rounded-xl p-3 flex flex-col gap-1`}
              >
                <span>{j.icon}</span>
                <p className={`text-2xl font-black ${j.color}`}>{j.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{j.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Import Queue & Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-primary-600 dark:text-primary-400" /> Recent Activity Feed
            </p>
            <Link to="/logs" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">View all logs →</Link>
          </div>

          {/* Activity Feed Filters & Search */}
          <div className="space-y-2 mb-4">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search activity timeline..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {[
                'All', 'Supplier', 'Store', 'Inventory', 'Pricing', 'Images', 'Errors', 'Warnings', 'Manual Actions'
              ].map(f => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all ${
                    activityFilter === f
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {mockActivities
              .filter(act => {
                const matchesSearch = act.message.toLowerCase().includes(activitySearch.toLowerCase())
                if (activityFilter === 'All') return matchesSearch
                if (activityFilter === 'Supplier') return matchesSearch && (act.message.includes('Supplier') || act.message.includes('TechParts') || act.message.includes('Acme'))
                if (activityFilter === 'Store') return matchesSearch && (act.message.includes('Store') || act.message.includes('Shop'))
                if (activityFilter === 'Inventory') return matchesSearch && (act.message.includes('Inventory') || act.message.includes('Stock'))
                if (activityFilter === 'Pricing') return matchesSearch && (act.message.includes('Price') || act.message.includes('Pricing') || act.message.includes('Cost'))
                if (activityFilter === 'Images') return matchesSearch && (act.message.includes('Image') || act.message.includes('Media'))
                if (activityFilter === 'Errors') return matchesSearch && (act.color === 'rose' || act.message.includes('failed') || act.message.includes('Error'))
                if (activityFilter === 'Warnings') return matchesSearch && (act.color === 'amber' || act.message.includes('warning'))
                if (activityFilter === 'Manual Actions') return matchesSearch && (act.message.includes('Manual') || act.message.includes('triggered'))
                return matchesSearch
              })
              .map(act => {
                const colorMap: Record<string, string> = {
                  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
                  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
                  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
                }
                return (
                  <div key={act.id} className="flex items-start gap-3 p-2 rounded-xl">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[act.color]}`}>
                      <span className="text-xs font-bold">●</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{act.message}</p>
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
          <div className="card p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Database size={16} className="text-primary-600 dark:text-primary-400" /> Active Import Queue Capacity
            </p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{m.queueSize}</div>
              <div className="flex-1">
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.queueSize / 500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">{m.queueSize} items currently processing — total queue capacity 500</p>
              </div>
            </div>
          </div>

          {/* Store Status */}
          <div className="card p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe size={16} className="text-primary-600 dark:text-primary-400" /> Multi-Store Status
              </p>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{m.storesSynced}/{m.totalStores} Synced</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'US Store', ok: true }, { label: 'EU Store', ok: true },
                { label: 'TechHub', ok: true }, { label: 'UK Store', ok: true },
                { label: 'CA Store', ok: false }, { label: 'AutoParts', ok: true },
                { label: 'SportGear', ok: false },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-2 text-center border ${s.ok ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-2xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{s.label}</p>
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="select w-full"
            >
              {suppliersList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Synchronization Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Inventory Sync', label: 'Inventory Sync', desc: 'Stock level updates' },
                { id: 'Pricing Sync', label: 'Pricing Sync', desc: 'Cost & MSRP updates' },
                { id: 'Image Sync', label: 'Image Sync', desc: 'Media & gallery sync' },
                { id: 'Full Sync', label: 'Full Pipeline', desc: 'Complete data pull' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedSyncType(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${selectedSyncType === st.id
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{st.label}</p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{st.desc}</p>
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
