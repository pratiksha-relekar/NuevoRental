import { getProductById, getRentalDurationPlans } from '../../data/productDetails'
import { getProductImage } from '../../data/products'

export function toImageUrl(image) {
  if (!image) return ''
  return typeof image === 'string' ? image : String(image)
}

export function buildUserAddress(user, delivery = null) {
  if (delivery) {
    return {
      fullName: delivery.fullName ?? '',
      email: delivery.email ?? user?.email ?? '',
      phone: delivery.phone ?? '',
      location: delivery.location ?? '',
      city: delivery.city ?? '',
      state: delivery.state ?? '',
      pincode: delivery.pincode ?? '',
      addressLine1: delivery.addressLine1 ?? '',
      addressLine2: delivery.addressLine2 ?? '',
      landmark: delivery.landmark ?? '',
      addressType: delivery.addressType ?? 'home',
      instructions: delivery.instructions ?? '',
      deliveryDate: delivery.deliveryDate ?? '',
      deliverySlot: delivery.deliverySlot ?? '',
      coordinates: delivery.coordinates ?? null,
    }
  }

  if (!user?.email) return null

  return {
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.displayName || '',
    email: user.email,
    phone: user.phone ?? '',
    location: user.location ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    pincode: user.pincode ?? '',
    addressLine1: user.addressLine1 ?? user.location ?? '',
    addressLine2: user.addressLine2 ?? '',
    landmark: user.landmark ?? '',
    addressType: user.addressType ?? 'home',
    instructions: user.instructions ?? '',
    deliveryDate: user.deliveryDate ?? '',
    deliverySlot: user.deliverySlot ?? '',
    coordinates: user.coordinates ?? null,
  }
}

export function buildProductSnapshot(product, user = null, existing = null) {
  const productId = product.id ?? product.productId
  const detailed = getProductById(productId) ?? product
  const now = new Date().toISOString()
  const durationPlans = (detailed.durationPlans ?? getRentalDurationPlans(detailed)).map((plan) => ({
    id: plan.id,
    shortLabel: plan.shortLabel,
    price: plan.price,
    periodUnit: plan.periodUnit,
  }))

  return {
    productId: Number(productId) || productId,
    title: detailed.title ?? product.title,
    image: toImageUrl(getProductImage(detailed)),
    images: (detailed.images ?? [getProductImage(detailed)]).map(toImageUrl).filter(Boolean),
    rentalPrice: detailed.rentalPrice ?? product.rentalPrice,
    originalPrice: detailed.originalPrice ?? detailed.rentalPrice ?? product.rentalPrice,
    period: detailed.period ?? product.period,
    category: detailed.category ?? product.category,
    categoryLabel: detailed.categoryLabel ?? detailed.category ?? product.category,
    brand: detailed.brand ?? '',
    description: detailed.descriptionIntro ?? detailed.description ?? '',
    specifications: detailed.specifications ?? [],
    durationPlans,
    stock: detailed.stock ?? 'Available',
    rating: detailed.ratingValue ?? detailed.rating ?? 0,
    reviewCount: detailed.reviewCount ?? 0,
    tags: detailed.tags ?? '',
    condition: detailed.condition ?? '',
    location: detailed.location ?? 'Pan India',
    activeDeal: detailed.activeDeal ?? null,
    userAddress: buildUserAddress(user),
    addedAt: existing?.addedAt ?? now,
    updatedAt: now,
  }
}

export function buildCartItemSnapshot(product, user, options = {}, existing = null) {
  const productId = product.id ?? product.productId
  const durationPlanId = options.durationPlanId ?? '1m'
  const key = options.key ?? `${productId}-${durationPlanId}`
  const snapshot = buildProductSnapshot(product, user, existing)

  return {
    key,
    ...snapshot,
    quantity: options.quantity ?? existing?.quantity ?? 1,
    durationPlanId,
    durationLabel: options.durationLabel ?? existing?.durationLabel ?? '',
    unitPrice: options.unitPrice ?? existing?.unitPrice ?? snapshot.rentalPrice,
  }
}

export function buildOrderItemSnapshot(cartItem, user) {
  const detailed = getProductById(cartItem.productId) ?? cartItem
  const snapshot = buildProductSnapshot(detailed, user)

  return {
    key: cartItem.key,
    ...snapshot,
    quantity: cartItem.quantity ?? 1,
    durationPlanId: cartItem.durationPlanId ?? '1m',
    durationLabel: cartItem.durationLabel ?? '',
    unitPrice: cartItem.unitPrice ?? snapshot.rentalPrice,
    lineTotal: (cartItem.unitPrice ?? snapshot.rentalPrice) * (cartItem.quantity ?? 1),
  }
}
