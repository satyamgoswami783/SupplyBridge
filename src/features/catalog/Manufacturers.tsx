import React, { useState } from 'react'
import { Truck, Search, Plus, Globe, Package, CheckCircle2, AlertCircle, Building2, Filter, Edit3, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface Manufacturer {
  id: string
  name: string
  oemCode: string
  country: string
  skuCount: number
  protocol: 'API' | 'FTP' | 'SFTP' | 'SOAP'
  status: 'active' | 'pending' | 'inactive'
  contactEmail: string
  lastSync: string
}

const INITIAL_MANUFACTURERS: Manufacturer[] = [
  { id: 'm1', name: 'Bosch Automotive Global', oemCode: 'OEM-BOSCH-DE', country: 'Germany', skuCount: 14250, protocol: 'API', status: 'active', contactEmail: 'oem-data@bosch.de', lastSync: '10 mins ago' },
  { id: 'm2', name: 'Denso Corporation', oemCode: 'OEM-DENSO-JP', country: 'Japan', skuCount: 9800, protocol: 'SFTP', status: 'active', contactEmail: 'connect@denso.co.jp', lastSync: '1 hour ago' },
  { id: 'm3', name: 'Magna International', oemCode: 'OEM-MAGNA-CA', country: 'Canada', skuCount: 8400, protocol: 'FTP', status: 'active', contactEmail: 'pim-feed@magna.ca', lastSync: '25 mins ago' },
  { id: 'm4', name: 'ZF Friedrichshafen', oemCode: 'OEM-ZF-DE', country: 'Germany', skuCount: 6200, protocol: 'API', status: 'pending', contactEmail: 'partner@zf.com', lastSync: 'Yesterday' },
  { id: 'm5', name: 'Aisin Seiki Parts', oemCode: 'OEM-AISIN-JP', country: 'Japan', skuCount: 5100, protocol: 'SOAP', status: 'active', contactEmail: 'catalog@aisin.co.jp', lastSync: '3 hours ago' },
]

export const Manufacturers: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(INITIAL_MANUFACTURERS)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    oemCode: '',
    country: 'Germany',
    protocol: 'API' as const,
    contactEmail: '',
  })

  const filtered = manufacturers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.oemCode.toLowerCase().includes(search.toLowerCase())
    const matchesCountry = countryFilter === 'all' || m.country.toLowerCase() === countryFilter.toLowerCase()
    return matchesSearch && matchesCountry
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setManufacturers(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } : m))
    } else {
      const newM: Manufacturer = {
        id: `m-${Date.now()}`,
        ...formData,
        skuCount: 0,
        status: 'active',
        lastSync: 'Just now',
      }
      setManufacturers(prev => [newM, ...prev])
    }
    setModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', oemCode: '', country: 'Germany', protocol: 'API', contactEmail: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Building2 className="text-amber-500" size={24} /> Manufacturers Catalog
          </h1>
          <p className="page-subtitle">OEM Brand Manufacturers, Country Specs & Direct PIM Data Contracts</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ name: '', oemCode: '', country: 'Germany', protocol: 'API', contactEmail: '' }); setModalOpen(true); }}
          className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-amber-500/25 cursor-pointer"
        >
          <Plus size={15} /> Add Manufacturer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">TOTAL MANUFACTURERS</span>
            <Building2 size={16} className="text-amber-500" />
          </div>
          <span className="kpi-value">{manufacturers.length}</span>
          <span className="text-2xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 size={10} /> 100% Contract Compliance
          </span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">TOTAL OEM SKUS</span>
            <Package size={16} className="text-cyan-500" />
          </div>
          <span className="kpi-value">49.75K</span>
          <span className="text-2xs text-slate-500 font-medium">Direct Supplier Pipeline</span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">API CONNECTED</span>
            <Globe size={16} className="text-emerald-500" />
          </div>
          <span className="kpi-value">{manufacturers.filter(m => m.protocol === 'API').length}</span>
          <span className="text-2xs text-emerald-600 font-bold">Real-time Data Stream</span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">ACTIVE STATUS</span>
            <CheckCircle2 size={16} className="text-amber-500" />
          </div>
          <span className="kpi-value">{manufacturers.filter(m => m.status === 'active').length}</span>
          <span className="text-2xs text-slate-500 font-medium">Verified Manufacturers</span>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search manufacturer name or OEM code..."
            className="input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="select text-xs w-full sm:w-44"
          >
            <option value="all">All Countries</option>
            <option value="germany">Germany</option>
            <option value="japan">Japan</option>
            <option value="canada">Canada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Manufacturer</th>
              <th>OEM Identifier</th>
              <th>Country</th>
              <th>Catalog SKUs</th>
              <th>Protocol</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{m.name}</span>
                    <span className="text-2xs text-slate-400 font-mono">{m.contactEmail}</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-amber-600 dark:text-amber-400">
                    {m.oemCode}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{m.country}</span>
                </td>
                <td>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.skuCount.toLocaleString()}</span>
                </td>
                <td>
                  <span className="text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">
                    {m.protocol}
                  </span>
                </td>
                <td>
                  <Badge variant={m.status === 'active' ? 'success' : 'warning'} dot>
                    {m.status}
                  </Badge>
                </td>
                <td>
                  <span className="text-2xs text-slate-500 font-medium">{m.lastSync}</span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingId(m.id)
                        setFormData({ name: m.name, oemCode: m.oemCode, country: m.country, protocol: m.protocol as any, contactEmail: m.contactEmail })
                        setModalOpen(true)
                      }}
                      className="btn-icon"
                      title="Edit Manufacturer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setManufacturers(prev => prev.filter(x => x.id !== m.id))}
                      className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove Manufacturer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Manufacturer' : 'Add New Manufacturer'}
        subtitle="Manage OEM manufacturer details and data contract protocol"
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Manufacturer Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bosch Automotive Global"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">OEM Code *</label>
              <input
                type="text"
                required
                value={formData.oemCode}
                onChange={e => setFormData({ ...formData, oemCode: e.target.value })}
                placeholder="e.g. OEM-BOSCH-DE"
                className="input font-mono uppercase"
              />
            </div>
            <div>
              <label className="label">Country of Origin</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Germany"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data Protocol</label>
              <select
                value={formData.protocol}
                onChange={e => setFormData({ ...formData, protocol: e.target.value as any })}
                className="select"
              >
                <option value="API">API REST v2</option>
                <option value="FTP">FTP Feed</option>
                <option value="SFTP">SFTP Secure</option>
                <option value="SOAP">SOAP XML</option>
              </select>
            </div>
            <div>
              <label className="label">Technical Contact Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="oem-data@supplier.com"
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Manufacturer</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
