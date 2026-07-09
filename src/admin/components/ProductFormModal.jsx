import { useEffect, useId, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2, Upload, X } from 'lucide-react'
import {
  isRemoteImageUrl,
  uploadProductCatalogImage,
  uploadProductDraftImage,
} from '../../backend/storage/imageStorage'
import { getProductImage } from '../../data/products'
import { PROJECT_PLAN_OPTIONS } from '../../data/projectPlans'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  AdminIconButton,
  AdminOutlineButton,
  AdminPrimaryButton,
  adminDialogContentClass,
  adminInputClass,
  adminSelectTriggerClass,
} from './admin-ui'

const CONDITIONS = ['New', 'Refurbished', 'Used – Good', 'Used – Like New']
const STATUSES = ['active', 'inactive', 'draft']
const MAX_GALLERY_IMAGES = 6

const labelClass = 'text-[11px] font-semibold tracking-wide text-[#444] uppercase'

const EMPTY_FORM = {
  title: '',
  category: 'laptops',
  rentalPrice: '',
  originalPrice: '',
  period: 'month',
  securityDeposit: '',
  location: '',
  condition: 'New',
  status: 'active',
  description: '',
  additionalInfo: '',
  deliveryDays: 3,
  rating: 5,
  featured: false,
  verified: false,
  refurbished: false,
}

