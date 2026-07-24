import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Trash2,
  UploadCloud,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Check
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { SectionHeader, FilterBar, Tabs, ConfirmDialog } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { mockProducts } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { Product, ProductStatus, ValidationStatus } from '../../types'

import { useAuth } from '../../context/AuthContext'

export const MasterCatalog: React.FC = () => {
  const { role } = useAuth()
  const canManageCatalog = role === 'super_admin' || role === 'admin' || role === 'catalog_manager'
  const canDelete = role === 'super_admin' || role === 'admin'
  const [productsList, setProductsList] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    brand: '',
    categoryName: '',
    supplierName: 'TechParts International',
    retailPrice: 99.99,
    costPrice: 65.0,
    stock: 50,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Filtering ---
  const filtered = productsList.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))

    const matchTab =
      tab === 'all'
        ? true
        : tab === 'published'
        ? p.status === 'published'
        : tab === 'validation_required'
        ? p.validationStatus === 'failed' || p.status === 'validation_required'
        : tab === 'draft'
        ? p.status === 'draft'
        : tab === 'failed'
        ? p.status === 'failed' || p.validationStatus === 'failed'
        : true

    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSupplier =
      supplierFilter === 'all' || p.supplierId === supplierFilter

    return matchSearch && matchTab && matchStatus && matchSupplier
  })

  // Dynamic Tabs Count
  const tabs = [
    { id: 'all', label: 'All Products', count: productsList.length },
    { id: 'published', label: 'Published', count: productsList.filter(p => p.status === 'published').length },
    { id: 'validation_required', label: 'Needs Validation', count: productsList.filter(p => p.validationStatus === 'failed').length },
    { id: 'draft', label: 'Draft', count: productsList.filter(p => p.status === 'draft').length },
    { id: 'failed', label: 'Failed', count: productsList.filter(p => p.status === 'failed').length },
  ]

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // --- Selection Handlers ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // --- Bulk Handlers ---
  const handleBulkPublish = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one product.')
      return
    }
    setProductsList(prev =>
      prev.map(p =>
        selectedIds.includes(p.id)
          ? { ...p, status: 'published', validationStatus: 'passed' }
          : p
      )
    )
    showNotification(`${selectedIds.length} products published successfully!`)
    setSelectedIds([])
  }

  const handleBulkValidate = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one product.')
      return
    }
    setProductsList(prev =>
      prev.map(p =>
        selectedIds.includes(p.id)
          ? { ...p, validationStatus: 'passed' }
          : p
      )
    )
    showNotification(`Validation passed for ${selectedIds.length} products!`)
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one product.')
      return
    }
    setDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = () => {
    setProductsList(prev => prev.filter(p => !selectedIds.includes(p.id)))
    showNotification(`${selectedIds.length} products deleted.`)
    setSelectedIds([])
    setDeleteConfirmOpen(false)
  }

  // --- Create Product Handler ---
  const handleCreateProduct = () => {
    if (!newProduct.name.trim() || !newProduct.sku.trim()) {
      alert('Please enter Product Name and SKU.')
      return
    }

    const created: Product = {
      id: `p_${Date.now()}`,
      sku: newProduct.sku.toUpperCase(),
      masterSku: newProduct.sku.toUpperCase(),
      supplierSku: newProduct.sku.toUpperCase(),
      name: newProduct.name,
      description: 'Master Catalog Product',
      brand: newProduct.brand || 'Generic',
      categoryId: 'cat1',
      categoryName: newProduct.categoryName || 'General Hardware',
      supplierId: 's1',
      supplierName: newProduct.supplierName,
      pricing: {
        supplierPrice: Number(newProduct.costPrice),
        costPrice: Number(newProduct.costPrice),
        wholesalePrice: Number(newProduct.costPrice) * 1.2,
        retailPrice: Number(newProduct.retailPrice),
        mapPrice: Number(newProduct.retailPrice),
        currency: 'USD',
        margin:
          ((Number(newProduct.retailPrice) - Number(newProduct.costPrice)) /
            Number(newProduct.retailPrice)) *
          100,
        lastUpdated: new Date().toISOString(),
      },
      inventory: {
        supplierStock: Number(newProduct.stock),
        warehouseStock: Number(newProduct.stock),
        totalStock: Number(newProduct.stock),
        availableStock: Number(newProduct.stock),
        reservedStock: 0,
        lowStockThreshold: 10,
        status: Number(newProduct.stock) > 0 ? 'in_stock' : 'out_of_stock',
        lastSynced: new Date().toISOString(),
      },
      seo: {
        metaTitle: newProduct.metaTitle,
        metaDescription: newProduct.metaDescription,
        focusKeyword: newProduct.focusKeyword,
      },
      status: 'published',
      validationStatus: 'passed',
      images: [
        {
          id: 'img1',
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
          isPrimary: true,
          syncStatus: 'synced',
          position: 0,
        },
      ],
      attributes: [],
      variants: [],
      stores: ['store1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setProductsList([created, ...productsList])
    setAddModalOpen(false)
    setNewProduct({
      name: '',
      sku: '',
      brand: '',
      categoryName: '',
      supplierName: 'TechParts International',
      retailPrice: 99.99,
      costPrice: 65.0,
      stock: 50,
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
    })
    showNotification(`Product "${created.name}" created successfully!`)
  }

  // --- Save Edit Product ---
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setNewProduct({
      name: p.name,
      sku: p.sku,
      brand: p.brand || '',
      categoryName: p.categoryName || '',
      supplierName: p.supplierName,
      retailPrice: p.pricing.retailPrice,
      costPrice: p.pricing.costPrice,
      stock: p.inventory.availableStock,
      metaTitle: p.seo?.metaTitle || '',
      metaDescription: p.seo?.metaDescription || '',
      focusKeyword: p.seo?.focusKeyword || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingProduct) return
    setProductsList(prev =>
      prev.map(p => {
        if (p.id === editingProduct.id) {
          const ret = Number(newProduct.retailPrice)
          const cost = Number(newProduct.costPrice)
          return {
            ...p,
            name: newSupplierVal(newProduct.name, p.name),
            sku: newProduct.sku.toUpperCase(),
            brand: newProduct.brand,
            categoryName: newProduct.categoryName,
            pricing: {
              ...p.pricing,
              retailPrice: ret,
              costPrice: cost,
              margin: ((ret - cost) / ret) * 100,
            },
            inventory: {
              ...p.inventory,
              availableStock: Number(newProduct.stock),
              totalStock: Number(newProduct.stock),
              status: Number(newProduct.stock) > 0 ? 'in_stock' : 'out_of_stock',
            },
            seo: {
              metaTitle: newProduct.metaTitle,
              metaDescription: newProduct.metaDescription,
              focusKeyword: newProduct.focusKeyword,
            },
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
    )
    setEditModalOpen(false)
    setEditingProduct(null)
    showNotification(`Product "${newProduct.name}" updated successfully!`)
  }

  const newSupplierVal = (val: string, fallback: string) => (val.trim() ? val : fallback)

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
        title="Master Catalog"
        subtitle="Single source of truth for all product data across suppliers and stores"
        actions={
          <>
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setSupplierFilter('all')
                showNotification('Filters reset.')
              }}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Filter size={14} /> Reset Filters
            </button>
            {canManageCatalog && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Product
              </button>
            )}
          </>
        }
      />

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: productsList.length.toLocaleString(), color: 'text-slate-800' },
          { label: 'Published', value: productsList.filter(p => p.status === 'published').length.toLocaleString(), color: 'text-emerald-600' },
          { label: 'Needs Validation', value: productsList.filter(p => p.validationStatus === 'failed').length.toLocaleString(), color: 'text-amber-600' },
          { label: 'Failed', value: productsList.filter(p => p.status === 'failed').length.toLocaleString(), color: 'text-rose-600' },
          { label: 'Suppliers', value: '27', color: 'text-primary-600' },
          { label: 'Stores', value: '7', color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <FilterBar search={search} onSearch={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search by product name, SKU, or brand...">
        <select
          className="select input-sm w-auto min-w-[130px]"
          value={supplierFilter}
          onChange={e => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">All Suppliers</option>
          <option value="s1">TechParts International</option>
          <option value="s2">GlobalSource Limited</option>
          <option value="s3">PrimeSupply Corp</option>
        </select>
        <select
          className="select input-sm w-auto min-w-[120px]"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="validation_required">Needs Review</option>
          <option value="draft">Draft</option>
          <option value="failed">Failed</option>
        </select>
      </FilterBar>

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          checked={
            paginatedProducts.length > 0 &&
            paginatedProducts.every(p => selectedIds.includes(p.id))
          }
          onChange={e => handleSelectAll(e.target.checked)}
        />
        <span className="text-xs font-semibold text-slate-700">
          Select Page ({selectedIds.length} selected)
        </span>
        <div className="h-4 w-px bg-slate-300 mx-1" />
        <button
          onClick={handleBulkPublish}
          className="btn-ghost btn-sm text-emerald-700 hover:bg-emerald-50 font-semibold"
        >
          Bulk Publish
        </button>
        <button
          onClick={handleBulkValidate}
          className="btn-ghost btn-sm text-amber-700 hover:bg-amber-50 font-semibold"
        >
          Bulk Validate
        </button>
        <button
          onClick={handleBulkDelete}
          className="btn-ghost btn-sm text-rose-700 hover:bg-rose-50 font-semibold"
        >
          Bulk Delete
        </button>
      </div>

      {/* Product Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-8">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every(p => selectedIds.includes(p.id))
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Validation</th>
                <th>Updated</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
              {paginatedProducts.map(product => {
                const isSelected = selectedIds.includes(product.id)

                return (
                  <tr
                    key={product.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary-50/40' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setViewProduct(product)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={isSelected}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm max-w-[200px] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.brand || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="mono text-xs">{product.sku}</code>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">
                        {product.supplierName}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">
                        {product.categoryName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800">
                        ${product.pricing.retailPrice.toFixed(2)}
                      </span>
                      <span className="text-2xs text-emerald-600 ml-1 font-semibold">
                        +{product.pricing.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <Badge variant={statusToVariant(product.inventory.status)}>
                        {product.inventory.availableStock.toLocaleString()}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={statusToVariant(product.status)}>
                        {product.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={statusToVariant(product.validationStatus)}>
                        {product.validationStatus}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">
                        {timeAgo(product.updatedAt)}
                      </span>
                    </td>
                    <td className="text-center">
                      <div
                        className="flex items-center justify-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setViewProduct(product)}
                          className="btn-icon"
                          title="View Product"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="btn-icon"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Working Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{paginatedProducts.length}</span> of <span className="font-semibold text-slate-800">{filtered.length}</span> products (Page {currentPage} of {totalPages})
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-slate-400 font-semibold uppercase">Rows:</span>
              <select
                className="select input-sm w-auto py-1 text-xs"
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary btn-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="btn-secondary btn-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Master Product"
        subtitle="Create a new SKU in the centralized PIM catalog"
        size="lg"
        footer={
          <>
            <button onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateProduct} className="btn-primary">Create Product</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Product Title *</label>
              <input
                className="input"
                placeholder="e.g. UltraFast SSD Drive 2TB"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Master SKU *</label>
              <input
                className="input uppercase"
                placeholder="e.g. TPI-SSD-2000"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand</label>
              <input
                className="input"
                placeholder="Brand Name"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
              <input
                className="input"
                placeholder="Category"
                value={newProduct.categoryName}
                onChange={e => setNewProduct({ ...newProduct, categoryName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Retail Price ($)</label>
              <input
                className="input"
                type="number"
                value={newProduct.retailPrice}
                onChange={e => setNewProduct({ ...newProduct, retailPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cost Price ($)</label>
              <input
                className="input"
                type="number"
                value={newProduct.costPrice}
                onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Initial Stock</label>
              <input
                className="input"
                type="number"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">SEO & Metadata</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Title</label>
                <input
                  className="input"
                  placeholder="SEO Title (leave empty to use product name)"
                  value={newProduct.metaTitle}
                  onChange={e => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Focus Keyword</label>
                <input
                  className="input"
                  placeholder="e.g. SSD, Motherboard"
                  value={newProduct.focusKeyword}
                  onChange={e => setNewProduct({ ...newProduct, focusKeyword: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Description</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Brief summary for search engine snippet..."
                value={newProduct.metaDescription}
                onChange={e => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* --- EDIT PRODUCT MODAL --- */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Master Product"
        subtitle={`Updating SKU: ${editingProduct?.sku}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Product Title</label>
              <input
                className="input"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Master SKU</label>
              <input
                className="input uppercase"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Retail Price ($)</label>
              <input
                className="input"
                type="number"
                value={newProduct.retailPrice}
                onChange={e => setNewProduct({ ...newProduct, retailPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cost Price ($)</label>
              <input
                className="input"
                type="number"
                value={newProduct.costPrice}
                onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Available Stock</label>
              <input
                className="input"
                type="number"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">SEO & Metadata</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Title</label>
                <input
                  className="input"
                  placeholder="SEO Title (leave empty to use product name)"
                  value={newProduct.metaTitle}
                  onChange={e => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Focus Keyword</label>
                <input
                  className="input"
                  placeholder="e.g. SSD, Motherboard"
                  value={newProduct.focusKeyword}
                  onChange={e => setNewProduct({ ...newProduct, focusKeyword: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Description</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Brief summary for search engine snippet..."
                value={newProduct.metaDescription}
                onChange={e => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM BULK DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedIds.length} selected products from the Master Catalog?`}
        confirmLabel="Yes, Delete Products"
        danger
      />

      {/* --- PRODUCT DETAIL DRAWER / MODAL --- */}
      {viewProduct && (
        <Modal
          open
          title={viewProduct.name}
          subtitle={`SKU: ${viewProduct.sku} · Supplier: ${viewProduct.supplierName}`}
          onClose={() => setViewProduct(null)}
          size="xl"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {viewProduct.images.length > 0 ? (
                  <img src={viewProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">{viewProduct.name}</h4>
                <p className="text-xs text-slate-500">
                  Category: <span className="font-semibold text-slate-700">{viewProduct.categoryName || 'General'}</span> | Brand: <span className="font-semibold text-slate-700">{viewProduct.brand || 'Generic'}</span>
                </p>
              </div>
              <Badge variant={statusToVariant(viewProduct.status)}>
                {viewProduct.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Retail Price</p>
                <p className="text-lg font-bold text-slate-900">${viewProduct.pricing.retailPrice.toFixed(2)}</p>
                <p className="text-xs text-emerald-600 font-semibold">+{viewProduct.pricing.margin.toFixed(1)}% Margin</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Cost Price</p>
                <p className="text-lg font-bold text-slate-900">${viewProduct.pricing.costPrice.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Available Stock</p>
                <p className="text-lg font-bold text-slate-900">{viewProduct.inventory.availableStock.toLocaleString()} units</p>
              </div>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-2xs">Google Search Engine Preview</p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-sans">
                <p className="text-xs text-slate-400 font-mono truncate">https://pim.supplybridge.com/products/{viewProduct.sku.toLowerCase()}</p>
                <p className="text-sm text-blue-800 font-medium hover:underline cursor-pointer truncate">
                  {viewProduct.seo?.metaTitle || viewProduct.name}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                  {viewProduct.seo?.metaDescription || viewProduct.description || 'No search description added yet. Edit metadata to improve search visibility.'}
                </p>
                {viewProduct.seo?.focusKeyword && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Keyword: {viewProduct.seo.focusKeyword}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-2xs">Publishing & Channel Assignments</p>
              <div className="flex gap-2">
                <Badge variant="purple">Shift4Shop US Store</Badge>
                <Badge variant="info">Shift4Shop EU Store</Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
