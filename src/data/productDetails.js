import {
  laptopAsus,
  laptopMacbookSilver,
  laptopMacbookBack,
  laptopMacbookRose,
  laptopPro,
} from '../assets/laptop'
import laptopDarkImg from '../assets/processed/laptop-dark.png'
import laptopSilverImg from '../assets/processed/laptop-silver.png'
import laptopColorImg from '../assets/processed/laptop-color.png'
import {
  desktopDellVostro1,
  desktopLenovo,
  desktopHpProdesk,
  desktopDellVostro2,
} from '../assets/Desktop'
import {
  mobileTrio1,
  mobileTrio2,
  mobileTrio3,
  mobileIphoneColors,
  mobileIphonePro,
} from '../assets/mobile'
import {
  watchSmartWhite,
  watchAppleBlack,
  watchChronographDuo,
  watchAppleInfograph,
  watchAppleSport,
} from '../assets/watches'
import {
  printerLaserjetWhite,
  printerOfficeSet,
  printerInkjetPhoto,
} from '../assets/printer'
import {
  projectorPortable,
  projectorPanasonic,
  projectorGalaxy,
  projectorBenq,
} from '../assets/projector'
import networkingImg from '../assets/categories/networking.png'
import accessoriesImg from '../assets/categories/accessories.png'
import {
  tvThomsonSmart,
  tvDualView,
  tv4kUltra,
} from '../assets/TV'
import { getCatalogProducts, getCategoryLabelMap } from './catalogStorage'
import { getProductImage } from './products'
import { getDealById } from './featuredDeals'
import { getRentalDurationPlans } from './projectPlans'

const GALLERY_BY_CATEGORY = {
  laptops: [laptopPro, laptopAsus, laptopMacbookBack, laptopMacbookRose, laptopMacbookSilver],
  desktops: [desktopDellVostro1, desktopLenovo, desktopHpProdesk, desktopDellVostro2],
  mobiles: [mobileTrio1, mobileIphoneColors, mobileIphonePro, mobileTrio2, mobileTrio3],
  tablets: [laptopDarkImg, laptopAsus, laptopPro, laptopMacbookRose],
  monitors: [laptopSilverImg, laptopPro, laptopMacbookBack, laptopMacbookRose],
  tvs: [tvThomsonSmart, tvDualView, tv4kUltra],
  printers: [printerLaserjetWhite, printerOfficeSet, printerInkjetPhoto, accessoriesImg],
  projectors: [projectorBenq, projectorPanasonic, projectorPortable, projectorGalaxy],
  wearables: [watchAppleInfograph, watchAppleBlack, watchSmartWhite, watchChronographDuo, watchAppleSport],
  cctv: [accessoriesImg, networkingImg, accessoriesImg, printerLaserjetWhite],
  accessories: [accessoriesImg, networkingImg, printerLaserjetWhite, projectorBenq],
  networking: [networkingImg, accessoriesImg, printerLaserjetWhite, networkingImg],
  servers: [laptopColorImg, desktopDellVostro1, laptopAsus, laptopPro],
}

const CATEGORY_LABELS = getCategoryLabelMap()

const BRAND_BY_CATEGORY = {
  laptops: 'HP, Dell, Lenovo — Nuevo Tech',
  desktops: 'Apple, Dell, HP — Nuevo Tech',
  mobiles: 'Apple, Samsung, OnePlus',
  tablets: 'Apple, Samsung',
  monitors: 'Dell, LG, BenQ',
  tvs: 'Samsung, LG, Sony, Thomson',
  printers: 'HP, Canon, Epson',
  projectors: 'BenQ, Epson',
  wearables: 'Apple, Samsung',
  cctv: 'Hikvision, CP Plus',
  accessories: 'Logitech, Lapcare',
  networking: 'TP-Link, APC, Cisco',
  servers: 'Dell, HPE',
}

