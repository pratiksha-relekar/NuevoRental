import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { getContentGrowthQuarters } from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
import {
  AdminIconButton,
  AdminSectionTitle,
  AdminStatusBadge,
  adminPanelClass,
} from './admin-ui'
import { cn } from '@/lib/utils'

function formatCompactINR(value) {
  if (value >= 100000) return `₹${Math.round(value / 1000)}k`
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`
  return formatINR(value)
}

export function AdminContentGrowthChart() {
  const reduceMotion = useReducedMotion()
  const { quarters, totalRevenue, isDemo } = useMemo(() => getContentGrowthQuarters(), [])

  const maxValue = Math.max(...quarters.flatMap((quarter) => [quarter.rentalRevenue, quarter.listingAdds * 1800]), 1)

  return (
    <section
      className={cn(adminPanelClass, 'flex h-full flex-col gap-3.5 rounded-none p-4')}
      aria-label="Growth statistics"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <AdminSectionTitle className="mb-2 text-base normal-case tracking-tight">
            Growth statistics
          </AdminSectionTitle>
          <AdminStatusBadge tone="success" className="normal-case">Yearly</AdminStatusBadge>
        </div>
        <AdminIconButton aria-label="View growth details">
          <ArrowUpRight size={16} />
        </AdminIconButton>
      </div>

      <div>
        <span className="mb-1 block text-xs text-[#888]">Total revenue</span>
        <motion.strong
          className="text-[clamp(24px,2.5vw,32px)] font-extrabold tracking-tight text-[#1a1a1a]"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatINR(totalRevenue)}
        </motion.strong>
      </div>

      {isDemo && (
        <AdminStatusBadge tone="info" className="normal-case">Sample quarterly data</AdminStatusBadge>
      )}

      <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
        <li className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666]">
          <span
            className="size-3 rounded-none bg-[#1a1a1a]"
            aria-hidden="true"
          />
          Rental bookings
        </li>
        <li className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666]">
          <span
            className="size-3 rounded-none border border-[#d8d8d8] bg-[repeating-linear-gradient(-45deg,#ececec,#ececec_2px,#f5f5f5_2px,#f5f5f5_4px)]"
            aria-hidden="true"
          />
          Product listings
        </li>
      </ul>

      <div
        className="flex items-end gap-3 min-h-[140px] sm:gap-4"
        role="img"
        aria-label="Quarterly rental and listing growth"
      >
        {quarters.map((quarter, quarterIndex) => {
          const rentalHeight = (quarter.rentalRevenue / maxValue) * 100
          const listingHeight = ((quarter.listingAdds * 1800) / maxValue) * 100

          return (
            <div key={quarter.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex h-[120px] w-full items-end justify-center gap-1 sm:h-[140px] sm:gap-1.5">
                <motion.div
                  className="w-[38%] max-w-7 rounded-none bg-[repeating-linear-gradient(-45deg,#ececec,#ececec_2px,#f5f5f5_2px,#f5f5f5_4px)] border border-[#e5e5e5]"
                  initial={reduceMotion ? false : { height: 0, opacity: 0.4 }}
                  animate={{ height: `${listingHeight}%`, opacity: 1 }}
                  transition={{
                    delay: 0.15 + quarterIndex * 0.1,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  title={`Listings: ${quarter.listingAdds}`}
                />
                <motion.div
                  className="w-[38%] max-w-7 rounded-none bg-[#1a1a1a]"
                  initial={reduceMotion ? false : { height: 0, opacity: 0.4 }}
                  animate={{ height: `${rentalHeight}%`, opacity: 1 }}
                  transition={{
                    delay: 0.22 + quarterIndex * 0.1,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  title={`Revenue: ${formatINR(quarter.rentalRevenue)}`}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#1a1a1a]">
                {formatCompactINR(quarter.rentalRevenue)}
              </span>
              <span className="text-[10px] font-semibold tracking-wide text-[#888] uppercase">
                {quarter.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
