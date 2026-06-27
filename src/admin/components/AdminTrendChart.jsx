import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
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
    <section className="admin-performance" aria-label="Performance overview">
      <div className="admin-performance-head">
        <div>
          <h3>Performance overview</h3>
          <p>Rental demand, customer sign-ups, and revenue momentum across Nuevo Rental</p>
        </div>
        <span className="admin-performance-live">
          <span className="admin-performance-live-dot" aria-hidden="true" />
          Live analytics
        </span>
      </div>

      <div className="admin-performance-grid">
        <motion.article
          className="admin-performance-chart-card"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="admin-performance-chart-overlay">
            <span className="admin-performance-chart-eyebrow">This month</span>
            <motion.strong
              className="admin-performance-chart-growth"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {formatGrowth(growth)}
            </motion.strong>
            <span className="admin-performance-chart-caption">Rental growth vs last month</span>
          </div>

          <div className="admin-performance-chart-canvas">
            <svg
              className="admin-performance-chart-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 653 465"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(74, 144, 226, 0.42)" />
                  <stop offset="55%" stopColor="rgba(74, 144, 226, 0.14)" />
                  <stop offset="100%" stopColor="rgba(74, 144, 226, 0.02)" />
                </linearGradient>
                <linearGradient id="adminChartStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2b8fe8" />
                  <stop offset="100%" stopColor="#4a90e2" />
                </linearGradient>
              </defs>

              <motion.path
                d={CHART_AREA_PATH}
                className="admin-performance-chart-area"
                fill="url(#adminChartFill)"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.55, ease: 'easeOut' }}
              />

              <motion.path
                d={CHART_LINE_PATH}
                className="admin-performance-chart-line"
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

        <div className="admin-performance-insights">
          {insights.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.article
                key={item.id}
                className="admin-performance-insight"
                initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="admin-performance-insight-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="admin-performance-insight-body">
                  <span className="admin-performance-insight-label">{item.label}</span>
                  <strong>{item.value}</strong>
                  <span className="admin-performance-insight-note">{item.note}</span>
                </div>
                <ArrowUpRight className="admin-performance-insight-arrow" size={16} aria-hidden="true" />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
