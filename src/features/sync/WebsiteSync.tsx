import React, { useState } from 'react'
import { Globe, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { mockStores } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'

export const WebsiteSync: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Website Synchronization"
        subtitle="Synchronize master catalog to multiple Shift4Shop stores"
        actions={<button className="btn-primary btn-sm"><RefreshCw size={14} /> Sync All Stores</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {mockStores.map(store => (
          <div key={store.id} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary-600" />
                <div>
                  <p className="font-semibold text-slate-800">{store.name}</p>
                  <p className="text-xs text-slate-400">{store.url}</p>
                </div>
              </div>
              <Badge variant={statusToVariant(store.syncStatus)} dot>{store.syncStatus}</Badge>
            </div>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Synced Products</span>
                <span className="font-semibold text-slate-800">{store.productCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sync</span>
                <span>{store.lastSync ? timeAgo(store.lastSync) : 'Never'}</span>
              </div>
            </div>

            <ProgressBar
              value={store.syncStatus === 'synced' ? 100 : store.syncStatus === 'syncing' ? 60 : store.syncStatus === 'pending' ? 0 : 23}
              color={store.syncStatus === 'synced' ? 'emerald' : store.syncStatus === 'failed' ? 'rose' : 'primary'}
              showLabel
              className="mb-4"
            />

            <button className="btn-primary btn-sm w-full">
              <RefreshCw size={12} /> Sync {store.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
