// ─── Shared ──────────────────────────────────────────────
export type Status = 'active' | 'inactive' | 'pending' | 'failed' | 'success' | 'warning' | 'processing' | 'queued' | 'cancelled'
export type ConnectionType = 'api' | 'ftp' | 'sftp' | 'soap' | 'csv' | 'excel' | 'xml'
export type SyncType = 'inventory' | 'pricing' | 'image' | 'website' | 'full'
export type ProductStatus = 'published' | 'unpublished' | 'draft' | 'validation_required' | 'failed'
export type ValidationStatus = 'passed' | 'failed' | 'pending' | 'review'
export type SupplierStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

// ─── Auth / RBAC ─────────────────────────────────────────
export type UserRole = 
  | 'platform_owner'
  | 'administrator'
  | 'catalog_manager'
  | 'integration_manager'
  | 'operations_staff'
  | 'read_only'
  | 'super_admin'
  | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  status: 'active' | 'inactive' | 'invited'
  lastLogin?: string
  createdAt: string
  department?: string
}

export interface Permission {
  id: string
  module: string
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'sync' | 'export'
  roles: UserRole[]
}

export interface Role {
  id: string
  name: string
  slug: UserRole
  description: string
  userCount: number
  permissions: string[]
  createdAt: string
}

// ─── Suppliers ───────────────────────────────────────────
export interface Supplier {
  id: string
  name: string
  code: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  country: string
  connectionType: ConnectionType
  status: SupplierStatus
  productCount: number
  lastSync?: string
  nextSync?: string
  lastSuccessfulSync?: string
  lastFailedSync?: string
  errorCount: number
  createdAt: string
  credentials?: SupplierCredentials
  importHistory?: ImportRecord[]
  tags?: string[]
  feedHealth?: number
  inventoryStatus?: 'healthy' | 'degraded' | 'error'
  pricingStatus?: 'healthy' | 'degraded' | 'error'
  imageStatus?: 'healthy' | 'degraded' | 'error'
  assignedStores?: string[]
}

export interface SupplierCredentials {
  apiUrl?: string
  apiKey?: string
  apiSecret?: string
  ftpHost?: string
  ftpPort?: number
  ftpUsername?: string
  ftpPassword?: string
  soapEndpoint?: string
  soapAction?: string
  filePath?: string
}

export interface ImportRecord {
  id: string
  supplierId: string
  startedAt: string
  completedAt?: string
  status: Status
  productsImported: number
  productsUpdated: number
  productsFailed: number
  errors: string[]
}

// ─── Master Catalog (PIM) ─────────────────────────────────
export interface Product {
  id: string
  sku: string
  masterSku: string
  upc?: string
  masterId?: string
  name: string
  description?: string
  shortDescription?: string
  brand?: string
  brandId?: string
  categoryId?: string
  categoryName?: string
  supplierId: string
  supplierName: string
  supplierSku: string
  status: ProductStatus
  validationStatus: ValidationStatus
  validationScore?: number
  confidenceScore?: number
  isAutoMatched?: boolean
  duplicateDetected?: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  supplierAttributes?: Record<string, string>
  masterAttributes?: Record<string, string>
  pricing: ProductPricing
  inventory: ProductInventory
  seo?: {
    metaTitle: string
    metaDescription: string
    focusKeyword: string
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
  stores: string[]
  mappingHistory?: MappingHistoryItem[]
}

export interface MappingHistoryItem {
  id: string
  timestamp: string
  user: string
  action: string
  previousValue: string
  newValue: string
  reason?: string
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
  syncStatus: 'synced' | 'pending' | 'failed' | 'broken'
  sourceUrl?: string
  position?: number
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  attributes: Record<string, string>
  price: number
  compareAtPrice?: number
  inventory: number
  status: 'active' | 'inactive'
}

export interface ProductAttribute {
  id: string
  name: string
  value: string
  unit?: string
  group?: string
}

export interface ProductPricing {
  supplierPrice: number
  costPrice: number
  retailPrice: number
  wholesalePrice?: number
  mapPrice?: number
  compareAtPrice?: number
  margin: number
  currency: string
  priceRule?: string
  lastUpdated: string
}

export interface ProductInventory {
  supplierStock: number
  warehouseStock: number
  reservedStock: number
  availableStock: number
  totalStock?: number
  lowStockThreshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastSynced: string
}

// ─── Enterprise Mapping Engine Types ────────────────────────

export interface SupplierCategoryNode {
  id: string
  supplierId: string
  code: string
  name: string
  fullPath: string
  productCount: number
  parentId?: string
  children?: SupplierCategoryNode[]
  mappedMasterCategoryId?: string
  mappedMasterCategoryName?: string
  status: 'mapped' | 'unmapped' | 'conflict'
  confidence?: number
}

export interface MasterCategoryNode {
  id: string
  code: string
  name: string
  fullPath: string
  productCount: number
  parentId?: string
  children?: MasterCategoryNode[]
  mappedSupplierCategoriesCount: number
}

export interface VariantType {
  id: string
  name: 'Color' | 'Size' | 'Memory' | 'Storage' | 'Voltage' | 'Length' | 'Width' | 'Height' | 'Material' | 'Region' | 'Language' | 'Model' | string
  values: string[]
  standardizedValues?: Record<string, string>
  productCount: number
  createdAt?: string
}

export interface VariantMappingRule {
  id: string
  variantType: string
  rawSupplierValue: string
  standardizedValue: string
  targetUnit?: string
  conversionFactor?: number
  supplierId?: string
  appliedCount: number
}

export interface AttributeDefinition {
  id: string
  code: string
  name: string
  group: 'General' | 'Physical Specs' | 'Electrical' | 'Packaging' | 'Compliance' | 'Marketing'
  dataType: 'text' | 'number' | 'boolean' | 'select' | 'formula'
  isRequired: boolean
  validationRegex?: string
  lookupValues?: string[]
  defaultUnit?: string
  defaultValue?: string
  formulaExpression?: string
  mappedSupplierFieldsCount: number
  coveragePct: number
}

export interface AttributeFieldMapping {
  id: string
  supplierId: string
  supplierFieldName: string
  masterAttributeId: string
  masterAttributeName: string
  transformationType: 'direct' | 'unit_convert' | 'lookup' | 'formula' | 'default'
  lookupMap?: Record<string, string>
  unitConversion?: { from: string; to: string; factor: number }
  status: 'mapped' | 'pending' | 'error'
  sampleValue?: string
}

export interface MappingRule {
  id: string
  name: string
  priority: number
  isEnabled: boolean
  version: number
  conditions: RuleCondition[]
  actions: RuleAction[]
  appliedCount: number
  lastExecuted?: string
}

export interface RuleCondition {
  field: string // e.g., 'brand', 'category', 'supplier_sku', 'weight'
  operator: 'equals' | 'contains' | 'starts_with' | 'is_empty' | 'greater_than' | 'less_than'
  value: string
}

export interface RuleAction {
  targetField: string
  actionType: 'set_value' | 'map_field' | 'trigger_validation_error' | 'assign_category' | 'convert_unit'
  value: string
}

export interface MappingAuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: UserRole
  module: 'product' | 'category' | 'variant' | 'attribute' | 'supplier'
  entityId: string
  entityName: string
  previousValue: string
  newValue: string
  reason: string
}

