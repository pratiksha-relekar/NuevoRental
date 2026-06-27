import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { slugifyCategoryId } from '../../data/catalogStorage'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="admin-modal-card admin-product-modal"
        showCloseButton={false}
        aria-labelledby="category-modal-title"
      >
        <div className="admin-modal-header">
          <h2 id="category-modal-title">{category ? 'Edit category' : 'Add category'}</h2>
          <Button type="button" variant="ghost" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <Label className="admin-modal-field admin-modal-field--full">
            <span>Category name</span>
            <Input
              type="text"
              value={form.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g. Gaming Laptops"
              required
            />
          </Label>

          {!category && (
            <Label className="admin-modal-field admin-modal-field--full">
              <span>Category ID</span>
              <Input
                type="text"
                value={form.id || slugifyCategoryId(form.label)}
                onChange={(e) => updateField('id', slugifyCategoryId(e.target.value))}
                placeholder="gaming-laptops"
              />
            </Label>
          )}

          <Label className="admin-modal-field admin-modal-field--full">
            <span>Description (optional)</span>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what products belong in this category"
            />
          </Label>

          <div className="admin-modal-footer">
            <Button type="button" variant="outline" className="admin-modal-btn admin-modal-btn--ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-modal-btn admin-modal-btn--primary">
              {category ? 'Save category' : 'Add category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
