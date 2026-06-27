import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Coins, IndianRupee, Package, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getContentSalesTrend, getContentSummaryStats } from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
import {
  AdminSectionTitle,
  AdminStatusBadge,
  adminPanelClass,
  adminSelectTriggerClass,
} from './admin-ui'
import { cn } from '@/lib/utils'

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

const STAT_TONE_CLASS = {
  amber: 'border-[#f0d9a8] bg-[#fff8ea] text-[#8a6200]',
  teal: 'border-[#b8dfc4] bg-[#eef8f0] text-[#1f6b3a]',
  yellow: 'border-[#e5e5e5] bg-[#f5f5f5] text-[#1a1a1a]',
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
    <article
      className={cn(
        adminPanelClass,
        'flex items-start gap-3 rounded-none p-4 transition-colors hover:border-[#1a1a1a]',
      )}
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center border',
          STAT_TONE_CLASS[tone],
        )}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>
      <div>
        <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#666] uppercase">
          {label}
        </span>
        <strong className="block text-lg font-bold text-[#1a1a1a]">{value}</strong>
        <em
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs font-semibold not-italic',
            isPositive ? 'text-[#1f6b3a]' : 'text-[#c0392b]',
          )}
        >
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
    <section
      className={cn(adminPanelClass, 'flex flex-col gap-4 rounded-none p-4')}
      aria-label="Rental sales statistics"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <AdminSectionTitle className="text-base normal-case tracking-tight">
          Rental sales statistics
        </AdminSectionTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full sm:w-[180px]')} aria-label="Chart period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isDemo && (
        <AdminStatusBadge tone="info" className="normal-case">Sample trend data</AdminStatusBadge>
      )}

      <div className="overflow-hidden border border-[#e5e5e5] bg-[#fafafa]">
        <svg
          className="block h-auto w-full"
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
                stroke="#e5e5e5"
                strokeWidth="1"
              />
              <text
                x="8"
                y={tick.y + 4}
                className="fill-[#888] text-[10px]"
              >
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
                className="fill-[#666] text-[10px] font-semibold"
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

        <ul className="m-0 flex list-none flex-wrap gap-4 border-t border-[#e5e5e5] bg-white px-4 py-3">
          {keys.map((key) => (
            <li key={key} className="inline-flex items-center gap-2 text-xs font-semibold text-[#666]">
              <span
                className="size-2.5 rounded-none"
                style={{ backgroundColor: LINE_COLORS[key] }}
                aria-hidden="true"
              />
              {LINE_LABELS[key]}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
