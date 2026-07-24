import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Eye } from 'lucide-react'
import { SectionHeader, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

const MOCK_IMAGES = [
  { id: 'i1', product: 'AMD X570 ATX Motherboard', sku: 'MB-X570-001', supplier: 'TechParts', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80', status: 'synced', storeCount: 2 },
  { id: 'i2', product: 'DDR5 32GB 6000MHz Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80', status: 'synced', storeCount: 1 },
  { id: 'i3', product: 'NVIDIA RTX 4090 24GB', sku: 'GPU-4090-001', supplier: 'TechParts', url: '', status: 'missing', storeCount: 0 },
  { id: 'i4', product: 'Samsung 980 Pro 2TB SSD', sku: 'SSD-980P-001', supplier: 'GlobalSource', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80', status: 'synced', storeCount: 3 },
  { id: 'i5', product: 'Industrial Fan 12V', sku: 'ACME-IF-120', supplier: 'Acme', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=80', status: 'pending', storeCount: 0 },
  { id: 'i6', product: 'Cable Management Kit', sku: 'ACME-CMK-50', supplier: 'Acme', url: '', status: 'broken', storeCount: 0 },
]

export const ImageSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<typeof MOCK_IMAGES[0] | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSyncImages = () => {
    setSyncing(true)
    showNotification('Image downloading & WebP optimization started...')
    setTimeout(() => {
      setSyncing(false)
      showNotification('Image synchronization complete! 3,840 product images updated.')
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
        title="Image Synchronization"
        subtitle="Monitor and synchronize supplier media feeds, CDN hosting, and image WebP optimizations"
        actions={
          <button
            onClick={handleSyncImages}
            disabled={syncing}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing Images...' : 'Sync Images Now'}
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Media Assets', value: '248,492', color: 'text-slate-800' },
          { label: 'Synced & Optimized', value: '243,120', color: 'text-emerald-600' },
          { label: 'Pending Processing', value: '3,840', color: 'text-amber-600' },
          { label: 'Broken / 404 Links', value: '1,532', color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Supplier Image Status */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Image Feed Status by Supplier</h3>
        <div className="space-y-3">
          {[
            { name: 'TechParts International', total: 55260, synced: 55100, broken: 12, pending: 148, status: 'healthy' as const },
            { name: 'GlobalSource Limited',    total: 44400, synced: 44200, broken: 80, pending: 120, status: 'healthy' as const },
            { name: 'PrimeSupply Corp',        total: 33600, synced: 33600, broken: 0,  pending: 0,   status: 'healthy' as const },
            { name: 'AcmeDistributors',        total: 29400, synced: 26800, broken: 980, pending: 1620, status: 'degraded' as const },
            { name: 'QuickShip LLC',           total: 21900, synced: 21900, broken: 0,  pending: 0,   status: 'healthy' as const },
          ].map(s => (
            <div key={s.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <HealthIndicator status={s.status} label={s.status === 'healthy' ? 'OK' : 'Issues'} />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-emerald-600 font-medium"><CheckCircle2 size={11} className="inline mr-1" />{s.synced.toLocaleString()} synced</span>
                {s.broken > 0 && <span className="text-rose-600 font-medium"><XCircle size={11} className="inline mr-1" />{s.broken.toLocaleString()} broken</span>}
                {s.pending > 0 && <span className="text-amber-600 font-medium"><AlertTriangle size={11} className="inline mr-1" />{s.pending.toLocaleString()} pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Master Catalog Product Image Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_IMAGES.map(img => (
            <div key={img.id} className="group relative cursor-pointer" onClick={() => setPreviewItem(img)}>
              <div className={`aspect-square rounded-xl overflow-hidden border-2 relative ${
                img.status === 'synced' ? 'border-emerald-200 bg-white' :
                img.status === 'broken' ? 'border-rose-200 bg-rose-50' :
                img.status === 'missing' ? 'border-dashed border-slate-300 bg-slate-50' : 'border-amber-200 bg-amber-50'
              }`}>
                {img.url ? (
                  <img src={img.url} alt={img.product} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Image size={24} className="mb-1" />
                    <span className="text-2xs font-medium">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:opacity-100 opacity-0 transition-opacity rounded-xl flex items-center justify-center">
                  <button className="btn-ghost text-white text-xs flex items-center gap-1">
                    <Eye size={14} /> Preview
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-800 truncate">{img.product}</p>
                <Badge variant={img.status === 'synced' ? 'success' : img.status === 'broken' ? 'danger' : img.status === 'missing' ? 'neutral' : 'warning'} className="mt-1">
                  {img.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <Modal
          open
          onClose={() => setPreviewItem(null)}
          title={previewItem.product}
          subtitle={`SKU: ${previewItem.sku} · Supplier: ${previewItem.supplier}`}
          size="md"
          footer={
            <button onClick={() => setPreviewItem(null)} className="btn-secondary">Close</button>
          }
        >
          <div className="space-y-4 text-center">
            <div className="w-64 h-64 mx-auto rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 shadow-inner">
              {previewItem.url ? (
                <img src={previewItem.url} alt={previewItem.product} className="w-full h-full object-contain" />
              ) : (
                <Image size={48} className="text-slate-300" />
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Media Status:</span>
                <span className="font-semibold text-slate-800 uppercase">{previewItem.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Store Front Syncs:</span>
                <span className="font-semibold text-slate-800">{previewItem.storeCount} Stores</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
