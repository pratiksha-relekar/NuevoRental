import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { RENTAL_PRODUCTS } from '../../data/products'
import { formatINR } from '../../utils/cartSummary'
import {
  AdminOutlineButton,
  AdminSectionTitle,
  AdminStatusBadge,
  adminPanelClass,
} from './admin-ui'
import { cn } from '@/lib/utils'

const BADGE_VARIANTS = ['pink', 'pink', 'blue', 'purple']

const BADGE_TONE_CLASS = {
  pink: 'border-[#f0caca] bg-[#fdf2f2] text-[#a94442]',
  blue: 'border-[#c8daf5] bg-[#eef4fd] text-[#245ea8]',
  purple: 'border-[#ddd] bg-[#f5f5f5] text-[#444]',
}

const SEGMENT_COLORS = {
  laptops: '#7b6fd6',
  mobiles: '#4a90e2',
  accessories: '#c2557a',
  other: '#d5dce6',
}

function loadAllOrders() {
  try {
    const records = JSON.parse(window.localStorage.getItem('nuevo-rental-orders') ?? '{}')
    return Object.entries(records).flatMap(([email, list]) =>
      (Array.isArray(list) ? list : []).map((order) => ({ ...order, userEmail: email })),
    )
  } catch {
    return []
  }
}

function categorizeItem(item) {
  const category = (item?.category ?? item?.type ?? '').toLowerCase()
  const name = (item?.name ?? '').toLowerCase()

  if (category.includes('laptop') || category.includes('desktop') || name.includes('laptop') || name.includes('macbook')) {
    return 'laptops'
  }
  if (category.includes('mobile') || category.includes('phone') || category.includes('tablet') || name.includes('iphone')) {
    return 'mobiles'
  }
  if (category.includes('watch') || category.includes('projector') || category.includes('accessory')) {
    return 'accessories'
  }
  return 'other'
}

function computeRevenueBreakdown() {
  const orders = loadAllOrders()
  const buckets = { laptops: 0, mobiles: 0, accessories: 0, other: 0 }

  orders.forEach((order) => {
    const items = order?.items ?? []
    if (items.length === 0) {
      buckets.other += order?.summary?.payAmount ?? 0
      return
    }

    const orderTotal = order?.summary?.payAmount ?? 0
    const perItem = orderTotal / items.length

    items.forEach((item) => {
      const key = categorizeItem(item)
      buckets[key] += perItem
    })
  })

  const total = Object.values(buckets).reduce((sum, value) => sum + value, 0)

  if (total === 0) {
    const demoTotal = 126583
    return {
      total: demoTotal,
      segments: [
        { id: 'laptops', label: 'Laptop rentals', percent: 58, amount: demoTotal * 0.58, color: SEGMENT_COLORS.laptops },
        { id: 'mobiles', label: 'Mobile rentals', percent: 12, amount: demoTotal * 0.12, color: SEGMENT_COLORS.mobiles },
        { id: 'accessories', label: 'Accessories', percent: 14, amount: demoTotal * 0.14, color: SEGMENT_COLORS.accessories },
        { id: 'other', label: 'Other devices', percent: 16, amount: demoTotal * 0.16, color: SEGMENT_COLORS.other },
      ],
      isDemo: true,
    }
  }

  const segments = [
    { id: 'laptops', label: 'Laptop rentals', color: SEGMENT_COLORS.laptops },
    { id: 'mobiles', label: 'Mobile rentals', color: SEGMENT_COLORS.mobiles },
    { id: 'accessories', label: 'Accessories', color: SEGMENT_COLORS.accessories },
    { id: 'other', label: 'Other devices', color: SEGMENT_COLORS.other },
  ].map((segment) => {
    const amount = buckets[segment.id]
    return {
      ...segment,
      amount,
      percent: Math.round((amount / total) * 100),
    }
  })

  const percentSum = segments.reduce((sum, segment) => sum + segment.percent, 0)
  if (percentSum !== 100 && segments.length > 0) {
    const diff = 100 - percentSum
    segments[0].percent += diff
  }

  return { total, segments, isDemo: false }
}

function formatOrderTime(isoDate) {
  if (!isoDate) return 'Just now'
  return new Date(isoDate).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NR'
  )
}

