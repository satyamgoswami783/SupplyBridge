import React from 'react'
import { Image, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Eye } from 'lucide-react'
import { SectionHeader, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'

const MOCK_IMAGES = [
  { id: 'i1', product: 'AMD X570 ATX Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', url: 'https://placehold.co/200x200/4f46e5/white?text=X570', status: 'synced', storeCount: 2 },
  { id: 'i2', product: 'DDR5 32GB 6000MHz Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', url: 'https://placehold.co/200x200/06b6d4/white?text=DDR5', status: 'synced', storeCount: 1 },
  { id: 'i3', product: 'NVIDIA RTX 4090 24GB', sku: 'GPU-4090-001', supplier: 'TechParts', url: '', status: 'missing', storeCount: 0 },
  { id: 'i4', product: 'Samsung 980 Pro 2TB SSD', sku: 'SSD-980P-001', supplier: 'GlobalSource', url: 'https://placehold.co/200x200/10b981/white?text=SSD', status: 'synced', storeCount: 3 },
  { id: 'i5', product: 'Industrial Fan 12V', sku: 'ACME-IF-120', supplier: 'Acme', url: 'https://placehold.co/200x200/f59e0b/white?text=FAN', status: 'pending', storeCount: 0 },
  { id: 'i6', product: 'Cable Management Kit', sku: 'ACME-CMK-50', supplier: 'Acme', url: 'https://placehold.co/200x200/ef4444/white?text=404', status: 'broken', storeCount: 0 },
]

export const ImageSync: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Image Synchronization"
        subtitle="Monitor and sync product images from suppliers to master catalog and stores"
        actions={<button className="btn-primary btn-sm"><RefreshCw size={14} /> Sync Images Now</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Images', value: '248,492', color: 'text-slate-800' },
          { label: 'Synced',       value: '243,120', color: 'text-emerald-600' },
          { label: 'Pending',      value: '3,840',   color: 'text-amber-600' },
          { label: 'Broken/Missing', value: '1,532', color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Supplier Image Status */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Image Sync Status by Supplier</h3>
        <div className="space-y-3">
          {[
            { name: 'TechParts International', total: 55260, synced: 55100, broken: 12, pending: 148, status: 'healthy' as const },
            { name: 'GlobalSource Limited',    total: 44400, synced: 44200, broken: 80, pending: 120, status: 'healthy' as const },
            { name: 'PrimeSupply Corp',        total: 33600, synced: 33600, broken: 0,  pending: 0,   status: 'healthy' as const },
            { name: 'AcmeDistributors',        total: 29400, synced: 26800, broken: 980, pending: 1620, status: 'degraded' as const },
            { name: 'QuickShip LLC',           total: 21900, synced: 21900, broken: 0,  pending: 0,   status: 'healthy' as const },
          ].map(s => (
            <div key={s.name} className="p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : 'Issues'} />
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-600"><CheckCircle2 size={10} className="inline mr-1" />{s.synced.toLocaleString()} synced</span>
                {s.broken > 0 && <span className="text-rose-600"><XCircle size={10} className="inline mr-1" />{s.broken.toLocaleString()} broken</span>}
                {s.pending > 0 && <span className="text-amber-600"><AlertTriangle size={10} className="inline mr-1" />{s.pending.toLocaleString()} pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Product Image Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_IMAGES.map(img => (
            <div key={img.id} className="group relative">
              <div className={`aspect-square rounded-xl overflow-hidden border-2 ${
                img.status === 'synced' ? 'border-emerald-200' :
                img.status === 'broken' ? 'border-rose-200' :
                img.status === 'missing' ? 'border-dashed border-slate-200' : 'border-amber-200'
              }`}>
                {img.url ? (
                  <img src={img.url} alt={img.product} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Image size={24} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="btn-ghost text-white"><Eye size={14} /></button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-700 truncate">{img.product}</p>
                <Badge variant={img.status === 'synced' ? 'success' : img.status === 'broken' ? 'danger' : img.status === 'missing' ? 'neutral' : 'warning'} className="mt-1">
                  {img.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
