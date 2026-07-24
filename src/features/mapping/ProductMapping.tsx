import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Link2, CheckCircle2, AlertCircle, Plus, RefreshCw, Edit2, Trash2, Tag, Layers, Truck, Package, Sliders, Save } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface ProductMappingItem {
  id: string
  supplierSku: string
  supplierName: string
  masterSku: string
  masterName: string
  status: 'mapped' | 'unmapped' | 'review'
  confidence: number
}

interface CategoryMappingItem {
  id: string
  supplierCategory: string
  supplierName: string
  masterCategory: string
  status: 'mapped' | 'unmapped'
}

interface VariantMappingItem {
  id: string
  supplierVariantKey: string
  supplierName: string
  masterVariantDimension: string
  mappedValues: string
  status: 'mapped' | 'unmapped'
}

interface AttributeMappingItem {
  id: string
  supplierAttribute: string
  supplierName: string
  masterAttribute: string
  dataType: string
  status: 'mapped' | 'unmapped'
}

interface SupplierMappingItem {
  id: string
  feedId: string
  supplierName: string
  protocol: string
  assignedEntity: string
  status: 'mapped' | 'unmapped'
}

const INITIAL_PRODUCT_MAPPINGS: ProductMappingItem[] = [
  { id: '1', supplierSku: 'ASUS-ROG-X570-E', supplierName: 'TechParts Int.', masterSku: 'MB-X570-001', masterName: 'AMD X570 ATX Gaming Motherboard', status: 'mapped', confidence: 98 },
  { id: '2', supplierSku: 'CMK32GX5M2B6000C36', supplierName: 'TechParts Int.', masterSku: 'RAM-DDR5-001', masterName: 'DDR5 32GB 6000MHz Gaming RAM Kit', status: 'mapped', confidence: 99 },
  { id: '3', supplierSku: 'ASUS-TUF-4090-OC', supplierName: 'TechParts Int.', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
  { id: '4', supplierSku: 'MZ-V8P2T0B/AM', supplierName: 'GlobalSource Ltd.', masterSku: 'SSD-980P-001', masterName: 'Samsung 980 Pro 2TB NVMe SSD', status: 'mapped', confidence: 96 },
  { id: '5', supplierSku: 'LOG-MX-M3S-GR', supplierName: 'GlobalSource Ltd.', masterSku: 'MOUSE-MX3S-001', masterName: 'Logitech MX Master 3S Wireless', status: 'review', confidence: 72 },
  { id: '6', supplierSku: 'ACME-CMK-50-BLK', supplierName: 'AcmeDistributors', masterSku: '', masterName: '', status: 'unmapped', confidence: 0 },
]

const INITIAL_CATEGORY_MAPPINGS: CategoryMappingItem[] = [
  { id: '1', supplierCategory: 'PC Components > Boards', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Motherboards', status: 'mapped' },
  { id: '2', supplierCategory: 'Memory & Storage > RAM', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Memory (RAM)', status: 'mapped' },
  { id: '3', supplierCategory: 'Peripherals > Input Devices', supplierName: 'GlobalSource Ltd.', masterCategory: 'Electronics > Peripherals', status: 'mapped' },
  { id: '4', supplierCategory: 'Industrial > Cooling', supplierName: 'AcmeDistributors', masterCategory: '', status: 'unmapped' },
]

const INITIAL_VARIANT_MAPPINGS: VariantMappingItem[] = [
  { id: 'v1', supplierVariantKey: 'col_val_hex', supplierName: 'TechParts Int.', masterVariantDimension: 'Color', mappedValues: 'Black, Red, Blue, White', status: 'mapped' },
  { id: 'v2', supplierVariantKey: 'cap_gb_val', supplierName: 'GlobalSource Ltd.', masterVariantDimension: 'Storage Capacity', mappedValues: '128GB, 256GB, 512GB, 1TB', status: 'mapped' },
  { id: 'v3', supplierVariantKey: 'sz_dim_inch', supplierName: 'AcmeDistributors', masterVariantDimension: 'Screen Size', mappedValues: '', status: 'unmapped' },
]

const INITIAL_ATTRIBUTE_MAPPINGS: AttributeMappingItem[] = [
  { id: 'a1', supplierAttribute: 'p_weight_lbs', supplierName: 'TechParts Int.', masterAttribute: 'Weight (lbs)', dataType: 'Number', status: 'mapped' },
  { id: 'a2', supplierAttribute: 'p_warranty_mos', supplierName: 'GlobalSource Ltd.', masterAttribute: 'Warranty Period (Months)', dataType: 'Number', status: 'mapped' },
  { id: 'a3', supplierAttribute: 'pkg_dims_cm', supplierName: 'AcmeDistributors', masterAttribute: 'Package Dimensions', dataType: 'String', status: 'unmapped' },
]

const INITIAL_SUPPLIER_MAPPINGS: SupplierMappingItem[] = [
  { id: 's1', feedId: 'TP-FTP-MAIN', supplierName: 'TechParts Int.', protocol: 'FTP / CSV', assignedEntity: 'TechParts International Inc.', status: 'mapped' },
  { id: 's2', feedId: 'GS-API-REST', supplierName: 'GlobalSource Ltd.', protocol: 'REST API / JSON', assignedEntity: 'GlobalSource Limited LLC', status: 'mapped' },
  { id: 's3', feedId: 'ACME-SFTP-FEED', supplierName: 'AcmeDistributors', protocol: 'SFTP / XML', assignedEntity: '', status: 'unmapped' },
]

export const ProductMapping: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [productMappings, setProductMappings] = useState<ProductMappingItem[]>(INITIAL_PRODUCT_MAPPINGS)
  const [categoryMappings, setCategoryMappings] = useState<CategoryMappingItem[]>(INITIAL_CATEGORY_MAPPINGS)
  const [variantMappings, setVariantMappings] = useState<VariantMappingItem[]>(INITIAL_VARIANT_MAPPINGS)
  const [attributeMappings, setAttributeMappings] = useState<AttributeMappingItem[]>(INITIAL_ATTRIBUTE_MAPPINGS)
  const [supplierMappings, setSupplierMappings] = useState<SupplierMappingItem[]>(INITIAL_SUPPLIER_MAPPINGS)

  // Derive active tab from URL path
  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('/mapping/categories')) return 'categories'
    if (pathname.includes('/mapping/variants')) return 'variants'
    if (pathname.includes('/mapping/attributes')) return 'attributes'
    if (pathname.includes('/mapping/suppliers')) return 'suppliers'
    return 'products'
  }

  const [activeMapping, setActiveMapping] = useState<string>(getTabFromPath(location.pathname))

  useEffect(() => {
    setActiveMapping(getTabFromPath(location.pathname))
  }, [location.pathname])

  const handleTabChange = (tabId: string) => {
    setActiveMapping(tabId)
    const targetPath = tabId === 'products' ? '/mapping/products' : `/mapping/${tabId}`
    navigate(targetPath)
  }

  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [isAutoMapping, setIsAutoMapping] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals state for Editing
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editProductMapping, setEditProductMapping] = useState<ProductMappingItem | null>(null)
  const [editCategoryMapping, setEditCategoryMapping] = useState<CategoryMappingItem | null>(null)
  const [editVariantMapping, setEditVariantMapping] = useState<VariantMappingItem | null>(null)
  const [editAttributeMapping, setEditAttributeMapping] = useState<AttributeMappingItem | null>(null)
  const [editSupplierMapping, setEditSupplierMapping] = useState<SupplierMappingItem | null>(null)

  // Form State
  const [formData, setFormData] = useState<{
    field1: string
    field2: string
    field3?: string
    supplierName: string
    dataType: string
  }>({
    field1: '',
    field2: '',
    field3: '',
    supplierName: 'TechParts Int.',
    dataType: 'String',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Handlers ---
  const handleAutoMap = () => {
    setIsAutoMapping(true)
    setTimeout(() => {
      setProductMappings(prev =>
        prev.map(p =>
          p.status === 'unmapped'
            ? { ...p, masterSku: `MSTR-${p.supplierSku}`, masterName: `Master - ${p.supplierSku}`, status: 'mapped', confidence: 92 }
            : p
        )
      )
      setCategoryMappings(prev =>
        prev.map(c =>
          c.status === 'unmapped' ? { ...c, masterCategory: 'Electronics > General', status: 'mapped' } : c
        )
      )
      setAttributeMappings(prev =>
        prev.map(a =>
          a.status === 'unmapped' ? { ...a, masterAttribute: 'Package Dimensions', status: 'mapped' } : a
        )
      )
      setIsAutoMapping(false)
      showNotification('Auto-mapping complete! High-confidence rules updated across all tabs.')
    }, 1500)
  }

  const handleCreateNewRule = () => {
    if (activeMapping === 'products') {
      const newP: ProductMappingItem = {
        id: `p_${Date.now()}`,
        supplierSku: formData.field1.toUpperCase(),
        supplierName: formData.supplierName,
        masterSku: formData.field2 ? formData.field2.toUpperCase() : `MSTR-${formData.field1}`,
        masterName: 'Mapped Product Item',
        status: formData.field2 ? 'mapped' : 'unmapped',
        confidence: formData.field2 ? 95 : 0,
      }
      setProductMappings([newP, ...productMappings])
    } else if (activeMapping === 'categories') {
      const newC: CategoryMappingItem = {
        id: `c_${Date.now()}`,
        supplierCategory: formData.field1,
        supplierName: formData.supplierName,
        masterCategory: formData.field2 || 'Electronics > General',
        status: 'mapped',
      }
      setCategoryMappings([newC, ...categoryMappings])
    } else if (activeMapping === 'variants') {
      const newV: VariantMappingItem = {
        id: `v_${Date.now()}`,
        supplierVariantKey: formData.field1,
        supplierName: formData.supplierName,
        masterVariantDimension: formData.field2 || 'Dimension Option',
        mappedValues: 'Default',
        status: 'mapped',
      }
      setVariantMappings([newV, ...variantMappings])
    } else if (activeMapping === 'attributes') {
      const newA: AttributeMappingItem = {
        id: `a_${Date.now()}`,
        supplierAttribute: formData.field1,
        supplierName: formData.supplierName,
        masterAttribute: formData.field2 || 'Specification Attribute',
        dataType: formData.dataType || 'String',
        status: 'mapped',
      }
      setAttributeMappings([newA, ...attributeMappings])
    } else if (activeMapping === 'suppliers') {
      const newS: SupplierMappingItem = {
        id: `s_${Date.now()}`,
        feedId: formData.field1,
        supplierName: formData.supplierName,
        protocol: 'FTP / REST',
        assignedEntity: formData.field2 || 'Supplier Entity',
        status: 'mapped',
      }
      setSupplierMappings([newS, ...supplierMappings])
    }

    setAddModalOpen(false)
    showNotification(`New mapping rule created for "${formData.field1}"!`)
  }

  // Save edited product mapping
  const handleSaveProductEdit = () => {
    if (!editProductMapping) return;
    setProductMappings(prev =>
      prev.map(p =>
        p.id === editProductMapping.id
          ? {
              ...p,
              masterSku: formData.field2 || p.masterSku,
              masterName: formData.field3 || p.masterName,
              status: 'mapped',
              confidence: formData.field2 ? 95 : p.confidence,
            }
          : p
      )
    );
    setEditProductMapping(null);
    showNotification(`Product mapping updated for "${editProductMapping.supplierSku}"!`);
  }

  const handleOpenEditAttribute = (m: AttributeMappingItem) => {
    setEditAttributeMapping(m)
    setFormData({
      field1: m.supplierAttribute,
      field2: m.masterAttribute,
      supplierName: m.supplierName,
      dataType: m.dataType,
    })
  }

  const handleSaveAttributeEdit = () => {
    if (!editAttributeMapping) return
    setAttributeMappings(prev =>
      prev.map(a =>
        a.id === editAttributeMapping.id
          ? {
              ...a,
              masterAttribute: formData.field2.trim() || 'General Specification',
              dataType: formData.dataType,
              status: 'mapped',
            }
          : a
      )
    )
    setEditAttributeMapping(null)
    showNotification(`Attribute Mapping rule updated for "${editAttributeMapping.supplierAttribute}"!`)
  }

  const tabs = [
    { id: 'products',   label: 'Product Mapping',  count: productMappings.length },
    { id: 'categories', label: 'Category Mapping',  count: categoryMappings.length },
    { id: 'variants',   label: 'Variant Mapping',   count: variantMappings.length },
    { id: 'attributes', label: 'Attribute Mapping', count: attributeMappings.length },
    { id: 'suppliers',  label: 'Supplier Mapping',  count: supplierMappings.length },
  ]

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    products:   { title: 'Product SKU Mapping', subtitle: 'Map supplier raw product SKUs directly to Master Catalog SKUs' },
    categories: { title: 'Category Tree Mapping', subtitle: 'Map external supplier category structures to PIM Master Category Tree' },
    variants:   { title: 'Variant Dimension Mapping', subtitle: 'Map supplier variant keys (Color, Size, Spec) to PIM Master Dimensions' },
    attributes: { title: 'Attribute Field Mapping', subtitle: 'Map raw feed specification attributes to standardized PIM fields' },
    suppliers:  { title: 'Supplier Feed Mapping', subtitle: 'Connect raw supplier data feeds and protocols to PIM Supplier Entities' },
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title={pageTitles[activeMapping]?.title || 'Product Mapping'}
        subtitle={pageTitles[activeMapping]?.subtitle || 'Manage schema mapping rules'}
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleAutoMap}
              disabled={isAutoMapping}
              className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={isAutoMapping ? 'animate-spin text-primary-600' : ''} />
              {isAutoMapping ? 'Auto-Mapping...' : <><span className="hidden sm:inline">Auto-Map High Confidence</span><span className="sm:hidden">Auto-Map</span></>}
            </button>
            <button
              onClick={() => { setFormData({ field1: '', field2: '', supplierName: 'TechParts Int.', dataType: 'String' }); setAddModalOpen(true); }}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={14} /> Add Mapping Rule
            </button>
          </div>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Product Rules',  value: productMappings.length, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Category Rules', value: categoryMappings.length, color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Variant Rules',  value: variantMappings.length, color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Attribute Rules',value: attributeMappings.length, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card px-3 py-2.5 sm:px-4 sm:py-3 text-center">
            <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-2xs sm:text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={activeMapping} onChange={handleTabChange} />

      <FilterBar search={search} onSearch={setSearch} placeholder={`Search ${activeMapping} mappings...`}>
        <select
          className="select input-sm w-auto min-w-[140px]"
          value={supplierFilter}
          onChange={e => setSupplierFilter(e.target.value)}
        >
          <option value="all">All Suppliers</option>
          <option value="TechParts Int.">TechParts Int.</option>
          <option value="GlobalSource Ltd.">GlobalSource Ltd.</option>
          <option value="AcmeDistributors">AcmeDistributors</option>
        </select>
      </FilterBar>

      {/* --- TAB 1: PRODUCT SKU MAPPING --- */}
      {activeMapping === 'products' && (
        <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Supplier Raw SKU</th>
                  <th className="whitespace-nowrap">Supplier Name</th>
                  <th></th>
                  <th className="whitespace-nowrap">Master Catalog SKU</th>
                  <th className="whitespace-nowrap">Master Product Name</th>
                  <th className="whitespace-nowrap">Confidence</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {productMappings
                  .filter(m => supplierFilter === 'all' || m.supplierName === supplierFilter)
                  .filter(m => m.supplierSku.toLowerCase().includes(search.toLowerCase()) || m.masterSku.toLowerCase().includes(search.toLowerCase()))
                  .map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td data-label="Supplier SKU"><code className="mono font-semibold text-slate-800 dark:text-slate-200">{m.supplierSku}</code></td>
                      <td data-label="Supplier">{m.supplierName}</td>
                      <td className="text-center mobile-hidden"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                      <td data-label="Master SKU">{m.masterSku ? <code className="mono text-primary-700 font-semibold">{m.masterSku}</code> : <span className="text-slate-300 text-xs italic">Not mapped</span>}</td>
                      <td data-label="Product Name"><span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate block max-w-[200px]">{m.masterName || '—'}</span></td>
                      <td data-label="Confidence">
                        {m.confidence > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${m.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.confidence}%` }} />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">{m.confidence}%</span>
                          </div>
                        )}
                      </td>
                      <td data-label="Status"><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                      <td data-label="" className="text-right mobile-full">
                        <button
                          onClick={() => {
                            setEditProductMapping(m);
                            setFormData({ field1: m.supplierSku, field2: m.masterSku, field3: m.masterName || '', supplierName: m.supplierName, dataType: 'String' });
                          }}
                          className={`${m.status === 'unmapped' ? 'btn-primary' : 'btn-secondary'} btn-sm w-full md:w-auto`}
                        >
                          {m.status === 'unmapped' ? 'Map Now' : 'Edit Mapping'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CATEGORY MAPPING --- */}
      {activeMapping === 'categories' && (
        <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Supplier Category Path</th>
                  <th className="whitespace-nowrap">Supplier</th>
                  <th></th>
                  <th className="whitespace-nowrap">Target Master Category</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryMappings.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Category"><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.supplierCategory}</span></td>
                    <td data-label="Supplier">{m.supplierName}</td>
                    <td className="text-center mobile-hidden"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                    <td data-label="Master Category"><span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{m.masterCategory || <span className="text-slate-300 italic">Not mapped</span>}</span></td>
                    <td data-label="Status"><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td data-label="" className="text-right mobile-full">
                      <button
                        onClick={() => {
                          setEditCategoryMapping(m)
                          setFormData({ field1: m.supplierCategory, field2: m.masterCategory, supplierName: m.supplierName, dataType: 'String' })
                        }}
                        className={`${m.status === 'unmapped' ? 'btn-primary' : 'btn-secondary'} btn-sm w-full md:w-auto`}
                      >
                        {m.status === 'unmapped' ? 'Map Category' : 'Edit Target'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: VARIANT MAPPING --- */}
      {activeMapping === 'variants' && (
        <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Supplier Variant Key</th>
                  <th className="whitespace-nowrap">Supplier</th>
                  <th></th>
                  <th className="whitespace-nowrap">Master Variant Dimension</th>
                  <th className="whitespace-nowrap">Mapped Values</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {variantMappings.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Variant Key"><code className="mono font-semibold text-slate-800 dark:text-slate-200">{m.supplierVariantKey}</code></td>
                    <td data-label="Supplier">{m.supplierName}</td>
                    <td className="text-center mobile-hidden"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                    <td data-label="Dimension"><span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{m.masterVariantDimension}</span></td>
                    <td data-label="Mapped Values"><span className="text-xs text-slate-600 font-mono">{m.mappedValues || '—'}</span></td>
                    <td data-label="Status"><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td data-label="" className="text-right mobile-full">
                      <button
                        onClick={() => {
                          setEditVariantMapping(m)
                          setFormData({ field1: m.supplierVariantKey, field2: m.masterVariantDimension, supplierName: m.supplierName, dataType: 'String' })
                        }}
                        className={`${m.status === 'unmapped' ? 'btn-primary' : 'btn-secondary'} btn-sm w-full md:w-auto`}
                      >
                        {m.status === 'unmapped' ? 'Map Variant' : 'Edit Dimension'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: ATTRIBUTE MAPPING --- */}
      {activeMapping === 'attributes' && (
        <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Supplier Feed Attribute</th>
                  <th className="whitespace-nowrap">Supplier</th>
                  <th></th>
                  <th className="whitespace-nowrap">PIM Master Specification Field</th>
                  <th className="whitespace-nowrap">Data Type</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {attributeMappings.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Attribute"><code className="mono font-bold text-slate-800 dark:text-slate-200">{m.supplierAttribute}</code></td>
                    <td data-label="Supplier">{m.supplierName}</td>
                    <td className="text-center mobile-hidden"><ArrowLeftRight size={14} className="text-slate-400 mx-auto" /></td>
                    <td data-label="Master Field"><span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{m.masterAttribute}</span></td>
                    <td data-label="Type"><Badge variant="neutral">{m.dataType}</Badge></td>
                    <td data-label="Status"><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td data-label="" className="text-right mobile-full">
                      <button
                        onClick={() => handleOpenEditAttribute(m)}
                        className={`${m.status === 'unmapped' ? 'btn-primary' : 'btn-secondary'} btn-sm font-bold cursor-pointer w-full md:w-auto`}
                      >
                        {m.status === 'unmapped' ? 'Map Attribute' : 'Edit Rule'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: SUPPLIER FEED MAPPING --- */}
      {activeMapping === 'suppliers' && (
        <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Supplier Feed Identifier</th>
                  <th className="whitespace-nowrap">Supplier Source</th>
                  <th className="whitespace-nowrap">Protocol / Format</th>
                  <th className="whitespace-nowrap">Assigned PIM Supplier Entity</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {supplierMappings.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Feed ID"><code className="mono font-semibold text-slate-800 dark:text-slate-200">{m.feedId}</code></td>
                    <td data-label="Supplier">{m.supplierName}</td>
                    <td data-label="Protocol"><Badge variant="info">{m.protocol}</Badge></td>
                    <td data-label="Entity"><span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{m.assignedEntity || <span className="text-slate-300 italic">Unassigned</span>}</span></td>
                    <td data-label="Status"><Badge variant={m.status === 'mapped' ? 'success' : 'danger'}>{m.status}</Badge></td>
                    <td data-label="" className="text-right mobile-full">
                      <button
                        onClick={() => {
                          setEditSupplierMapping(m)
                          setFormData({ field1: m.feedId, field2: m.assignedEntity, supplierName: m.supplierName, dataType: 'String' })
                        }}
                        className={`${m.status === 'unmapped' ? 'btn-primary' : 'btn-secondary'} btn-sm w-full md:w-auto`}
                      >
                        {m.status === 'unmapped' ? 'Assign Entity' : 'Edit Feed Link'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD MAPPING RULE MODAL --- */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Add ${pageTitles[activeMapping]?.title || 'Mapping Rule'}`}
        subtitle={`Define a new translation rule for ${activeMapping}`}
        size="md"
        footer={
          <>
            <button onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateNewRule} className="btn-primary flex items-center gap-1.5 font-bold cursor-pointer"><Save size={14} /> Save Mapping Rule</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Partner *</label>
            <select
              className="select"
              value={formData.supplierName}
              onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
            >
              <option value="TechParts Int.">TechParts Int.</option>
              <option value="GlobalSource Ltd.">GlobalSource Ltd.</option>
              <option value="AcmeDistributors">AcmeDistributors</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {activeMapping === 'products' ? 'Supplier Raw SKU *' : activeMapping === 'categories' ? 'Supplier Category Path *' : activeMapping === 'variants' ? 'Supplier Variant Key *' : activeMapping === 'attributes' ? 'Supplier Raw Feed Attribute *' : 'Feed Identifier *'}
            </label>
            <input
              className="input font-mono"
              placeholder="e.g. p_weight_lbs or pkg_dims_cm"
              value={formData.field1}
              onChange={e => setFormData({ ...formData, field1: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {activeMapping === 'products' ? 'Target Master SKU' : activeMapping === 'categories' ? 'Target PIM Master Category' : activeMapping === 'variants' ? 'Target Variant Dimension' : activeMapping === 'attributes' ? 'Target PIM Specification Field' : 'Assigned PIM Supplier Entity'}
            </label>
            <input
              className="input font-mono"
              placeholder="e.g. Weight (lbs) or Dimensions"
              value={formData.field2}
              onChange={e => setFormData({ ...formData, field2: e.target.value })}
            />
          </div>

          {activeMapping === 'attributes' && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Data Type</label>
              <select
                className="select"
                value={formData.dataType}
                onChange={e => setFormData({ ...formData, dataType: e.target.value })}
              >
                <option value="String">String / Text</option>
                <option value="Number">Number / Integer</option>
                <option value="Float">Float / Decimal</option>
                <option value="Boolean">Boolean (True/False)</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* --- EDIT PRODUCT MAPPING MODAL --- */}
      {editProductMapping && (
        <Modal
          open={true}
          onClose={() => setEditProductMapping(null)}
          title={`Edit Product Mapping: ${editProductMapping.supplierSku}`}
          subtitle={`Supplier: ${editProductMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditProductMapping(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveProductEdit} className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                <Save size={14} /> Save Product Mapping
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Raw SKU *</label>
              <input className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" value={formData.field1} readOnly />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Master SKU</label>
              <input className="input font-mono" value={formData.field2} onChange={e => setFormData({ ...formData, field2: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Product Name</label>
              <input className="input" placeholder="Enter product name" value={formData.field3 || ''} onChange={e => setFormData({ ...formData, field3: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}

      {/* --- EDIT ATTRIBUTE MAPPING MODAL --- */}
      {editAttributeMapping && (
        <Modal
          open
          onClose={() => setEditAttributeMapping(null)}
          title={`Edit Attribute Mapping: ${editAttributeMapping.supplierAttribute}`}
          subtitle={`Supplier: ${editAttributeMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditAttributeMapping(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveAttributeEdit} className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-500/20 font-bold cursor-pointer">
                <Save size={14} /> Save Attribute Mapping
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Feed Attribute (Raw)</label>
              <input className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" readOnly value={editAttributeMapping.supplierAttribute} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">PIM Master Specification Field *</label>
              <input
                className="input font-semibold"
                placeholder="e.g. Weight (lbs) or Dimensions"
                value={formData.field2}
                onChange={e => setFormData({ ...formData, field2: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Attribute Data Type</label>
              <select
                className="select"
                value={formData.dataType}
                onChange={e => setFormData({ ...formData, dataType: e.target.value })}
              >
                <option value="String">String / Text</option>
                <option value="Number">Number / Integer</option>
                <option value="Float">Float / Decimal</option>
                <option value="Boolean">Boolean (True/False)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* --- EDIT CATEGORY MAPPING MODAL --- */}
      {editCategoryMapping && (
        <Modal
          open
          onClose={() => setEditCategoryMapping(null)}
          title={`Edit Category Mapping: ${editCategoryMapping.supplierCategory}`}
          subtitle={`Supplier: ${editCategoryMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditCategoryMapping(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  setCategoryMappings(prev =>
                    prev.map(c => c.id === editCategoryMapping.id ? { ...c, masterCategory: formData.field2, status: 'mapped' } : c)
                  )
                  setEditCategoryMapping(null)
                  showNotification(`Category mapping saved for "${editCategoryMapping.supplierCategory}"`)
                }}
                className="btn-primary flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Save size={14} /> Save Category Mapping
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Raw Category Path</label>
              <input className="input bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" readOnly value={editCategoryMapping.supplierCategory} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target PIM Master Category *</label>
              <input
                className="input font-semibold"
                placeholder="e.g. Electronics > Computers > Motherboards"
                value={formData.field2}
                onChange={e => setFormData({ ...formData, field2: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* --- EDIT VARIANT MAPPING MODAL --- */}
      {editVariantMapping && (
        <Modal
          open
          onClose={() => setEditVariantMapping(null)}
          title={`Edit Variant Mapping: ${editVariantMapping.supplierVariantKey}`}
          subtitle={`Supplier: ${editVariantMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditVariantMapping(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  setVariantMappings(prev =>
                    prev.map(v =>
                      v.id === editVariantMapping.id
                        ? { ...v, masterVariantDimension: formData.field2, status: 'mapped' }
                        : v
                    )
                  )
                  setEditVariantMapping(null)
                  showNotification(`Variant mapping saved for "${editVariantMapping.supplierVariantKey}"`)
                }}
                className="btn-primary flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Save size={14} /> Save Variant Mapping
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Variant Key</label>
              <input className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" readOnly value={editVariantMapping.supplierVariantKey} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Master Variant Dimension *</label>
              <input
                className="input font-semibold"
                placeholder="e.g. Color, Storage Capacity, Size"
                value={formData.field2}
                onChange={e => setFormData({ ...formData, field2: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* --- EDIT SUPPLIER MAPPING MODAL --- */}
      {editSupplierMapping && (
        <Modal
          open
          onClose={() => setEditSupplierMapping(null)}
          title={`Edit Supplier Feed Link: ${editSupplierMapping.feedId}`}
          subtitle={`Supplier Source: ${editSupplierMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditSupplierMapping(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  setSupplierMappings(prev =>
                    prev.map(s =>
                      s.id === editSupplierMapping.id
                        ? { ...s, assignedEntity: formData.field2, status: 'mapped' }
                        : s
                    )
                  )
                  setEditSupplierMapping(null)
                  showNotification(`Supplier feed link saved for "${editSupplierMapping.feedId}"`)
                }}
                className="btn-primary flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Save size={14} /> Save Feed Link
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Feed Identifier</label>
              <input className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" readOnly value={editSupplierMapping.feedId} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Assigned PIM Supplier Entity *</label>
              <input
                className="input font-semibold"
                placeholder="e.g. TechParts International Inc."
                value={formData.field2}
                onChange={e => setFormData({ ...formData, field2: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* --- EDIT PRODUCT MAPPING MODAL --- */}
      {editProductMapping && (
        <Modal
          open
          onClose={() => setEditProductMapping(null)}
          title={editProductMapping.status === 'unmapped' ? 'Map Product SKU' : 'Edit Product Mapping'}
          subtitle={`Supplier: ${editProductMapping.supplierName}`}
          size="md"
          footer={
            <>
              <button onClick={() => setEditProductMapping(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  setProductMappings(prev =>
                    prev.map(p =>
                      p.id === editProductMapping.id
                        ? {
                            ...p,
                            masterSku: formData.field2.toUpperCase(),
                            masterName: formData.field3 || 'Mapped Product Item',
                            status: formData.field2 ? 'mapped' : 'unmapped',
                            confidence: p.confidence || 95
                          }
                        : p
                    )
                  )
                  setEditProductMapping(null)
                  showNotification(`Product mapping saved for "${editProductMapping.supplierSku}"`)
                }}
                className="btn-primary flex items-center gap-1.5"
              >
                <Save size={14} /> Save Product Mapping
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Product SKU (Raw)</label>
              <input className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" readOnly value={editProductMapping.supplierSku} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Master SKU *</label>
              <input
                className="input font-mono font-semibold"
                placeholder="e.g. MB-X570-001"
                value={formData.field2}
                onChange={e => setFormData({ ...formData, field2: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Master Product Name</label>
              <input
                className="input font-semibold"
                placeholder="e.g. AMD X570 ATX Gaming Motherboard"
                value={formData.field3 || ''}
                onChange={e => setFormData({ ...formData, field3: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