const SPECS_BY_CATEGORY = {
  laptops: [
    { label: 'Processor', value: 'Intel Core i5 (8th to 10th generation)' },
    { label: 'RAM', value: '8GB DDR4 (upgradeable to 16GB on request)' },
    { label: 'Storage', value: '256GB SSD' },
    { label: 'Display', value: '14" / 15.6" Full HD anti-glare' },
    { label: 'OS', value: 'Windows 10 / 11 Pro (licensed)' },
    { label: 'Connectivity', value: 'Wi-Fi, Bluetooth, USB-C, HDMI' },
  ],
  desktops: [
    { label: 'Processor', value: 'Intel Core i5 / Apple M1 (model dependent)' },
    { label: 'RAM', value: '8GB – 16GB' },
    { label: 'Storage', value: '256GB – 512GB SSD' },
    { label: 'Display', value: 'Bundled monitor available on request' },
    { label: 'OS', value: 'Windows 11 Pro / macOS' },
    { label: 'Form Factor', value: 'Tower, AIO, or Mac Mini' },
  ],
  default: [
    { label: 'Condition', value: 'Professionally tested & sanitized' },
    { label: 'Warranty', value: 'Rental support included' },
    { label: 'Delivery', value: 'Doorstep setup available in select cities' },
    { label: 'Support', value: 'Dedicated helpline & pickup service' },
  ],
}

const DESCRIPTION_BY_CATEGORY = {
  laptops: `Rent a high-performance laptop built for professionals, developers, students, and remote teams. Every unit is quality-checked, data-wiped, and ready for immediate use with flexible monthly plans and zero deposit options on eligible models.

Whether you need a device for a short project or a long-term team rollout, Nuevo Rental offers doorstep delivery, quick KYC, and hassle-free pickup when your rental ends. Inventory includes business-grade models from leading brands with specs suited for everyday productivity, coding, and design work.`,
  desktops: `Get a complete desktop workstation for your office, studio, or WFH setup. Choose from tower PCs, all-in-ones, and premium iMac configurations — all tested, sanitized, and delivered ready to plug in.

Ideal for teams that need stable performance for design, accounting, development, or front-desk operations. Flexible rental durations with optional monitor bundles and on-site setup support.`,
  default: `Rent premium electronics with flexible plans tailored to your timeline and budget. All devices pass a 20-point quality check, are sanitized before dispatch, and come with dedicated rental support throughout your subscription.`,
}

const ADDITIONAL_INFO_SECTIONS = [
  {
    title: 'Basic Information',
    items: [
      'Devices are provided for both Personal and Business use.',
      'Devices come with pre-installed licensed OS (Windows / Linux as applicable).',
      'Basic software and drivers required for normal operation will be installed.',
      'Third-party or paid software licenses are not included unless specifically agreed in writing.',
    ],
  },
  {
    title: 'Usage & Care',
    items: [
      'The customer is responsible for safe usage and basic care of the device.',
      'Physical damage, liquid damage, fire damage, theft, or electrical surge damage is not covered under standard rental terms.',
      'Devices must not be opened, modified, or repaired by unauthorized personnel.',
    ],
  },
  {
    title: "What's Included",
    items: [
      'Device & charger / power adapter',
      'OS and basic drivers installed',
      'Replacement support in case of technical failure',
      'Maintenance support during rental period',
    ],
  },
  {
    title: 'Service & Replacement',
    items: [
      'Replacement SLA: Within 72 working hours',
      'Replacement device will be same or higher configuration',
    ],
  },
]

const DESCRIPTION_EXTRAS = {
  serviceReplacement: [
    'Replacement SLA: Within 72 working hours',
    'Replacement device will be same or higher configuration',
  ],
  importantNote: [
    'Images are for representation purposes only.',
    'Final brand and model are allocated based on live inventory. Equivalent or upgraded configurations are ensured.',
    'Prices may vary as per the market and availability',
  ],
  location: 'Available in Pune & PCMC',
  idealFor: 'Ideal for offices, startups, remote teams, and short-term projects',
  keywords: 'office laptop on rent Pune, i7 laptop on rent, business laptop rental, zero deposit laptop rent, monthly laptop rental Pune',
}

export const RENTAL_DURATION_OPTIONS = [1, 3, 6, 12]

export { getRentalDurationPlans, getDefaultProjectPlanId, PROJECT_PLAN_OPTIONS } from './projectPlans'

