import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Users, UserCog, Shield, CheckCircle2, Lock, Save, X } from 'lucide-react'
import { SectionHeader, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockRoles } from '../../data/mockData'
import type { Role } from '../../types'

const ALL_MODULES = [
  'Dashboard', 'Suppliers', 'Integrations', 'Master Catalog', 'Categories', 'Brands',
  'Variants', 'Mapping', 'Validation', 'Inventory Sync', 'Pricing Sync', 'Image Sync',
  'Store Management', 'Website Sync', 'Sync Jobs', 'Import Queue', 'Logs', 'Monitoring',
  'Reports', 'Users', 'Roles', 'Permissions', 'Settings'
]

export const Roles: React.FC = () => {
  const [rolesList, setRolesList] = useState<Role[]>(mockRoles)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Role | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form states for Create / Edit
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPerms, setFormPerms] = useState<string[]>([])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleOpenCreate = () => {
    setFormName('')
    setFormDesc('')
    setFormPerms(['dashboard'])
    setCreateOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role)
    setFormName(role.name)
    setFormDesc(role.description)
    setFormPerms(role.permissions)
    setEditOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const slug = formName.toLowerCase().replace(/[^a-z0-9]/g, '_') as any
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: formName.trim(),
      slug: slug,
      description: formDesc.trim() || 'Custom platform role',
      userCount: 0,
      permissions: formPerms,
      createdAt: new Date().toISOString(),
    }

    setRolesList(prev => [...prev, newRole])
    setCreateOpen(false)
    showNotification(`New role "${newRole.name}" created successfully!`)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !formName.trim()) return

    setRolesList(prev =>
      prev.map(r => {
        if (r.id === selectedRole.id) {
          return {
            ...r,
            name: formName.trim(),
            description: formDesc.trim(),
            permissions: formPerms,
          }
        }
        return r
      })
    )

    setEditOpen(false)
    setSelectedRole(null)
    showNotification(`Role "${formName}" updated successfully!`)
  }

  const handleDeleteRole = () => {
    if (!deleteConfirmRole) return
    setRolesList(prev => prev.filter(r => r.id !== deleteConfirmRole.id))
    showNotification(`Role "${deleteConfirmRole.name}" deleted.`)
    setDeleteConfirmRole(null)
  }

  const togglePerm = (permKey: string) => {
    setFormPerms(prev =>
      prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
    )
  }

  return (
    <div className="space-y-6">
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
        title="Roles & Access Definitions"
        subtitle="Manage user roles, role assignments, and permission boundaries"
        actions={
          <button onClick={handleOpenCreate} className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
            <Plus size={14} /> Create Role
          </button>
        }
      />

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map(role => (
          <div key={role.id} className="card p-5 hover:shadow-card-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 flex items-center justify-center">
                  <UserCog size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex gap-1">
                  <button className="btn-icon" onClick={() => handleOpenEdit(role)} title="Edit Role">
                    <Edit size={13} />
                  </button>
                  {role.slug !== 'super_admin' && (
                    <button
                      className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      onClick={() => setDeleteConfirmRole(role)}
                      title="Delete Role"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{role.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{role.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Users size={13} className="text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">{role.userCount} active user{role.userCount !== 1 ? 's' : ''}</span>
              <div className="ml-auto">
                <Badge variant={role.slug === 'super_admin' ? 'purple' : 'neutral'}>
                  {role.permissions.length === 1 && role.permissions[0] === '*' ? 'Full Access (*)' : `${role.permissions.length} modules`}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ROLE MODAL */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Role"
        subtitle="Define a custom platform role and assign module access permissions"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Role Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Finance Auditor"
              className="input"
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of responsibilities and scope..."
              className="input"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Module Access Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-60 overflow-y-auto">
              {ALL_MODULES.map(m => {
                const key = m.toLowerCase().replace(/ /g, '_')
                const isChecked = formPerms.includes('*') || formPerms.includes(key)
                return (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePerm(key)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
                    />
                    <span>{m}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Create Role</button>
          </div>
        </form>
      </Modal>

      {/* EDIT ROLE MODAL */}
      {selectedRole && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title={`Edit Role: ${selectedRole.name}`}
          subtitle="Modify role information and granted permissions"
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Role Name *</label>
              <input
                type="text"
                required
                className="input"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
              <textarea
                rows={2}
                className="input"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Module Access Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-60 overflow-y-auto">
                {ALL_MODULES.map(m => {
                  const key = m.toLowerCase().replace(/ /g, '_')
                  const isChecked = formPerms.includes('*') || formPerms.includes(key)
                  return (
                    <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePerm(key)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
                      />
                      <span>{m}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-1.5"><Save size={14} /> Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmRole && (
        <ConfirmDialog
          open
          onClose={() => setDeleteConfirmRole(null)}
          onConfirm={handleDeleteRole}
          title={`Delete Role "${deleteConfirmRole.name}"?`}
          message="Are you sure you want to delete this role? Any users assigned to this role will need to be re-assigned."
          confirmLabel="Delete Role"
          danger
        />
      )}
    </div>
  )
}