export interface SupplierFeedConfig {
  id: string
  supplierId: string
  supplierName: string
  protocol: ConnectionType
  authType: 'api_key' | 'bearer_token' | 'basic_auth' | 'ssh_key' | 'none'
  syncScheduleCron: string
  fieldMappings: AttributeFieldMapping[]
  transformationRulesCount: number
  lastSyncResult: 'success' | 'failed' | 'partial'
  lastSyncTime: string
  healthScore: number
}

// ─── Categories ──────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  description?: string
  productCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

// ─── Brands ──────────────────────────────────────────────
export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  productCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

// ─── Sync Jobs ────────────────────────────────────────────
export interface SyncJob {
  id: string
  name: string
  type: SyncType
  supplierId?: string
  supplierName?: string
  storeId?: string
  storeName?: string
  status: 'running' | 'queued' | 'completed' | 'failed' | 'cancelled'
  progress: number
  totalItems: number
  processedItems: number
  failedItems: number
  startedAt?: string
  completedAt?: string
  scheduledAt?: string
  triggeredBy: string
  logs: string[]
  canRetry: boolean
}

// ─── Validation ───────────────────────────────────────────
export interface ValidationItem {
  id: string
  productId: string
  productName: string
  supplierSku: string
  supplierId: string
  supplierName: string
  errors: ValidationError[]
  status: 'pending' | 'approved' | 'rejected' | 'review'
  assignedTo?: string
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  validationScore?: number
}

export interface ValidationError {
  field: string
  type: 
    | 'missing_image'
    | 'duplicate_sku'
    | 'duplicate_upc'
    | 'invalid_category'
    | 'missing_price'
    | 'missing_inventory'
    | 'missing_brand'
    | 'missing_attribute'
    | 'invalid_variant'
    | 'duplicate_product'
    | 'missing_description'
  message: string
  severity: 'error' | 'warning'
}

// ─── Import Queue ─────────────────────────────────────────
export interface ImportQueueItem {
  id: string
  supplierId: string
  supplierName: string
  connectionType: ConnectionType
  format?: string
  fileName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRecords: number
  processedRecords: number
  failedRecords: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

export type ImportJob = ImportQueueItem

// ─── Stores ───────────────────────────────────────────────
export interface Store {
  id: string
  name: string
  url: string
  platform: string
  status: 'active' | 'inactive' | 'error'
  productCount: number
  syncStatus: 'synced' | 'syncing' | 'failed' | 'pending'
  lastSync?: string
  apiKey?: string
  region?: string
  createdAt: string
}

// ─── Logs ─────────────────────────────────────────────────
export type LogLevel = 'info' | 'warning' | 'error' | 'debug' | 'success'
export type LogType = 'import' | 'sync' | 'api' | 'ftp' | 'soap' | 'validation' | 'audit' | 'system' | 'error'

export interface LogEntry {
  id: string
  type: LogType
  level: LogLevel
  message: string
  details?: string
  supplierId?: string
  supplierName?: string
  jobId?: string
  userId?: string
  userName?: string
  ip?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// ─── Dashboard ────────────────────────────────────────────
export interface DashboardMetrics {
  connectedSuppliers: number
  disconnectedSuppliers: number
  totalSuppliers: number
  totalProducts: number
  pendingProducts: number
  failedProducts: number
  publishedProducts: number
  productsImportedToday: number
  productsReadyToPublish: number
  productsAwaitingReview: number
  duplicateProducts: number
  missingImages: number
  missingPricing: number
  missingCategories: number
  inventoryUpdatedToday: number
  priceChangesToday: number
  newProductsToday: number
  inventorySyncStatus: 'healthy' | 'degraded' | 'critical'
  pricingSyncStatus: 'healthy' | 'degraded' | 'critical'
  imageSyncStatus: 'healthy' | 'degraded' | 'critical'
  runningJobs: number
  completedJobs: number
  failedJobs: number
  queuedJobs: number
  apiStatus: 'operational' | 'degraded' | 'down'
  ftpStatus: 'operational' | 'degraded' | 'down'
  systemHealth: number // 0-100
  queueSize: number
  storesSynced: number
  totalStores: number
}

