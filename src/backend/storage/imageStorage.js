import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { storage } from '../firebase/storage'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

export function isRemoteImageUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

export function sanitizeStorageSegment(value) {
  return String(value ?? 'file')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120) || 'file'
}

function extensionForContentType(contentType, fallback = 'jpg') {
  if (!contentType) return fallback
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('pdf')) return 'pdf'
  return fallback
}

function buildFileName(name, contentType) {
  const base = sanitizeStorageSegment(name?.replace(/\.[^.]+$/, '') || 'image')
  const ext = extensionForContentType(contentType)
  return `${base}-${Date.now()}.${ext}`
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function compressImageToBlob(file, maxWidth = 960, quality = 0.82) {
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
  if (!context) {
    return dataUrlToBlob(dataUrl)
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality)
  })

  return blob ?? dataUrlToBlob(dataUrl)
}

async function toUploadBlob(source) {
  if (source instanceof File || source instanceof Blob) {
    if (source.type?.startsWith('image/')) {
      return compressImageToBlob(source)
    }
    return source
  }

  if (typeof source === 'string' && isDataUrl(source)) {
    return dataUrlToBlob(source)
  }

  throw new Error('Unsupported image source.')
}

export async function uploadBlobToStorage(storagePath, blob, contentType = 'image/jpeg') {
  if (!blob) {
    throw new Error('Missing image data.')
  }

  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Please use a file under 10 MB.')
  }

  const storageRef = ref(storage, storagePath)
  const snapshot = await uploadBytes(storageRef, blob, { contentType })
  const downloadUrl = await getDownloadURL(snapshot.ref)

  return {
    storageUrl: downloadUrl,
    storagePath,
  }
}

export async function uploadImageSource(storagePath, source) {
  const blob = await toUploadBlob(source)
  const contentType = blob.type || 'image/jpeg'
  return uploadBlobToStorage(storagePath, blob, contentType)
}

export async function ensureRemoteImageUrl(value, storagePath) {
  if (!value) return ''
  if (isRemoteImageUrl(value)) return value
  if (isDataUrl(value)) {
    const uploaded = await uploadImageSource(storagePath, value)
    return uploaded.storageUrl
  }
  return value
}

export async function uploadKycDocumentImage(userEmail, docType, source, fileName = '') {
  const userSegment = sanitizeStorageSegment(userEmail)
  const docSegment = sanitizeStorageSegment(docType)
  const blob = await toUploadBlob(source)
  const fileLabel = buildFileName(fileName || docType, blob.type)
  const storagePath = `users/${userSegment}/kyc/${docSegment}/${fileLabel}`

  return uploadBlobToStorage(storagePath, blob, blob.type || 'image/jpeg')
}

export async function uploadProductCatalogImage(productId, source, { kind = 'primary', index = 0 } = {}) {
  const productSegment = sanitizeStorageSegment(productId)
  const blob = await toUploadBlob(source)
  const suffix = kind === 'gallery' ? `gallery-${index}` : 'primary'
  const fileLabel = buildFileName(suffix, blob.type)
  const storagePath = `catalog/products/${productSegment}/${fileLabel}`

  return uploadBlobToStorage(storagePath, blob, blob.type || 'image/jpeg')
}

export async function uploadProductDraftImage(sessionId, source, { kind = 'primary', index = 0 } = {}) {
  const sessionSegment = sanitizeStorageSegment(sessionId)
  const blob = await toUploadBlob(source)
  const suffix = kind === 'gallery' ? `gallery-${index}` : 'primary'
  const fileLabel = buildFileName(suffix, blob.type)
  const storagePath = `catalog/drafts/${sessionSegment}/${fileLabel}`

  return uploadBlobToStorage(storagePath, blob, blob.type || 'image/jpeg')
}

export async function resolveProductImagesForSave(productId, { imageUrl = '', images = [] } = {}) {
  const gallery = Array.isArray(images) ? images.filter(Boolean) : []

  let resolvedPrimary = imageUrl
  if (imageUrl) {
    resolvedPrimary = await ensureRemoteImageUrl(
      imageUrl,
      `catalog/products/${sanitizeStorageSegment(productId)}/primary-${Date.now()}.jpg`,
    )
  }

  const resolvedGallery = await Promise.all(
    gallery.map((image, index) =>
      ensureRemoteImageUrl(
        image,
        `catalog/products/${sanitizeStorageSegment(productId)}/gallery-${index}-${Date.now()}.jpg`,
      ),
    ),
  )

  return {
    imageUrl: resolvedPrimary,
    images: resolvedGallery.filter(Boolean),
  }
}

export async function resolveKycDocumentsForSave(userEmail, documents = {}) {
  const resolved = {
    aadhaar: null,
    pan: null,
    selfie: null,
  }

  await Promise.all(
    ['aadhaar', 'pan', 'selfie'].map(async (docType) => {
      const document = documents?.[docType]
      if (!document) return

      const currentUrl = document.storageUrl || document.preview || document.dataUrl || ''
      if (!currentUrl) return

      if (isRemoteImageUrl(currentUrl)) {
        resolved[docType] = {
          name: document.name ?? '',
          storageUrl: currentUrl,
          preview: currentUrl,
          storagePath: document.storagePath ?? '',
          uploadedAt: document.uploadedAt ?? new Date().toISOString(),
        }
        return
      }

      const uploaded = await uploadKycDocumentImage(
        userEmail,
        docType,
        currentUrl,
        document.name,
      )

      resolved[docType] = {
        name: document.name ?? '',
        storageUrl: uploaded.storageUrl,
        preview: uploaded.storageUrl,
        storagePath: uploaded.storagePath,
        uploadedAt: document.uploadedAt ?? new Date().toISOString(),
      }
    }),
  )

  return resolved
}

export async function deleteStoragePath(storagePath) {
  if (!storagePath) return
  try {
    await deleteObject(ref(storage, storagePath))
  } catch {
    // Ignore missing files.
  }
}
