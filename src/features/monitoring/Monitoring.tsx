import React from 'react'
import { motion } from 'framer-motion'
import { Server, Activity, Cpu, HardDrive, Wifi, Database, Globe, Truck } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const uptimeData = [
  { time: '00:00', cpu: 42, memory: 61, queue: 80 },
  { time: '04:00', cpu: 38, memory: 58, queue: 65 },
  { time: '08:00', cpu: 67, memory: 72, queue: 120 },
  { time: '12:00', cpu: 78, memory: 80, queue: 180 },
  { time: '16:00', cpu: 55, memory: 68, queue: 140 },
  { time: '20:00', cpu: 48, memory: 64, queue: 100 },
  { time: 'Now',   cpu: 52, memory: 66, queue: 248 },
]

export const Monitoring: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="System Monitoring"
        subtitle="Real-time health, performance, and infrastructure status"
        actions={<Badge variant="success" dot>All Systems Operational</Badge>}
      />

      {/* System Health Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'CPU Usage',     value: 52, color: 'primary', icon: <Cpu size={16} className="text-primary-600" />, bg: 'bg-primary-50' },
          { label: 'Memory',        value: 66, color: 'cyan',    icon: <Server size={16} className="text-cyan-600" />,  bg: 'bg-cyan-50' },
          { label: 'Storage Used',  value: 43, color: 'emerald', icon: <HardDrive size={16} className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Queue Load',    value: 48, color: 'amber',   icon: <Database size={16} className="text-amber-600" />, bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{s.value}%</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 mb-2">{s.label}</p>
            <ProgressBar value={s.value} color={s.color as any} />
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">System Performance — Last 24 Hours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={uptimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#4f46e5" strokeWidth={2} fill="url(#cpuGrad)" dot={false} />
            <Area type="monotone" dataKey="memory" name="Memory %" stroke="#06b6d4" strokeWidth={2} fill="url(#memGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API Health */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Wifi size={15} className="text-primary-600" /> API Endpoint Health
          </h3>
          <div className="space-y-3">
            {[
              { endpoint: '/api/v1/products',    latency: '48ms', status: 'operational', calls: '12,400/hr' },
              { endpoint: '/api/v1/inventory',   latency: '32ms', status: 'operational', calls: '8,200/hr' },
              { endpoint: '/api/v1/pricing',     latency: '120ms', status: 'degraded',   calls: '4,100/hr' },
              { endpoint: '/api/v1/sync',        latency: '65ms', status: 'operational', calls: '2,800/hr' },
              { endpoint: '/api/v1/suppliers',   latency: '55ms', status: 'operational', calls: '980/hr' },
            ].map(ep => (
              <div key={ep.endpoint} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50">
                <code className="text-xs font-mono text-slate-700">{ep.endpoint}</code>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{ep.calls}</span>
                  <span className={`text-xs font-semibold ${ep.latency.includes('12') ? 'text-amber-600' : 'text-emerald-600'}`}>{ep.latency}</span>
                  <HealthIndicator status={ep.status as any} label={ep.status === 'operational' ? 'OK' : 'Slow'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Truck size={15} className="text-primary-600" /> Supplier Connection Status
          </h3>
          <div className="space-y-2">
            {[
              { name: 'TechParts International', type: 'API',  status: 'operational', ping: '24ms' },
              { name: 'GlobalSource Limited',    type: 'FTP',  status: 'operational', ping: '180ms' },
              { name: 'PrimeSupply Corp',        type: 'XML',  status: 'operational', ping: '95ms' },
              { name: 'AcmeDistributors',        type: 'SFTP', status: 'down',        ping: '—' },
              { name: 'QuickShip LLC',           type: 'SFTP', status: 'operational', ping: '42ms' },
              { name: 'MegaTrade Co',            type: 'Excel',status: 'down',        ping: '—' },
              { name: 'NovaTech Supplies',       type: 'API',  status: 'operational', ping: '78ms' },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'operational' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-sm text-slate-700">{s.name}</span>
                  <span className="text-2xs text-slate-400 bg-slate-100 px-1.5 rounded">{s.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{s.ping}</span>
                  <HealthIndicator status={s.status as any} label={s.status === 'operational' ? 'Up' : 'Down'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Health */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={15} className="text-primary-600" /> Queue Health
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Import Queue', current: 248, max: 500, status: 'healthy' as const },
              { label: 'Sync Queue',   current: 45,  max: 200, status: 'healthy' as const },
              { label: 'Image Queue',  current: 180, max: 300, status: 'degraded' as const },
              { label: 'Email Queue',  current: 12,  max: 1000, status: 'healthy' as const },
            ].map(q => (
              <div key={q.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{q.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{q.current}/{q.max}</span>
                    <HealthIndicator status={q.status} label={q.status === 'healthy' ? 'OK' : 'High'} />
                  </div>
                </div>
                <ProgressBar value={q.current} max={q.max} color={q.current / q.max > 0.7 ? 'amber' : 'emerald'} />
              </div>
            ))}
          </div>
        </div>

        {/* Store Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={15} className="text-primary-600" /> Store Availability
          </h3>
          <div className="space-y-2">
            {[
              { name: 'SupplyBridge US Store', uptime: '99.98%', ok: true },
              { name: 'SupplyBridge EU Store', uptime: '99.92%', ok: true },
              { name: 'TechHub Marketplace',   uptime: '99.87%', ok: true },
              { name: 'IndusStore UK',          uptime: '99.95%', ok: true },
              { name: 'QuickBuy CA',            uptime: '98.50%', ok: false },
              { name: 'AutoParts Direct',       uptime: '99.90%', ok: true },
              { name: 'SportGear Pro',          uptime: '94.20%', ok: false },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-sm text-slate-700">{s.name}</span>
                </div>
                <span className={`text-xs font-semibold ${s.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{s.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
