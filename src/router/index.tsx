import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Dashboard } from '../features/dashboard/Dashboard'
import { Suppliers } from '../features/suppliers/Suppliers'
import { Integrations } from '../features/integrations/Integrations'
import { MasterCatalog } from '../features/catalog/MasterCatalog'
import { Categories } from '../features/catalog/Categories'
import { Brands } from '../features/catalog/Brands'
import { Variants } from '../features/catalog/Variants'
import { ProductMapping } from '../features/mapping/ProductMapping'
import { ValidationCenter } from '../features/validation/ValidationCenter'
import { InventorySync } from '../features/sync/InventorySync'
import { PricingSync } from '../features/sync/PricingSync'
import { ImageSync } from '../features/sync/ImageSync'
import { StoreManagement } from '../features/stores/StoreManagement'
import { WebsiteSync } from '../features/sync/WebsiteSync'
import { SyncJobs } from '../features/sync/SyncJobs'
import { ImportQueue } from '../features/import/ImportQueue'
import { Logs } from '../features/logs/Logs'
import { Notifications } from '../features/notifications/Notifications'
import { Monitoring } from '../features/monitoring/Monitoring'
import { Reports } from '../features/reports/Reports'
import { Users } from '../features/users/Users'
import { Roles } from '../features/users/Roles'
import { Permissions } from '../features/users/Permissions'
import { Settings } from '../features/settings/Settings'

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="catalog">
          <Route index element={<MasterCatalog />} />
          <Route path="products" element={<MasterCatalog />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="variants" element={<Variants />} />
        </Route>
        <Route path="mapping">
          <Route index element={<ProductMapping />} />
          <Route path="products" element={<ProductMapping />} />
          <Route path="categories" element={<ProductMapping />} />
          <Route path="variants" element={<ProductMapping />} />
          <Route path="suppliers" element={<ProductMapping />} />
        </Route>
        <Route path="validation" element={<ValidationCenter />} />
        <Route path="sync">
          <Route path="inventory" element={<InventorySync />} />
          <Route path="pricing" element={<PricingSync />} />
          <Route path="images" element={<ImageSync />} />
          <Route path="website" element={<WebsiteSync />} />
          <Route path="jobs" element={<SyncJobs />} />
        </Route>
        <Route path="stores" element={<StoreManagement />} />
        <Route path="import-queue" element={<ImportQueue />} />
        <Route path="logs" element={<Logs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
