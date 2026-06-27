import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getContentGrowthQuarters } from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
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
    <section className="admin-content-growth-chart" aria-label="Growth statistics">
      <div className="admin-content-growth-head">
        <div>
          <h3>Growth statistics</h3>
          <span className="admin-content-growth-badge">Yearly</span>
        </div>
        <Button type="button" variant="outline" size="icon-sm" className="admin-content-growth-expand" aria-label="View growth details">
          <ArrowUpRight size={16} />
        </Button>
      </div>

      <div className="admin-content-growth-total">
        <span>Total revenue</span>
        <motion.strong
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatINR(totalRevenue)}
        </motion.strong>
      </div>

      {isDemo && <span className="admin-content-demo-tag">Sample quarterly data</span>}

      <ul className="admin-content-growth-legend">
        <li>
          <span className="admin-content-growth-legend-swatch admin-content-growth-legend-swatch--rental" />
          Rental bookings
        </li>
        <li>
          <span className="admin-content-growth-legend-swatch admin-content-growth-legend-swatch--listing" />
          Product listings
        </li>
      </ul>

      <div className="admin-content-growth-bars" role="img" aria-label="Quarterly rental and listing growth">
        {quarters.map((quarter, quarterIndex) => {
          const rentalHeight = (quarter.rentalRevenue / maxValue) * 100
          const listingHeight = ((quarter.listingAdds * 1800) / maxValue) * 100

          return (
            <div key={quarter.id} className="admin-content-growth-group">
              <div className="admin-content-growth-bar-pair">
                <motion.div
                  className="admin-content-growth-bar admin-content-growth-bar--listing"
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
                  className="admin-content-growth-bar admin-content-growth-bar--rental"
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
              <span className="admin-content-growth-bar-value">{formatCompactINR(quarter.rentalRevenue)}</span>
              <span className="admin-content-growth-quarter">{quarter.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
