import React, { useState } from 'react'
import { Plus, Edit, Trash2, Users, UserCog, Shield } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockRoles } from '../../data/mockData'

export const Roles: React.FC = () => {
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(mockRoles[0])

  return (
    <div>
      <SectionHeader
        title="Roles"
        subtitle="Manage user roles and their access permissions"
        actions={<button className="btn-primary btn-sm"><Plus size={14} /> Create Role</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRoles.map(role => (
          <div key={role.id} className="card p-5 hover:shadow-card-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <UserCog size={18} className="text-primary-600" />
              </div>
              <div className="flex gap-1">
                <button className="btn-icon" onClick={() => { setSelected(role); setEditOpen(true) }}><Edit size={13} /></button>
                {role.slug !== 'super_admin' && <button className="btn-icon text-rose-500 hover:bg-rose-50"><Trash2 size={13} /></button>}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{role.name}</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{role.description}</p>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500">{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
              <div className="ml-auto">
                <Badge variant={role.slug === 'super_admin' ? 'purple' : 'neutral'}>{role.permissions.length === 1 && role.permissions[0] === '*' ? 'Full Access' : `${role.permissions.length} modules`}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Role: ${selected.name}`}
        footer={<><button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Save Changes</button></>}
        size="lg"
      >
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Role Name</label><input className="input" defaultValue={selected.name} /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label><textarea className="input" rows={2} defaultValue={selected.description} /></div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Module Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {['Dashboard', 'Suppliers', 'Integrations', 'Master Catalog', 'Mapping', 'Validation', 'Inventory Sync', 'Pricing Sync', 'Image Sync', 'Store Management', 'Sync Jobs', 'Import Queue', 'Logs', 'Monitoring', 'Reports', 'Users', 'Roles', 'Permissions', 'Settings'].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300"
                    defaultChecked={selected.permissions.includes('*') || selected.permissions.includes(m.toLowerCase().replace(/ /g, '_'))}
                  />
                  <span className="text-sm text-slate-700">{m}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