function loadRecentRentals() {
  const orders = loadAllOrders()
    .sort((a, b) => new Date(b.placedAt ?? 0) - new Date(a.placedAt ?? 0))
    .slice(0, 4)

  if (orders.length > 0) {
    return orders.map((order, index) => ({
      id: order.id ?? `order-${index}`,
      name: order.delivery?.fullName ?? order.userEmail?.split('@')[0] ?? 'Customer',
      subtitle: order.items?.[0]?.name ?? 'Rental booking',
      time: formatOrderTime(order.placedAt),
      badge: BADGE_VARIANTS[index % BADGE_VARIANTS.length],
    }))
  }

  const demoProducts = RENTAL_PRODUCTS.slice(0, 4)
  const demoNames = ['Aarav Mehta', 'Priya Sharma', 'Rohan Kapoor', 'Neha Desai']
  const demoTimes = ['9:15 AM', '10:40 AM', '11:05 AM', '12:20 PM']

  return demoProducts.map((product, index) => ({
    id: `demo-${product.id}`,
    name: demoNames[index],
    subtitle: product.name,
    time: demoTimes[index],
    badge: BADGE_VARIANTS[index % BADGE_VARIANTS.length],
  }))
}

function DonutChart({ segments, centerPercent, reduceMotion }) {
  const size = 168
  const stroke = 20
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  let cumulative = 0

  return (
    <div className="relative mx-auto size-[168px]">
      <svg
        className="block"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#ececec"
          strokeWidth={stroke}
        />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {segments.map((segment, index) => {
            const dash = (segment.percent / 100) * circumference
            const offset = cumulative
            cumulative += dash

            return (
              <motion.circle
                key={segment.id}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
                initial={reduceMotion ? false : { strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dash} ${circumference}` }}
                transition={{
                  delay: 0.15 + index * 0.12,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            )
          })}
        </g>
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong className="text-2xl font-extrabold tracking-tight text-[#1a1a1a]">
          {centerPercent}%
        </strong>
        <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-[#666] uppercase">
          Collected
        </span>
      </motion.div>
    </div>
  )
}

export function AdminRevenueSection() {
  const reduceMotion = useReducedMotion()

  const { total, segments, isDemo } = useMemo(() => computeRevenueBreakdown(), [])
  const recentRentals = useMemo(() => loadRecentRentals(), [])

  const centerPercent = useMemo(
    () => segments.reduce((sum, segment) => sum + segment.percent, 0),
    [segments],
  )

  return (
    <section
      className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)]"
      aria-label="Revenue breakdown"
    >
      <motion.article
        className={cn(adminPanelClass, 'rounded-none p-5')}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <AdminSectionTitle className="text-base normal-case tracking-tight">
            Recent rentals
          </AdminSectionTitle>
          <AdminOutlineButton
            className="h-8 gap-1 px-3 text-[11px] normal-case"
            aria-label="Filter by today"
          >
            Today
            <ChevronDown size={14} aria-hidden="true" />
          </AdminOutlineButton>
        </div>

        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {recentRentals.map((item, index) => (
            <motion.li
              key={item.id}
              className="flex items-center gap-3 rounded-none px-1 py-1 transition-colors hover:bg-[#f5f5f5]"
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.35 }}
            >
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#f5f5f5] text-xs font-bold text-[#1a1a1a]"
                aria-hidden="true"
              >
                {getInitials(item.name)}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#1a1a1a]">
                  {item.name}
                </strong>
                <span className="block truncate text-xs text-[#666]">{item.subtitle}</span>
              </div>
              <AdminStatusBadge
                tone="neutral"
                className={cn('shrink-0 normal-case', BADGE_TONE_CLASS[item.badge])}
              >
                {item.time}
              </AdminStatusBadge>
            </motion.li>
          ))}
        </ul>
      </motion.article>

      <motion.article
        className={cn(adminPanelClass, 'rounded-none p-5')}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <AdminSectionTitle className="text-base normal-case tracking-tight">
            Total revenue
          </AdminSectionTitle>
          {isDemo && (
            <AdminStatusBadge tone="neutral" className="normal-case">Sample data</AdminStatusBadge>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <DonutChart
            segments={segments}
            centerPercent={centerPercent}
            reduceMotion={reduceMotion}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4">
              <span className="mb-1 block text-xs font-semibold tracking-wide text-[#666] uppercase">
                Total revenue
              </span>
              <motion.strong
                className="text-[clamp(22px,2.5vw,28px)] font-extrabold tracking-tight text-[#1a1a1a]"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {formatINR(total)}
              </motion.strong>
            </div>

            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {segments.map((segment, index) => (
                <motion.li
                  key={segment.id}
                  className="flex items-center gap-2.5 text-sm"
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.08, duration: 0.35 }}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-none"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 text-[#666]">{segment.label}</span>
                  <span className="font-semibold text-[#1a1a1a]">{segment.percent}%</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </section>
  )
}
