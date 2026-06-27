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
const CONDITIONS = ['New', 'Refurbished', 'Used – Good', 'Used – Like New']
const STATUSES = ['active', 'inactive', 'draft']
const MAX_GALLERY_IMAGES = 6

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
    <div className="admin-image-upload">
      <span className="admin-image-upload-label">Product images</span>
      <p className="admin-image-upload-hint">Upload from your device or capture a photo with your camera.</p>

      <div className="admin-image-upload-primary">
        <div className={`admin-image-preview${preview ? ' has-image' : ''}`}>
          {preview ? (
            <img src={preview} alt="Primary product preview" />
          ) : (
            <div className="admin-image-placeholder">
              <ImagePlus size={28} aria-hidden="true" />
              <span>Primary image</span>
            </div>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <Button
            type="button"
            variant="outline"
            className="admin-image-upload-btn"
            disabled={uploading}
            onClick={() => deviceInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
            Upload from device
          </Button>
          <Button
            type="button"
            variant="outline"
            className="admin-image-upload-btn admin-image-upload-btn--camera"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            Take photo
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              className="admin-image-upload-btn admin-image-upload-btn--danger"
              disabled={uploading}
              onClick={() => onPrimaryChange('')}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove primary
            </Button>
          )}
        </div>
      </div>

      <input
        ref={deviceInputRef}
        type="file"
        accept="image/*"
        className="admin-image-file-input"
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
        className="admin-image-file-input"
        onChange={(event) => {
          processFiles(event.target.files, { asPrimary: true })
          event.target.value = ''
        }}
      />

      <div className="admin-image-gallery">
        <div className="admin-image-gallery-head">
          <span>Gallery images</span>
          <Button
            type="button"
            variant="outline"
            className="admin-image-gallery-add"
            disabled={uploading || galleryImages.length >= MAX_GALLERY_IMAGES}
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus size={14} aria-hidden="true" />
            Add more
          </Button>
        </div>

        <div className="admin-image-gallery-grid">
          {galleryImages.map((image, index) => (
            <div key={`${isRemoteImageUrl(image) ? image : image.slice(0, 24)}-${index}`} className="admin-image-gallery-item">
              <img src={image} alt={`Gallery ${index + 1}`} />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="admin-image-gallery-remove"
                aria-label={`Remove gallery image ${index + 1}`}
                onClick={() => onGalleryChange(galleryImages.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={14} />
              </Button>
            </div>
          ))}

          {galleryImages.length === 0 && (
            <Button
              type="button"
              variant="outline"
              className="admin-image-gallery-empty"
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
        className="admin-image-file-input"
        onChange={(event) => {
          processFiles(event.target.files, { appendGallery: true })
          event.target.value = ''
        }}
      />

      {uploading && <p className="admin-image-upload-status">Uploading image to Firebase Storage...</p>}
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="admin-modal-card admin-product-modal"
        showCloseButton={false}
        aria-labelledby="product-modal-title"
      >
        <div className="admin-modal-header">
          <h2 id="product-modal-title">{product ? 'Edit product' : 'Add new product'}</h2>
          <Button type="button" variant="ghost" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <Label className="admin-modal-field admin-modal-field--full">
            <span>Title</span>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Dell Latitude i7 Laptop on Rent"
              required
            />
          </Label>

          <div className="admin-modal-row">
            <Label className="admin-modal-field">
              <span>Category</span>
              <Select value={form.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger className="w-full">
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

            <Label className="admin-modal-field">
              <span>Price (₹)</span>
              <Input
                type="number"
                min="0"
                value={form.rentalPrice}
                onChange={(e) => updateField('rentalPrice', e.target.value)}
                placeholder="4200"
                required
              />
            </Label>
          </div>

          <div className="admin-modal-row">
            <Label className="admin-modal-field">
              <span>Original price (₹)</span>
              <Input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => updateField('originalPrice', e.target.value)}
                placeholder="5000"
              />
            </Label>

            <Label className="admin-modal-field">
              <span>Security deposit (₹)</span>
              <Input
                type="number"
                min="0"
                value={form.securityDeposit}
                onChange={(e) => updateField('securityDeposit', e.target.value)}
                placeholder="0"
              />
            </Label>
          </div>

          <div className="admin-modal-row">
            <Label className="admin-modal-field">
              <span>Base project plan</span>
              <Select value={form.period} onValueChange={(value) => updateField('period', value)}>
                <SelectTrigger className="w-full">
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

            <Label className="admin-modal-field">
              <span>Condition</span>
              <Select value={form.condition} onValueChange={(value) => updateField('condition', value)}>
                <SelectTrigger className="w-full">
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

          <div className="admin-modal-row">
            <Label className="admin-modal-field">
              <span>Status</span>
              <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger className="w-full">
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

          <Label className="admin-modal-field admin-modal-field--full">
            <span>Location</span>
            <Input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g. Whitefield, Bengaluru"
            />
          </Label>

          <Label className="admin-modal-field admin-modal-field--full">
            <span>Description</span>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Short product description for listing and detail page"
            />
          </Label>

          <Label className="admin-modal-field admin-modal-field--full">
            <span>Additional info</span>
            <Textarea
              rows={3}
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
            <Alert className="admin-image-upload-error">
              <AlertDescription>{imageError}</AlertDescription>
            </Alert>
          )}

          <div className="admin-modal-row">
            <Label className="admin-modal-field">
              <span>Delivery days</span>
              <Input
                type="number"
                min="1"
                value={form.deliveryDays}
                onChange={(e) => updateField('deliveryDays', e.target.value)}
              />
            </Label>

            <Label className="admin-modal-field">
              <span>Rating</span>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => updateField('rating', e.target.value)}
              />
            </Label>
          </div>

          <div className="admin-modal-checks">
            <label className="admin-modal-check">
              <Checkbox
                checked={form.featured}
                onCheckedChange={(checked) => updateField('featured', checked === true)}
              />
              Featured
            </label>
            <label className="admin-modal-check">
              <Checkbox
                checked={form.verified}
                onCheckedChange={(checked) => updateField('verified', checked === true)}
              />
              Verified listing
            </label>
            <label className="admin-modal-check">
              <Checkbox
                checked={form.refurbished}
                onCheckedChange={(checked) => updateField('refurbished', checked === true)}
              />
              Refurbished
            </label>
          </div>

          <div className="admin-modal-footer">
            <Button type="button" variant="outline" className="admin-modal-btn admin-modal-btn--ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-modal-btn admin-modal-btn--primary">
              {product ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