function ProductImageUpload({
  primaryImage,
  galleryImages,
  fallbackPreview,
  productId,
  uploadSessionId,
  onPrimaryChange,
  onGalleryChange,
  onError,
}) {
  const deviceInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const uploadProductImage = async (file, { kind = 'primary', index = 0 } = {}) => {
    if (productId) {
      return uploadProductCatalogImage(productId, file, { kind, index })
    }

    return uploadProductDraftImage(uploadSessionId, file, { kind, index })
  }

  const processFiles = async (files, { asPrimary = false, appendGallery = false } = {}) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      onError('Please choose a valid image file.')
      return
    }

    setUploading(true)
    try {
      if (asPrimary) {
        const uploaded = await uploadProductImage(imageFiles[0], { kind: 'primary' })
        onPrimaryChange(uploaded.storageUrl)
        return
      }

      if (appendGallery) {
        const startIndex = galleryImages.length
        const uploadedUrls = await Promise.all(
          imageFiles.map((file, offset) =>
            uploadProductImage(file, { kind: 'gallery', index: startIndex + offset }).then((result) => result.storageUrl),
          ),
        )
        const merged = [...galleryImages, ...uploadedUrls].slice(0, MAX_GALLERY_IMAGES)
        onGalleryChange(merged)
        return
      }

      const [firstFile, ...restFiles] = imageFiles
      const primaryUpload = await uploadProductImage(firstFile, { kind: 'primary' })
      onPrimaryChange(primaryUpload.storageUrl)

      if (restFiles.length > 0) {
        const galleryUploads = await Promise.all(
          restFiles.slice(0, MAX_GALLERY_IMAGES - 1).map((file, index) =>
            uploadProductImage(file, { kind: 'gallery', index }).then((result) => result.storageUrl),
          ),
        )
        onGalleryChange(galleryUploads)
      }
    } catch {
      onError('Could not upload the selected image. Please try another file.')
    } finally {
      setUploading(false)
    }
  }

  const preview = primaryImage || fallbackPreview

  return (
    <div className="mb-4">
      <span className={labelClass}>Product images</span>
      <p className="mb-3 text-xs text-[#888]">
        Upload from your device or capture a photo with your camera.
      </p>

      <div className="grid grid-cols-[140px_1fr] items-start gap-4 max-sm:grid-cols-1">
        <div
          className={cn(
            'size-[140px] overflow-hidden border border-dashed border-[#ddd] bg-[#fafafa] max-sm:mx-auto max-sm:w-full max-sm:max-w-[220px]',
            preview && 'border-solid border-[#e5e5e5]',
          )}
        >
          {preview ? (
            <img src={preview} alt="Primary product preview" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-xs font-semibold text-[#888]">
              <ImagePlus size={28} aria-hidden="true" />
              <span>Primary image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <AdminOutlineButton
            className="justify-start gap-2 normal-case tracking-normal"
            disabled={uploading}
            onClick={() => deviceInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
            Upload from device
          </AdminOutlineButton>
          <AdminOutlineButton
            className="justify-start gap-2 normal-case tracking-normal"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            Take photo
          </AdminOutlineButton>
          {preview && (
            <AdminOutlineButton
              className="justify-start gap-2 border-[#f0d0d0] text-[#c0392b] normal-case tracking-normal hover:bg-[#c0392b] hover:text-white"
              disabled={uploading}
              onClick={() => onPrimaryChange('')}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove primary
            </AdminOutlineButton>
          )}
        </div>
      </div>

      <input
        ref={deviceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          processFiles(event.target.files, { asPrimary: true })
          event.target.value = ''
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          processFiles(event.target.files, { asPrimary: true })
          event.target.value = ''
        }}
      />

      <div className="mt-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-[#666] uppercase">Gallery images</span>
          <AdminOutlineButton
            className="h-8 gap-1.5 px-3 text-[11px] normal-case tracking-normal"
            disabled={uploading || galleryImages.length >= MAX_GALLERY_IMAGES}
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus size={14} aria-hidden="true" />
            Add more
          </AdminOutlineButton>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {galleryImages.map((image, index) => (
            <div
              key={`${isRemoteImageUrl(image) ? image : image.slice(0, 24)}-${index}`}
              className="relative size-[84px] overflow-hidden border border-[#e5e5e5]"
            >
              <img src={image} alt={`Gallery ${index + 1}`} className="size-full object-cover" />
              <AdminIconButton
                danger
                className="absolute top-1 right-1 size-6 bg-[#1a1a1a]/70 text-white hover:bg-[#c0392b]"
                aria-label={`Remove gallery image ${index + 1}`}
                onClick={() => onGalleryChange(galleryImages.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={14} />
              </AdminIconButton>
            </div>
          ))}

          {galleryImages.length === 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex h-[84px] w-[120px] flex-col gap-1.5 border-dashed text-[11px] font-semibold text-[#888] normal-case tracking-normal"
              disabled={uploading}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload size={18} aria-hidden="true" />
              <span>Add gallery photos</span>
            </Button>
          )}
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          processFiles(event.target.files, { appendGallery: true })
          event.target.value = ''
        }}
      />

      {uploading && (
        <p className="mt-2.5 text-xs font-semibold text-[#666]">Uploading image to Firebase Storage...</p>
      )}
    </div>
  )
}

export function ProductFormModal({ open, product, categories, onClose, onSave }) {
  const uploadSessionId = useId().replace(/:/g, '')
  const [form, setForm] = useState(EMPTY_FORM)
  const [primaryImage, setPrimaryImage] = useState('')
  const [galleryImages, setGalleryImages] = useState([])
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    if (!open) return

    if (product) {
      setForm({
        ...EMPTY_FORM,
        ...product,
        rentalPrice: product.rentalPrice ?? '',
        originalPrice: product.originalPrice ?? '',
        securityDeposit: product.securityDeposit ?? '',
      })
      setPrimaryImage(product.imageUrl ?? '')
      setGalleryImages(Array.isArray(product.images) ? product.images.filter(Boolean) : [])
      setImageError('')
      return
    }

    setForm({
      ...EMPTY_FORM,
      category: categories[0]?.id ?? 'laptops',
    })
    setPrimaryImage('')
    setGalleryImages([])
    setImageError('')
  }, [open, product, categories])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const fallbackPreview = product && !primaryImage ? getProductImage(product) : ''

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return

    onSave({
      ...form,
      id: product?.id,
      source: product?.source ?? 'admin',
      imageUrl: primaryImage,
      images: galleryImages,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={adminDialogContentClass}
        showCloseButton={false}
        aria-labelledby="product-modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
          <h2 id="product-modal-title" className="text-lg font-bold text-[#1a1a1a]">
            {product ? 'Edit product' : 'Add new product'}
          </h2>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-4">
            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Title</span>
              <Input
                type="text"
                className={adminInputClass}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Dell Latitude i7 Laptop on Rent"
                required
              />
            </Label>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Category</span>
                <Select value={form.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>

              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Price (₹)</span>
                <Input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  value={form.rentalPrice}
                  onChange={(e) => updateField('rentalPrice', e.target.value)}
                  placeholder="4200"
                  required
                />
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Original price (₹)</span>
                <Input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  value={form.originalPrice}
                  onChange={(e) => updateField('originalPrice', e.target.value)}
                  placeholder="5000"
                />
              </Label>

              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Security deposit (₹)</span>
                <Input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  value={form.securityDeposit}
                  onChange={(e) => updateField('securityDeposit', e.target.value)}
                  placeholder="0"
                />
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Base project plan</span>
                <Select value={form.period} onValueChange={(value) => updateField('period', value)}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_PLAN_OPTIONS.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>

              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Condition</span>
                <Select value={form.condition} onValueChange={(value) => updateField('condition', value)}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Status</span>
                <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>
            </div>

            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Location</span>
              <Input
                type="text"
                className={adminInputClass}
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Whitefield, Bengaluru"
              />
            </Label>

            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Description</span>
              <Textarea
                rows={3}
                className={cn(adminInputClass, 'min-h-[84px] resize-y')}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Short product description for listing and detail page"
              />
            </Label>

            <Label className="flex flex-col gap-2">
              <span className={labelClass}>Additional info</span>
              <Textarea
                rows={3}
                className={cn(adminInputClass, 'min-h-[84px] resize-y')}
                value={form.additionalInfo}
                onChange={(e) => updateField('additionalInfo', e.target.value)}
                placeholder="Warranty, delivery notes, accessories included, etc."
              />
            </Label>

            <ProductImageUpload
              primaryImage={primaryImage}
              galleryImages={galleryImages}
              fallbackPreview={fallbackPreview}
              productId={product?.id ?? null}
              uploadSessionId={uploadSessionId}
              onPrimaryChange={setPrimaryImage}
              onGalleryChange={setGalleryImages}
              onError={setImageError}
            />

            {imageError && (
              <Alert className="rounded-none border-[#f0caca] bg-[#fdf2f2] text-[#a94442]">
                <AlertDescription>{imageError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Delivery days</span>
                <Input
                  type="number"
                  min="1"
                  className={adminInputClass}
                  value={form.deliveryDays}
                  onChange={(e) => updateField('deliveryDays', e.target.value)}
                />
              </Label>

              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Rating</span>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className={adminInputClass}
                  value={form.rating}
                  onChange={(e) => updateField('rating', e.target.value)}
                />
              </Label>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                <Checkbox
                  checked={form.featured}
                  onCheckedChange={(checked) => updateField('featured', checked === true)}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                <Checkbox
                  checked={form.verified}
                  onCheckedChange={(checked) => updateField('verified', checked === true)}
                />
                Verified listing
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                <Checkbox
                  checked={form.refurbished}
                  onCheckedChange={(checked) => updateField('refurbished', checked === true)}
                />
                Refurbished
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e5e5e5] px-6 py-4">
            <AdminOutlineButton onClick={onClose}>
              Cancel
            </AdminOutlineButton>
            <AdminPrimaryButton type="submit">
              {product ? 'Save changes' : 'Add product'}
            </AdminPrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
