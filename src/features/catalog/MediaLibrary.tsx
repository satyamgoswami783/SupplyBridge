import React, { useState } from 'react'
import { Image, FileText, Download, Upload, Search, Filter, CheckCircle2, Copy, Link, ExternalLink, HardDrive, Shield } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface MediaAsset {
  id: string
  name: string
  sku: string
  type: 'image' | 'pdf' | 'cad' | 'brand'
  size: string
  dimensions?: string
  cdnUrl: string
  uploadedAt: string
  status: 'synced' | 'pending' | 'error'
}

const INITIAL_ASSETS: MediaAsset[] = [
  { id: 'a1', name: 'RAM-DDR5-6000-Front.png', sku: 'RAM-DDR5-001', type: 'image', size: '2.4 MB', dimensions: '2400x2400', cdnUrl: 'https://cdn.supplybridge.io/assets/ram-ddr5-001-front.png', uploadedAt: '2 hours ago', status: 'synced' },
  { id: 'a2', name: 'RAM-DDR5-TechSpec-Sheet.pdf', sku: 'RAM-DDR5-001', type: 'pdf', size: '4.8 MB', cdnUrl: 'https://cdn.supplybridge.io/docs/ram-ddr5-techspec.pdf', uploadedAt: '1 day ago', status: 'synced' },
  { id: 'a3', name: 'MB-X570-Schematic-CAD.dxf', sku: 'MB-X570-001', type: 'cad', size: '18.2 MB', cdnUrl: 'https://cdn.supplybridge.io/cad/mb-x570-schematic.dxf', uploadedAt: '3 days ago', status: 'synced' },
  { id: 'a4', name: 'TechParts-BrandLogo-Vector.svg', sku: 'GLOBAL-BRAND', type: 'brand', size: '450 KB', dimensions: '1200x800', cdnUrl: 'https://cdn.supplybridge.io/brand/techparts-logo.svg', uploadedAt: '1 week ago', status: 'synced' },
  { id: 'a5', name: 'GPU-RTX4090-Backplate.png', sku: 'GPU-RTX4090-001', type: 'image', size: '3.1 MB', dimensions: '3000x2000', cdnUrl: 'https://cdn.supplybridge.io/assets/gpu-rtx4090-backplane.png', uploadedAt: 'Just now', status: 'pending' },
]

