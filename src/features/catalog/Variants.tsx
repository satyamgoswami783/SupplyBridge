import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Layers, CheckCircle2, X } from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState, ConfirmDialog } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { mockVariantTypes } from '../../data/mockData'
import type { VariantType } from '../../types'

export const Variants: React.FC = () => {
  const [variantsList, setVariantsList] = useState<VariantType[]>(mockVariantTypes)
  const [search, setSearch] = useState('')

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingVariant, setEditingVariant] = useState<VariantType | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<VariantType | null>(null)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Inline value adding state
  const [addingValueForId, setAddingValueForId] = useState<string | null>(null)
  const [newValueInput, setNewValueInput] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    valuesString: '',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleOpenAdd = () => {
    setFormData({ name: '', valuesString: '' })
    setAddOpen(true)
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('Please enter Variant Type Name.')
      return
    }

    const valArray = formData.valuesString
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)

    const newVariant: VariantType = {
      id: `var_${Date.now()}`,
      name: formData.name,
      values: valArray.length > 0 ? valArray : ['Default'],
      productCount: 0,
    }

    setVariantsList([newVariant, ...variantsList])
    setAddOpen(false)
    showNotification(`Variant Type "${newVariant.name}" created!`)
  }

  const handleOpenEdit = (v: VariantType) => {
    setEditingVariant(v)
    setFormData({
      name: v.name,
      valuesString: v.values.join(', '),
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingVariant || !formData.name.trim()) return

    const valArray = formData.valuesString
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)

    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === editingVariant.id) {
          return {
            ...v,
            name: formData.name,
            values: valArray.length > 0 ? valArray : v.values,
          }
        }
        return v
      })
    )

    setEditOpen(false)
    setEditingVariant(null)
    showNotification(`Variant Type "${formData.name}" updated!`)
  }

  const handleConfirmDelete = () => {
    if (!deletingVariant) return

    setVariantsList(prev => prev.filter(v => v.id !== deletingVariant.id))
    showNotification(`Variant Type "${deletingVariant.name}" deleted.`)
    setDeleteOpen(false)
    setDeletingVariant(null)
  }

  const handleAddInlineValue = (id: string) => {
    if (!newValueInput.trim()) {
      setAddingValueForId(null)
      return
    }

    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === id) {
          return {
            ...v,
            values: [...v.values, newValueInput.trim()],
          }
        }
        return v
      })
    )

    showNotification(`Added "${newValueInput.trim()}" option`)
    setNewValueInput('')
    setAddingValueForId(null)
  }

  const handleRemoveChipValue = (variantId: string, valToRemove: string) => {
    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            values: v.values.filter(val => val !== valToRemove),
          }
        }
        return v
      })
    )
  }

  const filtered = variantsList.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Toast Notification Banner */}
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
        title="Variant Types"
        subtitle="Define product variant dimensions (Size, Color, Storage) used across all catalog products"
        actions={
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Variant Type
          </button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search variant types..." />

      {filtered.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={<Layers size={24} />}
            title="No variant types found"
            description="Try searching for another term or create a new variant dimension."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="card p-5 hover:shadow-card-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                    <Layers size={14} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                    <p className="text-xs text-slate-400">{v.productCount.toLocaleString()} products using</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="btn-icon"
                    title="Edit Variant Type"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => { setDeletingVariant(v); setDeleteOpen(true); }}
                    className="btn-icon text-rose-500 hover:bg-rose-50"
                    title="Delete Variant Type"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Option Chips */}
              <div className="flex flex-wrap gap-1.5 items-center pt-2">
                {v.values.map(val => (
                  <span
                    key={val}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium inline-flex items-center gap-1 group/chip"
                  >
                    {val}
                    <button
                      onClick={() => handleRemoveChipValue(v.id, val)}
                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5"
                      title="Remove option"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}

                {addingValueForId === v.id ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      className="input input-sm py-0.5 text-xs w-24"
                      autoFocus
                      placeholder="New Value"
                      value={newValueInput}
                      onChange={e => setNewValueInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddInlineValue(v.id)
                        if (e.key === 'Escape') setAddingValueForId(null)
                      }}
                    />
                    <button
                      onClick={() => handleAddInlineValue(v.id)}
                      className="btn-primary btn-sm text-2xs py-0.5 px-2"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingValueForId(v.id); setNewValueInput(''); }}
                    className="px-2.5 py-1 border border-dashed border-slate-300 text-slate-500 rounded-full text-xs hover:border-primary-400 hover:text-primary-600 transition-colors font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD VARIANT MODAL --- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Variant Type"
        subtitle="Define a new dimension for product variations"
        size="md"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Variant Type</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Variant Type Name *</label>
            <input
              className="input"
              placeholder="e.g. Color, Size, Storage, Voltage"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Values (comma-separated)</label>
            <input
              className="input"
              placeholder="e.g. Black, White, Red, Blue, 128GB, 256GB"
              value={formData.valuesString}
              onChange={e => setFormData({ ...formData, valuesString: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- EDIT VARIANT MODAL --- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Variant Type"
        subtitle={`Updating ${editingVariant?.name}`}
        size="md"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Variant Type Name *</label>
            <input
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Values (comma-separated)</label>
            <input
              className="input"
              value={formData.valuesString}
              onChange={e => setFormData({ ...formData, valuesString: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Variant Type"
        message={`Are you sure you want to delete variant dimension "${deletingVariant?.name}"?`}
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  )
}
