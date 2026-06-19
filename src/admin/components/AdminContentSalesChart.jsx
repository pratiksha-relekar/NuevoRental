import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Coins, IndianRupee, Package, TrendingDown, TrendingUp } from 'lucide-react'
import { getContentSalesTrend, getContentSummaryStats } from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
import './AdminContentSalesChart.css'

const LINE_COLORS = {
  rentalRevenue: '#2aa89a',
  securityDeposits: '#f5a623',
  bookingCount: '#e8c547',
}

const LINE_LABELS = {
  rentalRevenue: 'Rental revenue',
  securityDeposits: 'Security deposits',
  bookingCount: 'Bookings',
}

function formatAxisValue(value) {
  if (value >= 100000) return `₹${Math.round(value / 1000)}k`
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`
  return `₹${value}`
}

function buildChartGeometry(points, keys, width, height, padding) {
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const allValues = points.flatMap((point) => keys.map((key) => point[key]))
  const maxValue = Math.max(...allValues, 1)
  const minValue = 0

  const xStep = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth

  const lines = keys.map((key) => {
    const coords = points.map((point, index) => {
      const normalized = (point[key] - minValue) / (maxValue - minValue || 1)
      const x = padding.left + index * xStep
      const y = padding.top + chartHeight - normalized * chartHeight
      return { x, y }
    })

    const path = coords
      .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
      .join(' ')

    return { key, path, coords }
  })

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padding.top + chartHeight - ratio * chartHeight,
    label: formatAxisValue(minValue + (maxValue - minValue) * ratio),
  }))

  return { lines, yTicks, maxValue }
}

function SummaryStat({ icon: Icon, label, value, change, tone }) {
  const isPositive = change >= 0

  return (
    <article className={`admin-content-sales-stat admin-content-sales-stat--${tone}`}>
      <span className="admin-content-sales-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <em className={isPositive ? 'is-up' : 'is-down'}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(2)}%
        </em>
      </div>
    </article>
  )
}

export function AdminContentSalesChart() {
  const reduceMotion = useReducedMotion()
  const [period, setPeriod] = useState('6')

  const monthCount = period === '3' ? 3 : period === '12' ? 12 : 6
  const { months, isDemo } = useMemo(() => getContentSalesTrend(monthCount), [monthCount])
  const summary = useMemo(() => getContentSummaryStats(), [])

  const keys = ['rentalRevenue', 'securityDeposits', 'bookingCount']
  const geometry = useMemo(
    () => buildChartGeometry(months, keys, 720, 280, { top: 24, right: 24, bottom: 36, left: 52 }),
    [months],
  )

  return (
    <section className="admin-content-sales-chart" aria-label="Rental sales statistics">
      <div className="admin-content-sales-head">
        <h3>Rental sales statistics</h3>
        <label className="admin-content-sales-filter">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Chart period">
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </div>

      {isDemo && <span className="admin-content-demo-tag">Sample trend data</span>}

      <div className="admin-content-sales-canvas-wrap">
        <svg
          className="admin-content-sales-svg"
          viewBox="0 0 720 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {geometry.lines.map((line) => (
              <linearGradient key={`fill-${line.key}`} id={`contentFill-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLORS[line.key]} stopOpacity="0.18" />
                <stop offset="100%" stopColor={LINE_COLORS[line.key]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {geometry.yTicks.map((tick) => (
            <g key={tick.label}>
              <line
                x1="52"
                y1={tick.y}
                x2="696"
                y2={tick.y}
                className="admin-content-sales-grid-line"
              />
              <text x="8" y={tick.y + 4} className="admin-content-sales-axis-label">
                {tick.label}
              </text>
            </g>
          ))}

          {months.map((point, index) => {
            const x = 52 + (months.length > 1 ? (624 / (months.length - 1)) * index : 0)
            return (
              <text
                key={point.key}
                x={x}
                y="272"
                className="admin-content-sales-axis-label admin-content-sales-axis-label--month"
              >
                {point.label}
              </text>
            )
          })}

          {geometry.lines.map((line, lineIndex) => (
            <g key={line.key}>
              <motion.path
                d={`${line.path} L ${line.coords[line.coords.length - 1].x} 256 L ${line.coords[0].x} 256 Z`}
                fill={`url(#contentFill-${line.key})`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + lineIndex * 0.1, duration: 0.5 }}
              />
              <motion.path
                d={line.path}
                fill="none"
                stroke={LINE_COLORS[line.key]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.15 + lineIndex * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </g>
          ))}
        </svg>

        <ul className="admin-content-sales-legend">
          {keys.map((key) => (
            <li key={key}>
              <span style={{ backgroundColor: LINE_COLORS[key] }} aria-hidden="true" />
              {LINE_LABELS[key]}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-content-sales-stats">
        <SummaryStat
          icon={IndianRupee}
          label="Total rental sales"
          value={formatINR(summary.totalSales)}
          change={summary.salesChange}
          tone="amber"
        />
        <SummaryStat
          icon={Coins}
          label="Security deposits"
          value={formatINR(summary.totalProfit)}
          change={summary.profitChange}
          tone="teal"
        />
        <SummaryStat
          icon={Package}
          label="Fulfillment cost"
          value={formatINR(summary.totalCost)}
          change={summary.costChange}
          tone="yellow"
        />
      </div>
    </section>
  )
}