export const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [uploadForm, setUploadForm] = useState({
    sku: 'RAM-DDR5-001',
    name: '',
    type: 'image' as const,
  })

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.sku.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || a.type === typeFilter
    return matchesSearch && matchesType
  })

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAsset: MediaAsset = {
      id: `a-${Date.now()}`,
      name: uploadForm.name || 'Product-Asset-Upload.png',
      sku: uploadForm.sku,
      type: uploadForm.type,
      size: '1.8 MB',
      dimensions: '1920x1080',
      cdnUrl: `https://cdn.supplybridge.io/assets/${uploadForm.sku.toLowerCase()}-upload.png`,
      uploadedAt: 'Just now',
      status: 'synced',
    }
    setAssets(prev => [newAsset, ...prev])
    setUploadModalOpen(false)
    setUploadForm({ sku: 'RAM-DDR5-001', name: '', type: 'image' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Image className="text-amber-500" size={24} /> PIM Media Library
          </h1>
          <p className="page-subtitle">Centralized Product Asset Repository, High-Res Media, CAD & Spec Documentation</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-amber-500/25 cursor-pointer"
        >
          <Upload size={15} /> Upload Media Asset
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">TOTAL ASSETS</span>
            <HardDrive size={16} className="text-amber-500" />
          </div>
          <span className="kpi-value">{assets.length} Assets</span>
          <span className="text-2xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 size={10} /> 100% CDN Edge Synced
          </span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">STORAGE CONSUMPTION</span>
            <FileText size={16} className="text-cyan-500" />
          </div>
          <span className="kpi-value">28.95 GB</span>
          <span className="text-2xs text-slate-500 font-medium">AWS S3 / Cloudflare CDN</span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">PRODUCT IMAGES</span>
            <Image size={16} className="text-emerald-500" />
          </div>
          <span className="kpi-value">{assets.filter(a => a.type === 'image').length}</span>
          <span className="text-2xs text-slate-500 font-medium">WebP & PNG Optimized</span>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between text-slate-500">
            <span className="kpi-label">SPEC DOCUMENTS</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <span className="kpi-value">{assets.filter(a => a.type === 'pdf' || a.type === 'cad').length}</span>
          <span className="text-2xs text-amber-600 font-bold">Tech Specs & CAD Drawings</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search asset filename or SKU identifier..."
            className="input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="select text-xs w-full sm:w-44"
          >
            <option value="all">All Asset Types</option>
            <option value="image">Product Images</option>
            <option value="pdf">PDF Documents</option>
            <option value="cad">CAD / Schematics</option>
            <option value="brand">Brand Logos</option>
          </select>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${viewMode === 'table' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Media Content View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(asset => (
            <div key={asset.id} className="card overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500 transition-all">
              <div className="h-36 bg-slate-900 flex items-center justify-center relative p-3">
                {asset.type === 'image' ? (
                  <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center text-amber-400 font-mono text-xs border border-slate-700">
                    <Image size={32} />
                  </div>
                ) : asset.type === 'pdf' ? (
                  <div className="w-full h-full bg-rose-950/60 rounded-lg flex flex-col items-center justify-center text-rose-400 border border-rose-800/60">
                    <FileText size={32} />
                    <span className="text-2xs font-bold uppercase mt-1">PDF Spec Sheet</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-cyan-950/60 rounded-lg flex flex-col items-center justify-center text-cyan-400 border border-cyan-800/60">
                    <HardDrive size={32} />
                    <span className="text-2xs font-bold uppercase mt-1">{asset.type} Asset</span>
                  </div>
                )}
                <Badge variant={asset.status === 'synced' ? 'success' : 'warning'} className="absolute top-2 right-2 shadow-sm">
                  {asset.status}
                </Badge>
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  <span className="text-2xs font-mono font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                    SKU: {asset.sku}
                  </span>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span>{asset.size}</span>
                  <span>{asset.dimensions || asset.type.toUpperCase()}</span>
                </div>

                <button
                  onClick={() => copyUrl(asset.id, asset.cdnUrl)}
                  className="w-full btn-secondary btn-sm flex items-center justify-center gap-1.5 text-2xs font-bold"
                >
                  {copiedId === asset.id ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedId === asset.id ? 'CDN Link Copied!' : 'Copy CDN URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Asset File</th>
                <th>Master SKU</th>
                <th>Type</th>
                <th>File Size</th>
                <th>CDN Endpoint</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => (
                <tr key={asset.id}>
                  <td>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">{asset.name}</span>
                      <span className="text-2xs text-slate-400">{asset.uploadedAt}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-amber-600 dark:text-amber-400">
                      {asset.sku}
                    </span>
                  </td>
                  <td>
                    <span className="text-2xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono uppercase font-bold">
                      {asset.type}
                    </span>
                  </td>
                  <td><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{asset.size}</span></td>
                  <td>
                    <span className="text-2xs text-slate-400 font-mono truncate max-w-xs block">{asset.cdnUrl}</span>
                  </td>
                  <td>
                    <Badge variant={asset.status === 'synced' ? 'success' : 'warning'} dot>
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => copyUrl(asset.id, asset.cdnUrl)}
                      className="btn-icon"
                      title="Copy CDN Link"
                    >
                      <Link size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Media Asset"
        subtitle="Attach product high-res images, spec sheets or CAD diagrams to master catalog SKU"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="label">Target Master SKU *</label>
            <input
              type="text"
              required
              value={uploadForm.sku}
              onChange={e => setUploadForm({ ...uploadForm, sku: e.target.value })}
              placeholder="e.g. RAM-DDR5-001"
              className="input font-mono"
            />
          </div>

          <div>
            <label className="label">Asset Title / Filename *</label>
            <input
              type="text"
              required
              value={uploadForm.name}
              onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="e.g. RAM-DDR5-Product-Angle.png"
              className="input"
            />
          </div>

          <div>
            <label className="label">Asset Category Type</label>
            <select
              value={uploadForm.type}
              onChange={e => setUploadForm({ ...uploadForm, type: e.target.value as any })}
              className="select"
            >
              <option value="image">Product Image (PNG/WebP)</option>
              <option value="pdf">Technical Spec PDF</option>
              <option value="cad">CAD Schematic File</option>
              <option value="brand">Brand Logo Asset</option>
            </select>
          </div>

          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-900/60">
            <Upload size={28} className="mx-auto text-amber-500 mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop Media Files Here</p>
            <p className="text-2xs text-slate-400 mt-1">Supports PNG, WebP, SVG, PDF & CAD files up to 50MB</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setUploadModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Upload to CDN</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
