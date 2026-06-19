import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { getProductImage } from '../../data/products'
import './ProductFormModal.css'

const PERIODS = [
  { value: 'month', label: 'Per month' },
  { value: 'week', label: 'Per week' },
  { value: 'day', label: 'Per day' },
]

const CONDITIONS = ['New', 'Refurbished', 'Used – Good', 'Used – Like New']
const STATUSES = ['active', 'inactive', 'draft']
const MAX_GALLERY_IMAGES = 6

const EMPTY_FORM = {
  title: '',
  category: 'laptops',
  rentalPrice: '',
  originalPrice: '',
  period: 'month',
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

async function compressImageFile(file, maxWidth = 960, quality = 0.82) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })

  const scale = Math.min(1, maxWidth / image.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')
  if (!context) return dataUrl

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

function ProductImageUpload({
  primaryImage,
  galleryImages,
  fallbackPreview,
  onPrimaryChange,
  onGalleryChange,
  onError,
}) {
  const deviceInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const processFiles = async (files, { asPrimary = false, appendGallery = false } = {}) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      onError('Please choose a valid image file.')
      return
    }

    setUploading(true)
    try {
      const compressed = await Promise.all(imageFiles.map((file) => compressImageFile(file)))

      if (asPrimary) {
        onPrimaryChange(compressed[0])
        return
      }

      if (appendGallery) {
        const merged = [...galleryImages, ...compressed].slice(0, MAX_GALLERY_IMAGES)
        onGalleryChange(merged)
        return
      }

      onPrimaryChange(compressed[0])
      onGalleryChange(compressed.slice(1, MAX_GALLERY_IMAGES))
    } catch {
      onError('Could not process the selected image. Please try another file.')
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
          <button
            type="button"
            className="admin-image-upload-btn"
            disabled={uploading}
            onClick={() => deviceInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
            Upload from device
          </button>
          <button
            type="button"
            className="admin-image-upload-btn admin-image-upload-btn--camera"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            Take photo
          </button>
          {preview && (
            <button
              type="button"
              className="admin-image-upload-btn admin-image-upload-btn--danger"
              disabled={uploading}
              onClick={() => onPrimaryChange('')}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove primary
            </button>
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
          <button
            type="button"
            className="admin-image-gallery-add"
            disabled={uploading || galleryImages.length >= MAX_GALLERY_IMAGES}
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus size={14} aria-hidden="true" />
            Add more
          </button>
        </div>

        <div className="admin-image-gallery-grid">
          {galleryImages.map((image, index) => (
            <div key={`${image.slice(0, 24)}-${index}`} className="admin-image-gallery-item">
              <img src={image} alt={`Gallery ${index + 1}`} />
              <button
                type="button"
                className="admin-image-gallery-remove"
                aria-label={`Remove gallery image ${index + 1}`}
                onClick={() => onGalleryChange(galleryImages.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {galleryImages.length === 0 && (
            <button
              type="button"
              className="admin-image-gallery-empty"
              disabled={uploading}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload size={18} aria-hidden="true" />
              <span>Add gallery photos</span>
            </button>
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

      {uploading && <p className="admin-image-upload-status">Processing image...</p>}
    </div>
  )
}

export function ProductFormModal({ open, product, categories, onClose, onSave }) {
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

  if (!open) return null

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
    <div className="admin-modal-root" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div className="admin-modal-card admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="admin-modal-header">
          <h2 id="product-modal-title">{product ? 'Edit product' : 'Add new product'}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <label className="admin-modal-field admin-modal-field--full">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Dell Latitude i7 Laptop on Rent"
              required
            />
          </label>

          <div className="admin-modal-row">
            <label className="admin-modal-field">
              <span>Category</span>
              <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-modal-field">
              <span>Price (₹)</span>
              <input
                type="number"
                min="0"
                value={form.rentalPrice}
                onChange={(e) => updateField('rentalPrice', e.target.value)}
                placeholder="4200"
                required
              />
            </label>
          </div>

          <div className="admin-modal-row">
            <label className="admin-modal-field">
              <span>Original price (₹)</span>
              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => updateField('originalPrice', e.target.value)}
                placeholder="5000"
              />
            </label>

            <label className="admin-modal-field">
              <span>Rental period</span>
              <select value={form.period} onChange={(e) => updateField('period', e.target.value)}>
                {PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-modal-row">
            <label className="admin-modal-field">
              <span>Condition</span>
              <select value={form.condition} onChange={(e) => updateField('condition', e.target.value)}>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-modal-field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="admin-modal-field admin-modal-field--full">
            <span>Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g. Whitefield, Bengaluru"
            />
          </label>

          <label className="admin-modal-field admin-modal-field--full">
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Short product description for listing and detail page"
            />
          </label>

          <label className="admin-modal-field admin-modal-field--full">
            <span>Additional info</span>
            <textarea
              rows={3}
              value={form.additionalInfo}
              onChange={(e) => updateField('additionalInfo', e.target.value)}
              placeholder="Warranty, delivery notes, accessories included, etc."
            />
          </label>

          <ProductImageUpload
            primaryImage={primaryImage}
            galleryImages={galleryImages}
            fallbackPreview={fallbackPreview}
            onPrimaryChange={setPrimaryImage}
            onGalleryChange={setGalleryImages}
            onError={setImageError}
          />

          {imageError && <p className="admin-image-upload-error" role="alert">{imageError}</p>}

          <div className="admin-modal-row">
            <label className="admin-modal-field">
              <span>Delivery days</span>
              <input
                type="number"
                min="1"
                value={form.deliveryDays}
                onChange={(e) => updateField('deliveryDays', e.target.value)}
              />
            </label>

            <label className="admin-modal-field">
              <span>Rating</span>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => updateField('rating', e.target.value)}
              />
            </label>
          </div>

          <div className="admin-modal-checks">
            <label className="admin-modal-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField('featured', e.target.checked)}
              />
              Featured
            </label>
            <label className="admin-modal-check">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => updateField('verified', e.target.checked)}
              />
              Verified listing
            </label>
            <label className="admin-modal-check">
              <input
                type="checkbox"
                checked={form.refurbished}
                onChange={(e) => updateField('refurbished', e.target.checked)}
              />
              Refurbished
            </label>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-modal-btn admin-modal-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-modal-btn admin-modal-btn--primary">
              {product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
