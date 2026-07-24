import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'

interface AuthContextType {
  currentUser: User
  role: UserRole
  setRole: (role: UserRole) => void
  hasPermission: (module: string) => boolean
}

const rolePermissions: Record<UserRole, string[]> = {
  super_admin:         ['*'],
  admin:               ['dashboard', 'suppliers', 'integrations', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation', 'inventory_sync', 'pricing_sync', 'image_sync', 'store_management', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'monitoring', 'reports', 'users', 'roles', 'permissions'],
  catalog_manager:     ['dashboard', 'catalog', 'products', 'categories', 'brands', 'variants', 'mapping', 'validation'],
  integration_manager: ['dashboard', 'suppliers', 'integrations', 'mapping', 'inventory_sync', 'pricing_sync', 'image_sync', 'website_sync', 'sync_jobs', 'import_queue', 'logs'],
  operations_staff:    ['dashboard', 'validation', 'monitoring', 'reports', 'logs'],
}

const demoUsers: Record<UserRole, User> = {
  super_admin:         { id: 'u1', name: 'Alex Morrison', email: 'alex@supplybridge.io', role: 'super_admin', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  admin:               { id: 'u2', name: 'Sarah Kim', email: 'sarah@supplybridge.io', role: 'admin', status: 'active', createdAt: '2024-02-15T00:00:00Z' },
  catalog_manager:     { id: 'u3', name: 'James Patel', email: 'jpatel@supplybridge.io', role: 'catalog_manager', status: 'active', createdAt: '2024-04-01T00:00:00Z' },
  integration_manager: { id: 'u4', name: 'Emily Chen', email: 'echen@supplybridge.io', role: 'integration_manager', status: 'active', createdAt: '2024-05-10T00:00:00Z' },
  operations_staff:    { id: 'u5', name: 'Marcus Johnson', email: 'mjohnson@supplybridge.io', role: 'operations_staff', status: 'active', createdAt: '2024-07-20T00:00:00Z' },
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('super_admin')

  const hasPermission = (module: string): boolean => {
    const perms = rolePermissions[role]
    return perms.includes('*') || perms.includes(module)
  }

  return (
    <AuthContext.Provider value={{ currentUser: demoUsers[role], role, setRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
