import React from 'react'
import { Lock, CheckCircle2, XCircle } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'

const MODULES = ['Dashboard', 'Suppliers', 'Integrations', 'Master Catalog', 'Categories', 'Brands', 'Variants', 'Mapping', 'Validation', 'Inventory Sync', 'Pricing Sync', 'Image Sync', 'Store Management', 'Website Sync', 'Sync Jobs', 'Import Queue', 'Logs', 'Monitoring', 'Reports', 'Users', 'Roles', 'Permissions', 'Settings']

const ROLES = ['Super Admin', 'Admin', 'Catalog Manager', 'Integration Manager', 'Operations Staff']

const PERMISSION_MATRIX: Record<string, Record<string, boolean>> = {
  'Dashboard':        { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': true,  'Operations Staff': true },
  'Suppliers':        { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Integrations':     { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Master Catalog':   { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': false, 'Operations Staff': false },
  'Categories':       { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': false, 'Operations Staff': false },
  'Brands':           { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': false, 'Operations Staff': false },
  'Variants':         { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': false, 'Operations Staff': false },
  'Mapping':          { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': true,  'Operations Staff': false },
  'Validation':       { 'Super Admin': true,  'Admin': true,  'Catalog Manager': true,  'Integration Manager': false, 'Operations Staff': true },
  'Inventory Sync':   { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Pricing Sync':     { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Image Sync':       { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Store Management': { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': false },
  'Website Sync':     { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Sync Jobs':        { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Import Queue':     { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': false },
  'Logs':             { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': true,  'Operations Staff': true },
  'Monitoring':       { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': true },
  'Reports':          { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': true },
  'Users':            { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': false },
  'Roles':            { 'Super Admin': true,  'Admin': true,  'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': false },
  'Permissions':      { 'Super Admin': true,  'Admin': false, 'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': false },
  'Settings':         { 'Super Admin': true,  'Admin': false, 'Catalog Manager': false, 'Integration Manager': false, 'Operations Staff': false },
}

export const Permissions: React.FC = () => {
  return (
    <div>
      <SectionHeader
        title="Permissions Matrix"
        subtitle="Role-based access control overview for all platform modules"
      />

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[160px]">Module</th>
                {ROLES.map(role => (
                  <th key={role} className="text-center whitespace-nowrap">
                    <Badge variant={role === 'Super Admin' ? 'purple' : role === 'Admin' ? 'primary' : 'neutral'}>{role}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(module => (
                <tr key={module}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{module}</span>
                    </div>
                  </td>
                  {ROLES.map(role => {
                    const hasAccess = PERMISSION_MATRIX[module]?.[role] ?? false
                    return (
                      <td key={role} className="text-center">
                        {hasAccess
                          ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                          : <XCircle size={16} className="text-slate-200 mx-auto" />
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
