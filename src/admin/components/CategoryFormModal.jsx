import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { slugifyCategoryId } from '../../data/catalogStorage'
import './ProductFormModal.css'

const EMPTY_FORM = {
  id: '',
  label: '',
  description: '',
}

export function CategoryFormModal({ open, category, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm(category ? { ...EMPTY_FORM, ...category } : EMPTY_FORM)
  }, [open, category])

  if (!open) return null

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.label.trim()) return

    const id = category?.id ?? slugifyCategoryId(form.label)
    onSave({ ...form, id })
  }

  return (
    <div className="admin-modal-root" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div className="admin-modal-card admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
        <div className="admin-modal-header">
          <h2 id="category-modal-title">{category ? 'Edit category' : 'Add category'}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <label className="admin-modal-field admin-modal-field--full">
            <span>Category name</span>
            <input
              type="text"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g. Gaming Laptops"
              required
            />
          </label>

          {!category && (
            <label className="admin-modal-field admin-modal-field--full">
              <span>Category ID</span>
              <input
                type="text"
                value={form.id || slugifyCategoryId(form.label)}
                onChange={(e) => updateField('id', slugifyCategoryId(e.target.value))}
                placeholder="gaming-laptops"
              />
            </label>
          )}

          <label className="admin-modal-field admin-modal-field--full">
            <span>Description (optional)</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what products belong in this category"
            />
          </label>

          <div className="admin-modal-footer">
            <button type="button" className="admin-modal-btn admin-modal-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-modal-btn admin-modal-btn--primary">
              {category ? 'Save category' : 'Add category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
