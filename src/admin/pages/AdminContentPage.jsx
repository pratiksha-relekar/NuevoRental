import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  LayoutGrid,
  Megaphone,
  Package,
  Sparkles,
} from 'lucide-react'
import { AdminContentGrowthChart } from '../components/AdminContentGrowthChart'
import { AdminContentSalesChart } from '../components/AdminContentSalesChart'
import {
  getContentAlert,
  getContentSections,
  getContentSummaryStats,
  getTopProductListings,
} from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
const SECTION_ICONS = {
  homepage: Sparkles,
  'rent-products': Package,
  categories: LayoutGrid,
  deals: Megaphone,
  corporate: FileText,
  support: Globe,
}

function ContentSectionCard({ section, index, reduceMotion }) {
  const Icon = SECTION_ICONS[section.id] ?? Layers

  return (
    <motion.div
      className={`admin-content-section-card admin-content-section-card--${section.accent}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <div className="admin-content-section-card-top">
        <span className="admin-content-section-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="admin-content-section-stat">
          {section.stat ?? '—'}
          <small>{section.statLabel}</small>
        </span>
      </div>
      <h3>{section.title}</h3>
      <p>{section.description}</p>
      <div className="admin-content-section-actions">
        {section.adminPath && (
          <Link to={section.adminPath} className={cn(buttonVariants(), 'admin-content-section-btn')}>
            Manage in admin
          </Link>
        )}
        {section.path && (
          <a href={section.path} target="_blank" rel="noreferrer" className="admin-content-section-link">
            <ExternalLink size={14} aria-hidden="true" />
            View on website
          </a>
        )}
      </div>
    </motion.div>
  )
}

function AdminContentPage() {
  const reduceMotion = useReducedMotion()

  const alert = useMemo(() => getContentAlert(), [])
  const sections = useMemo(() => getContentSections(), [])
  const summary = useMemo(() => getContentSummaryStats(), [])
  const topListings = useMemo(() => getTopProductListings(5), [])

  return (
    <div className="admin-content-page">
      <header className="admin-content-page-head">
        <div>
          <h1>Website content</h1>
          <p>
            Monitor rental listing performance, review storefront sections, and keep Nuevo Rental
            product pages fresh for customers.
          </p>
        </div>
      </header>

      <motion.aside
        className="admin-content-alert"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Alert className="admin-content-alert-copy border-0 bg-transparent p-0 shadow-none">
          <span className="admin-content-alert-icon" aria-hidden="true">🏠</span>
          <div>
            <AlertTitle>
              {alert.count} rental listing{alert.count === 1 ? '' : 's'} need your attention
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </div>
        </Alert>
        <Link to="/admin/products" className={cn(buttonVariants(), 'admin-content-alert-btn')}>
          Review listings
        </Link>
      </motion.aside>

      <div className="admin-content-analytics-grid">
        <motion.div
          className="admin-content-analytics-main"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminContentSalesChart />
        </motion.div>

        <motion.div
          className="admin-content-analytics-side"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminContentGrowthChart />
        </motion.div>
      </div>

      <section className="admin-content-quick-stats" aria-label="Content overview">
        <article className="admin-content-quick-stat">
          <span>Active listings</span>
          <strong>{summary.activeListings}</strong>
          <small>devices on rent catalog</small>
        </article>
        <article className="admin-content-quick-stat">
          <span>Categories</span>
          <strong>{summary.categoryCount}</strong>
          <small>storefront groupings</small>
        </article>
        <article className="admin-content-quick-stat">
          <span>Content sections</span>
          <strong>{sections.length}</strong>
          <small>managed website areas</small>
        </article>
        <article className="admin-content-quick-stat">
          <span>Catalog revenue</span>
          <strong>{formatINR(summary.totalSales)}</strong>
          <small>all-time rental value</small>
        </article>
      </section>

      <section className="admin-content-sections-wrap">
        <div className="admin-content-sections-head">
          <div>
            <h2>Storefront content modules</h2>
            <p>Manage homepage, product listing, deals, and support content across the Nuevo Rental website.</p>
          </div>
          <Link to="/" target="_blank" rel="noreferrer" className="admin-content-view-site">
            View live website
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="admin-content-sections-grid">
          {sections.map((section, index) => (
            <ContentSectionCard
              key={section.id}
              section={section}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </section>

      <section className="admin-content-listings-panel">
        <div className="admin-content-listings-head">
          <div>
            <h2>Top product listings</h2>
            <p>Most booked rental devices based on order activity and listing engagement.</p>
          </div>
          <Link to="/admin/products" className="admin-content-listings-link">
            Open products admin
          </Link>
        </div>

        <div className="admin-content-listings-table-wrap">
          <Table className="admin-content-listings-table">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rental price</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <strong>{listing.title}</strong>
                    {listing.featured && <Badge className="admin-content-featured-tag">Featured</Badge>}
                  </TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>{formatINR(listing.rentalPrice)}</TableCell>
                  <TableCell>{listing.bookings}</TableCell>
                  <TableCell>{listing.views ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={`admin-content-listing-status admin-content-listing-status--${listing.status}`}>
                      {listing.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

export default AdminContentPage
