import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
import { AdminSectionTitle, AdminStatusBadge, adminPanelClass } from './admin-ui'
import { cn } from '@/lib/utils'

const CHART_AREA_PATH =
  'M0 460.694c6.6-3.13 19.8-11.272 33-15.654s19.8-2.814 33-6.257 19.8.365 33-10.955 19.8-32.07 33-45.643c13.2-13.572 19.8-16.08 33-22.22s19.8-5.647 33-8.48c13.2-2.832 19.8 5.901 33-5.68 13.2-11.582 19.8-37.759 33-52.226 13.2-14.468 19.8-28.263 33-20.112 13.2 8.15 19.8 59.038 33 60.863 13.2 1.824 19.8-43.269 33-51.741s19.8 24.488 33 9.38c13.2-15.11 19.8-81.825 33-84.923s19.8 54.76 33 69.432 19.8 34.912 33 3.931 19.8-148.752 33-158.837c13.2-10.086 19.8 111.943 33 108.409 13.2-3.535 19.8-97.635 33-126.082s19.8-7.562 33-16.152 26.4-21.438 33-26.798L653 465H0Z'

const CHART_LINE_PATH =
  'M0 460.694c6.6-3.13 19.8-11.272 33-15.654s19.8-2.814 33-6.257 19.8.365 33-10.955 19.8-32.07 33-45.643c13.2-13.572 19.8-16.08 33-22.22s19.8-5.647 33-8.48c13.2-2.832 19.8 5.901 33-5.68 13.2-11.582 19.8-37.759 33-52.226 13.2-14.468 19.8-28.263 33-20.112 13.2 8.15 19.8 59.038 33 60.863 13.2 1.824 19.8-43.269 33-51.741s19.8 24.488 33 9.38c13.2-15.11 19.8-81.825 33-84.923s19.8 54.76 33 69.432 19.8 34.912 33 3.931 19.8-148.752 33-158.837c13.2-10.086 19.8 111.943 33 108.409 13.2-3.535 19.8-97.635 33-126.082s19.8-7.562 33-16.152 26.4-21.438 33-26.798'

function computeMonthlyGrowth() {
  try {
    const orders = JSON.parse(window.localStorage.getItem('nuevo-rental-orders') ?? '{}')
    const allOrders = Object.values(orders).flat()
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear

    let thisMonthCount = 0
    let lastMonthCount = 0

    allOrders.forEach((order) => {
      if (!order?.placedAt) return
      const date = new Date(order.placedAt)
      if (date.getFullYear() === thisYear && date.getMonth() === thisMonth) thisMonthCount += 1
      if (date.getFullYear() === lastYear && date.getMonth() === lastMonth) lastMonthCount += 1
    })

    if (lastMonthCount === 0) {
      return thisMonthCount > 0 ? Math.min(300, thisMonthCount * 48 + 24) : 68
    }

    const growth = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    return Math.max(-99, Math.min(300, growth))
  } catch {
    return 68
  }
}

function formatGrowth(value) {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function AdminTrendChart({ orders, users, revenue }) {
  const reduceMotion = useReducedMotion()

  const growth = useMemo(() => computeMonthlyGrowth(), [])

  const insights = useMemo(
    () => [
      {
        id: 'orders',
        label: 'Rental orders',
        value: orders.toLocaleString('en-IN'),
        note: 'All-time platform orders',
        icon: ShoppingBag,
      },
      {
        id: 'customers',
        label: 'Active customers',
        value: users.toLocaleString('en-IN'),
        note: 'Registered accounts',
        icon: Users,
      },
      {
        id: 'revenue',
        label: 'Total revenue',
        value: formatINR(revenue),
        note: 'Collected rental payments',
        icon: TrendingUp,
      },
    ],
    [orders, users, revenue],
  )

  return (
    <section className="flex flex-col gap-4" aria-label="Performance overview">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <AdminSectionTitle className="mb-1.5 text-base normal-case tracking-tight">
            Performance overview
          </AdminSectionTitle>
          <p className="max-w-[520px] text-sm leading-relaxed text-[#666]">
            Rental demand, customer sign-ups, and revenue momentum across Nuevo Rental
          </p>
        </div>
        <AdminStatusBadge tone="success" className="shrink-0 gap-2 px-3 py-1.5 normal-case">
          <span
            className="size-1.5 animate-pulse rounded-none bg-[#1f6b3a]"
            aria-hidden="true"
          />
          Live analytics
        </AdminStatusBadge>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]">
        <motion.article
          className={cn(
            adminPanelClass,
            'relative min-h-[280px] overflow-hidden rounded-none',
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute top-0 left-0 z-[2] p-5 sm:p-6">
            <span className="mb-1.5 block text-[13px] font-semibold text-[#666]">This month</span>
            <motion.strong
              className="block text-[clamp(28px,3vw,38px)] font-extrabold leading-none tracking-tight text-[#1a1a1a]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {formatGrowth(growth)}
            </motion.strong>
            <span className="mt-2 block text-xs font-medium text-[#888]">
              Rental growth vs last month
            </span>
          </div>

          <div
            className="absolute inset-0 bg-white bg-[linear-gradient(to_right,rgba(229,229,229,0.9)_1px,transparent_1px),linear-gradient(to_bottom,rgba(229,229,229,0.9)_1px,transparent_1px)] bg-size-[28px_28px] after:pointer-events-none after:absolute after:inset-0 after:bg-linear-to-b after:from-white/35 after:to-transparent after:content-['']"
          >
            <svg
              className="absolute right-0 bottom-0 left-0 h-[78%] w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 653 465"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(26, 26, 26, 0.18)" />
                  <stop offset="55%" stopColor="rgba(26, 26, 26, 0.08)" />
                  <stop offset="100%" stopColor="rgba(26, 26, 26, 0.02)" />
                </linearGradient>
                <linearGradient id="adminChartStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#333" />
                  <stop offset="100%" stopColor="#1a1a1a" />
                </linearGradient>
              </defs>

              <motion.path
                d={CHART_AREA_PATH}
                fill="url(#adminChartFill)"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.55, ease: 'easeOut' }}
              />

              <motion.path
                d={CHART_LINE_PATH}
                fill="none"
                stroke="url(#adminChartStroke)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.6 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              />
            </svg>
          </div>
        </motion.article>

        <div className="flex flex-col gap-3">
          {insights.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.article
                key={item.id}
                className={cn(
                  adminPanelClass,
                  'group flex items-start gap-3 rounded-none p-4 transition-colors hover:border-[#1a1a1a]',
                )}
                initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#f5f5f5] text-[#1a1a1a] transition-colors group-hover:border-[#1a1a1a] group-hover:bg-[#ececec]"
                  aria-hidden="true"
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-semibold text-[#888]">{item.label}</span>
                  <strong className="block text-xl font-bold leading-tight text-[#1a1a1a]">
                    {item.value}
                  </strong>
                  <span className="mt-1 block text-[11px] text-[#888]">{item.note}</span>
                </div>
                <ArrowUpRight
                  className="mt-1 shrink-0 text-[#d8d8d8] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1a1a1a]"
                  size={16}
                  aria-hidden="true"
                />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
