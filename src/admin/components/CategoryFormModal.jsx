import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { slugifyCategoryId } from '../../data/catalogStorage'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  AdminIconButton,
  AdminOutlineButton,
  AdminPrimaryButton,
  adminInputClass,
} from './admin-ui'

const EMPTY_FORM = {
  id: '',
  label: '',
  description: '',
}

const labelClass = 'text-[11px] font-semibold tracking-wide text-[#444] uppercase'

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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[640px] gap-0 rounded-none border-[#d8d8d8] p-0"
        showCloseButton={false}
        aria-labelledby="category-modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
          <h2 id="category-modal-title" className="text-lg font-bold text-[#1a1a1a]">
            {category ? 'Edit category' : 'Add category'}
          </h2>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-4">
            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Category name</span>
              <Input
                type="text"
                className={adminInputClass}
                value={form.label}
                onChange={(e) => updateField('label', e.target.value)}
                placeholder="e.g. Gaming Laptops"
                required
              />
            </Label>

            {!category && (
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Category ID</span>
                <Input
                  type="text"
                  className={adminInputClass}
                  value={form.id || slugifyCategoryId(form.label)}
                  onChange={(e) => updateField('id', slugifyCategoryId(e.target.value))}
                  placeholder="gaming-laptops"
                />
              </Label>
            )}

            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Description (optional)</span>
              <Textarea
                rows={3}
                className={cn(adminInputClass, 'min-h-[84px] resize-y')}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what products belong in this category"
              />
            </Label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e5e5e5] px-6 py-4">
            <AdminOutlineButton onClick={onClose}>
              Cancel
            </AdminOutlineButton>
            <AdminPrimaryButton type="submit">
              {category ? 'Save category' : 'Add category'}
            </AdminPrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
