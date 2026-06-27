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
  AdminOutlineButton,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSectionTitle,
  AdminStatCard,
  AdminStatusBadge,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'
import {
  getContentAlert,
  getContentSections,
  getContentSummaryStats,
  getTopProductListings,
} from '../../data/contentStorage'
import { formatINR } from '../../utils/cartSummary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

function listingStatusTone(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'draft':
      return 'warning'
    default:
      return 'neutral'
  }
}

function ContentSectionCard({ section, index, reduceMotion }) {
  const Icon = SECTION_ICONS[section.id] ?? Layers

  return (
    <motion.div
      className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-4"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-9 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-[#1a1a1a]">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="text-right">
          <strong className="block text-lg font-bold text-[#1a1a1a]">{section.stat ?? '—'}</strong>
          <small className="text-xs text-[#888]">{section.statLabel}</small>
        </div>
      </div>
      <h3 className="text-sm font-bold text-[#1a1a1a]">{section.title}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{section.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {section.adminPath ? (
          <Link to={section.adminPath}>
            <AdminOutlineButton className="h-9 px-3 text-[10px]">
              Manage in admin
            </AdminOutlineButton>
          </Link>
        ) : null}
        {section.path ? (
          <a
            href={section.path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#666] hover:text-[#1a1a1a]"
          >
            <ExternalLink size={14} aria-hidden="true" />
            View on website
          </a>
        ) : null}
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
    <AdminPage>
      <AdminPageHeader
        title="Website content"
        description="Monitor rental listing performance, review storefront sections, and keep Nuevo Rental product pages fresh for customers."
      />

      <motion.aside
        className="flex flex-col gap-4 border border-[#e5e5e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Alert className="border-0 bg-transparent p-0 shadow-none">
          <span className="text-xl" aria-hidden="true">
            🏠
          </span>
          <div>
            <AlertTitle className="text-sm font-bold text-[#1a1a1a]">
              {alert.count} rental listing{alert.count === 1 ? '' : 's'} need your attention
            </AlertTitle>
            <AlertDescription className="text-sm text-[#666]">{alert.message}</AlertDescription>
          </div>
        </Alert>
        <Link to="/admin/products">
          <AdminPrimaryButton>Review listings</AdminPrimaryButton>
        </Link>
      </motion.aside>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          className="border border-[#e5e5e5] bg-white"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminContentSalesChart />
        </motion.div>

        <motion.div
          className="border border-[#e5e5e5] bg-white"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminContentGrowthChart />
        </motion.div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Content overview">
        <AdminStatCard
          label="Active listings"
          value={summary.activeListings}
          note="devices on rent catalog"
        />
        <AdminStatCard label="Categories" value={summary.categoryCount} note="storefront groupings" />
        <AdminStatCard label="Content sections" value={sections.length} note="managed website areas" />
        <AdminStatCard
          label="Catalog revenue"
          value={formatINR(summary.totalSales)}
          note="all-time rental value"
        />
      </div>

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminSectionTitle className="normal-case">Storefront content modules</AdminSectionTitle>
            <p className="mt-1 text-sm text-[#666]">
              Manage homepage, product listing, deals, and support content across the Nuevo Rental website.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] hover:underline"
          >
            View live website
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, index) => (
            <ContentSectionCard
              key={section.id}
              section={section}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminSectionTitle className="normal-case">Top product listings</AdminSectionTitle>
            <p className="mt-1 text-sm text-[#666]">
              Most booked rental devices based on order activity and listing engagement.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] hover:underline"
          >
            Open products admin
          </Link>
        </div>

        <div className={adminTableWrapClass}>
          <Table className={adminTableClass}>
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
                    <strong className="text-sm text-[#1a1a1a]">{listing.title}</strong>
                    {listing.featured ? (
                      <AdminStatusBadge tone="dark" className="ml-2">
                        Featured
                      </AdminStatusBadge>
                    ) : null}
                  </TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>{formatINR(listing.rentalPrice)}</TableCell>
                  <TableCell>{listing.bookings}</TableCell>
                  <TableCell>{listing.views ?? '—'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={listingStatusTone(listing.status)}>
                      {listing.status}
                    </AdminStatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminPanel>
    </AdminPage>
  )
}

export default AdminContentPage
