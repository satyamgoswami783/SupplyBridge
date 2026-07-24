import React, { useState } from 'react'
import { Globe, RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Plus } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Store } from '../../types'

export const StoreManagement: React.FC = () => {
  const [selected, setSelected] = useState<Store | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div>
      <SectionHeader
        title="Store Management"
        subtitle="Manage Shift4Shop websites and their synchronization status"
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Store</button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Stores', value: mockStores.length, color: 'text-slate-800' },
          { label: 'Active', value: mockStores.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Synced', value: mockStores.filter(s => s.syncStatus === 'synced').length, color: 'text-primary-600' },
          { label: 'Issues', value: mockStores.filter(s => s.status === 'error' || s.syncStatus === 'failed').length, color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockStores.map(store => (
          <div
            key={store.id}
            className="card p-5 hover:shadow-card-md transition-all cursor-pointer"
            onClick={() => setSelected(store)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  store.status === 'active' ? 'bg-emerald-50' : store.status === 'error' ? 'bg-rose-50' : 'bg-slate-100'
                }`}>
                  <Globe size={18} className={store.status === 'active' ? 'text-emerald-600' : store.status === 'error' ? 'text-rose-600' : 'text-slate-400'} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{store.name}</p>
                  <p className="text-xs text-slate-400">{store.platform}</p>
                </div>
              </div>
              <Badge variant={statusToVariant(store.syncStatus)} dot>{store.syncStatus}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Products</span>
                <span className="font-semibold text-slate-800">{store.productCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Region</span>
                <span className="text-slate-700">{store.region || '—'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Last Sync</span>
                <span className="text-slate-500 text-xs">{store.lastSync ? timeAgo(store.lastSync) : 'Never'}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <button className="btn-primary btn-sm flex-1" onClick={e => e.stopPropagation()}><RefreshCw size={12} /> Sync Now</button>
              <a href={store.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm" onClick={e => e.stopPropagation()}>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Store Detail Modal */}
      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.name}
          subtitle={selected.url}
          size="lg"
          footer={
            <>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              <button className="btn-primary"><RefreshCw size={14} /> Sync Now</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Platform', value: selected.platform },
                { label: 'Status', value: <Badge variant={statusToVariant(selected.status)}>{selected.status}</Badge> },
                { label: 'Sync Status', value: <Badge variant={statusToVariant(selected.syncStatus)}>{selected.syncStatus}</Badge> },
                { label: 'Products', value: selected.productCount.toLocaleString() },
                { label: 'Region', value: selected.region || '—' },
                { label: 'Last Sync', value: selected.lastSync ? timeAgo(selected.lastSync) : 'Never' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <div className="text-sm font-semibold text-slate-800">{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Store URL</p>
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl">
                <code className="text-sm text-slate-700 flex-1">{selected.url}</code>
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn-icon"><ExternalLink size={14} /></a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Store Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Store"
        subtitle="Connect a Shift4Shop website to SupplyBridge"
        footer={<><button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Connect Store</button></>}
      >
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Store Name *</label><input className="input" placeholder="e.g. SupplyBridge EU Store" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Store URL *</label><input className="input" placeholder="https://yourstore.com" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Platform</label><select className="select"><option>Shift4Shop</option></select></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Region</label><select className="select"><option>North America</option><option>Europe</option><option>Asia Pacific</option></select></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">API Key *</label><input className="input" placeholder="Shift4Shop API key" type="password" /></div>
        </div>
      </Modal>
    </div>
  )
}