function getGalleryImages(product) {
  const set = GALLERY_BY_CATEGORY[product.category]
  const main = getProductImage(product)
  const customImages = Array.isArray(product.images) ? product.images.filter(Boolean) : []

  if (customImages.length > 0) {
    return [main, ...customImages.filter((img) => img !== main)].slice(0, 4)
  }

  if (!set) return [main, main, main, main]

  const gallery = [main, ...set.filter((img) => img !== main)]
  return gallery.slice(0, 4)
}

function getSpecifications(product) {
  return SPECS_BY_CATEGORY[product.category] ?? SPECS_BY_CATEGORY.default
}

function getDescription(product) {
  if (product.description?.trim()) {
    return {
      intro: product.description.trim(),
      brandLine: product.additionalInfo?.trim() || `Brands may include: ${BRAND_BY_CATEGORY[product.category] ?? 'Leading OEM partners'}.`,
    }
  }

  const base = DESCRIPTION_BY_CATEGORY[product.category] ?? DESCRIPTION_BY_CATEGORY.default
  const brandLine = product.additionalInfo?.trim()
    || `Brands may include: ${BRAND_BY_CATEGORY[product.category] ?? 'Leading OEM partners'}.`
  return { intro: base, brandLine }
}

export function getProductById(id, dealId = null) {
  const product = getCatalogProducts().find((item) => item.id === Number(id))
  if (!product || product.status === 'inactive' || product.status === 'draft') return null

  let activeDeal = dealId ? getDealById(dealId) : null
  if (activeDeal && activeDeal.productId !== product.id) {
    activeDeal = null
  }

  const pricingBase = activeDeal
    ? {
        ...product,
        rentalPrice: activeDeal.offerPrice,
        originalPrice: activeDeal.originalPrice,
      }
    : product

  const displayTitle = activeDeal?.title ?? product.title
  const gallery = getGalleryImages(product)
  const images = activeDeal?.image
    ? [activeDeal.image, ...gallery.filter((img) => img !== activeDeal.image)]
    : gallery

  const { intro, brandLine } = getDescription(product)

  return {
    ...product,
    title: displayTitle,
    rentalPrice: pricingBase.rentalPrice,
    originalPrice: pricingBase.originalPrice,
    images,
    reviewCount: activeDeal?.reviews ?? 120 + (product.id * 7) % 80,
    ratingValue: activeDeal?.rating ?? product.rating - 0.5,
    deposit: Number(product.securityDeposit) || 0,
    stock: activeDeal?.inStock ? `Available (${activeDeal.stock} in deal)` : 'Available',
    categoryLabel: CATEGORY_LABELS[product.category] ?? 'Electronics',
    brand: BRAND_BY_CATEGORY[product.category] ?? 'Nuevo Tech',
    tags: product.refurbished ? 'As good as new' : 'Premium condition',
    specifications: getSpecifications(product),
    descriptionIntro: intro,
    descriptionBrandLine: brandLine,
    descriptionExtras: DESCRIPTION_EXTRAS,
    additionalInfoSections: ADDITIONAL_INFO_SECTIONS,
    durationPlans: getRentalDurationPlans(pricingBase),
    activeDeal: activeDeal
      ? {
          id: activeDeal.id,
          discountPercent: activeDeal.discountPercent,
          offerPrice: activeDeal.offerPrice,
          originalPrice: activeDeal.originalPrice,
          stock: activeDeal.stock,
          inStock: activeDeal.inStock,
          period: activeDeal.period,
        }
      : null,
  }
}

export function getRelatedProducts(productId, limit = 6) {
  const catalog = getCatalogProducts()
  const current = catalog.find((item) => item.id === Number(productId))
  if (!current) return []

  const sameCategory = catalog.filter(
    (item) => item.id !== current.id && item.category === current.category,
  )

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

  const others = catalog.filter(
    (item) => item.id !== current.id && item.category !== current.category,
  )

  return [...sameCategory, ...others].slice(0, limit)
}

export function getRecommendedProducts(productId, limit = 8) {
  const catalog = getCatalogProducts()
  const current = catalog.find((item) => item.id === Number(productId))
  if (!current) return catalog.slice(0, limit)

  const scored = catalog.filter((item) => item.id !== current.id).map((item) => {
    let score = 0
    if (item.category === current.category) score += 3
    if (item.period === current.period) score += 1
    if (Math.abs(item.rentalPrice - current.rentalPrice) < 1500) score += 2
    return { item, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ item }) => item)
}
