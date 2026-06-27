import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { compressFileToWeeklyOfferDataUrl } from '../../backend/storage/imageStorage'
import { getProductImage } from '../../data/products'
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
const EMPTY_FORM = {
  productId: '',
  title: '',
  category: 'laptops',
  discountPercent: 20,
  originalPrice: '',
  offerPrice: '',
  period: 'month',
  stock: 3,
  rating: 4.8,
  reviews: 10,
  sortOrder: 0,
  active: true,
}

function toLocalDateTimeValue(isoValue) {
  if (!isoValue) return ''
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function OfferImageUpload({
  primaryImage,
  fallbackPreview,
  onPrimaryChange,
  onError,
}) {
  const deviceInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [processing, setProcessing] = useState(false)

  const processFiles = async (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      onError('Please choose a valid image file.')
      return
    }

    setProcessing(true)
    onError('')

    try {
      const dataUrl = await compressFileToWeeklyOfferDataUrl(imageFiles[0])
      onPrimaryChange(dataUrl)
    } catch (error) {
      onError(error?.message || 'Could not process the selected image. Please try another file.')
    } finally {
      setProcessing(false)
    }
  }

  const preview = primaryImage || fallbackPreview

  return (
    <div className="admin-image-upload">
      <span className="admin-image-upload-label">Offer image</span>
      <p className="admin-image-upload-hint">
        Upload a custom deal image. Images are compressed and saved directly in Firestore as base64.
      </p>

      <div className="admin-image-upload-primary">
        <div className={`admin-image-preview${preview ? ' has-image' : ''}`}>
          {preview ? (
            <img src={preview} alt="Weekly offer preview" />
          ) : (
            <div className="admin-image-placeholder">
              <ImagePlus size={28} aria-hidden="true" />
              <span>Offer image</span>
            </div>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <Button
            type="button"
            variant="outline"
            className="admin-image-upload-btn"
            disabled={processing}
            onClick={() => deviceInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
            Upload from device
          </Button>
          <Button
            type="button"
            variant="outline"
            className="admin-image-upload-btn admin-image-upload-btn--camera"
            disabled={processing}
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
              disabled={processing}
              onClick={() => {
                onError('')
                onPrimaryChange('')
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove image
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
          processFiles(event.target.files)
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
          processFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {processing && <p className="admin-image-upload-status">Processing image…</p>}
    </div>
  )
}

export function WeeklyOfferFormModal({ deal, products, categories, onClose, onSave }) {
  const offerId = deal?.id ?? `deal-${Date.now()}`

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...deal,
    productId: deal?.productId ? String(deal.productId) : '',
    originalPrice: deal?.originalPrice ?? '',
    offerPrice: deal?.offerPrice ?? '',
    category: deal?.category ?? categories[0]?.id ?? 'laptops',
  }))
  const [primaryImage, setPrimaryImage] = useState(
    deal?.imageDataUrl ?? deal?.image ?? deal?.imageUrl ?? '',
  )
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const categoryOptions = categories.length > 0 ? categories : [{ id: 'laptops', label: 'Laptops' }]

  const filteredProducts = useMemo(
    () => products.filter((product) => product.category === form.category),
    [products, form.category],
  )

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(form.productId)),
    [products, form.productId],
  )

  const productPreview = selectedProduct ? getProductImage(selectedProduct) : ''

  useEffect(() => {
    if (!selectedProduct || deal?.id) return

    const originalPrice = Number(selectedProduct.originalPrice) || Number(selectedProduct.rentalPrice) || 0
    const discountPercent = Number(form.discountPercent) || 0
    const offerPrice = Math.round(originalPrice * (1 - discountPercent / 100))

    setForm((current) => ({
      ...current,
      title: current.title || selectedProduct.title,
      category: selectedProduct.category || current.category,
      originalPrice: current.originalPrice || originalPrice,
      offerPrice: current.offerPrice || offerPrice,
      period: selectedProduct.period || current.period,
    }))
  }, [selectedProduct, form.discountPercent, deal?.id])

  useEffect(() => {
    const originalPrice = Number(form.originalPrice) || 0
    const discountPercent = Number(form.discountPercent) || 0
    const offerPrice = Math.round(originalPrice * (1 - discountPercent / 100))
    setForm((current) => ({ ...current, offerPrice }))
  }, [form.originalPrice, form.discountPercent])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleCategoryChange = (category) => {
    setForm((current) => {
      const productStillValid = products.some(
        (product) => String(product.id) === String(current.productId) && product.category === category,
      )

      return {
        ...current,
        category,
        productId: productStillValid ? current.productId : '',
        title: productStillValid ? current.title : '',
      }
    })
  }

  const handleProductChange = (productId) => {
    const product = products.find((item) => String(item.id) === String(productId))
    handleChange('productId', productId)

    if (product) {
      const originalPrice = Number(product.originalPrice) || Number(product.rentalPrice) || 0
      const discountPercent = Number(form.discountPercent) || 0
      setForm((current) => ({
        ...current,
        productId,
        title: product.title,
        category: product.category,
        originalPrice,
        offerPrice: Math.round(originalPrice * (1 - discountPercent / 100)),
        period: product.period || 'month',
      }))
      setPrimaryImage(getProductImage(product))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setImageError('')

    if (!form.title.trim()) {
      setError('Deal title is required.')
      return
    }
    if (!form.productId) {
      setError('Select a catalog product for this offer.')
      return
    }

    const resolvedImage = primaryImage || productPreview || deal?.image || ''

    if (!resolvedImage) {
      setError('Add an offer image or select a product with a photo.')
      return
    }

    setSaving(true)
    const result = await onSave({
      ...form,
      id: offerId,
      productId: Number(form.productId),
      originalPrice: Number(form.originalPrice) || 0,
      offerPrice: Number(form.offerPrice) || 0,
      discountPercent: Number(form.discountPercent) || 0,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 5,
      reviews: Number(form.reviews) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      inStock: Number(form.stock) > 0,
      image: resolvedImage,
      imageUrl: resolvedImage,
      imageDataUrl: resolvedImage.startsWith('data:') ? resolvedImage : '',
      brand: 'Nuevo Rental',
      createdAt: deal?.createdAt,
    })
    setSaving(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onClose()
  }

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="weekly-offer-form-modal admin-modal-card admin-modal-root--wide"
        showCloseButton={false}
        aria-labelledby="weekly-offer-form-title"
      >
        <div className="weekly-offer-form-head admin-modal-header">
          <div>
            <span className="weekly-offer-form-eyebrow">Weekly Best Deals</span>
            <h2 id="weekly-offer-form-title">{deal?.id ? 'Edit offer' : 'Add offer'}</h2>
          </div>
          <Button type="button" variant="ghost" className="weekly-offer-form-close admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {error && (
          <Alert className="weekly-offer-form-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="weekly-offer-form admin-modal-form" onSubmit={handleSubmit}>
          <div className="weekly-offer-form-grid">
            <Label className="weekly-offer-form-field">
              <span>Category</span>
              <Select value={form.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="weekly-offer-form-field">
              <span>Catalog product</span>
              <Select value={form.productId} onValueChange={handleProductChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={filteredProducts.length > 0 ? 'Select product' : 'No products in this category'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
          </div>

          <Label className="weekly-offer-form-field">
            <span>Deal title</span>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Laptop on Rent — HP ProBook i5"
              required
            />
          </Label>

          <OfferImageUpload
            primaryImage={primaryImage}
            fallbackPreview={productPreview}
            onPrimaryChange={setPrimaryImage}
            onError={setImageError}
          />

          {imageError && (
            <Alert className="weekly-offer-form-error">
              <AlertDescription>{imageError}</AlertDescription>
            </Alert>
          )}

          <div className="weekly-offer-form-grid">
            <Label className="weekly-offer-form-field">
              <span>Discount %</span>
              <Select
                value={String(form.discountPercent)}
                onValueChange={(value) => handleChange('discountPercent', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% Off</SelectItem>
                  <SelectItem value="20">20% Off</SelectItem>
                  <SelectItem value="40">40% Off</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            <Label className="weekly-offer-form-field">
              <span>Rental period</span>
              <Select value={form.period} onValueChange={(value) => handleChange('period', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Per day</SelectItem>
                  <SelectItem value="week">Per week</SelectItem>
                  <SelectItem value="month">Per month</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>

          <div className="weekly-offer-form-grid">
            <Label className="weekly-offer-form-field">
              <span>Original price (₹)</span>
              <Input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) => handleChange('originalPrice', e.target.value)}
              />
            </Label>

            <Label className="weekly-offer-form-field">
              <span>Offer price (₹)</span>
              <Input
                type="number"
                min="0"
                value={form.offerPrice}
                onChange={(e) => handleChange('offerPrice', e.target.value)}
              />
            </Label>
          </div>

          <div className="weekly-offer-form-grid">
            <Label className="weekly-offer-form-field">
              <span>Stock</span>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
              />
            </Label>

            <Label className="weekly-offer-form-field">
              <span>Sort order</span>
              <Input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.value)}
              />
            </Label>
          </div>

          <div className="weekly-offer-form-grid">
            <Label className="weekly-offer-form-field">
              <span>Rating</span>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => handleChange('rating', e.target.value)}
              />
            </Label>

            <Label className="weekly-offer-form-field">
              <span>Reviews</span>
              <Input
                type="number"
                min="0"
                value={form.reviews}
                onChange={(e) => handleChange('reviews', e.target.value)}
              />
            </Label>
          </div>

          <label className="weekly-offer-form-check">
            <Checkbox
              checked={form.active}
              onCheckedChange={(checked) => handleChange('active', checked === true)}
            />
            <span>Show this offer on the homepage</span>
          </label>

          <div className="weekly-offer-form-actions admin-modal-actions">
            <Button type="button" variant="outline" className="weekly-offer-form-btn weekly-offer-form-btn--ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="weekly-offer-form-btn weekly-offer-form-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function toCountdownInputValue(isoValue) {
  return toLocalDateTimeValue(isoValue)
}

export function fromCountdownInputValue(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
