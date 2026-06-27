import { useEffect, useState } from 'react'
import {
  IndianRupee,
  Package,
  PieChart,
  Users,
} from 'lucide-react'
import { getCatalogProducts } from '../../data/catalogStorage'
import { getPendingKycReviewCount, fetchPendingKycReviewCount } from '../../data/kycStorage'
import { fetchOpenSupportCount, getOpenSupportCount } from '../../data/supportStorage'
import { fetchAdminUsers } from '../../data/userStorage'
import { getAdminOrderStats, loadAdminOrders } from '../../data/orderStorage'
import { formatINR } from '../../utils/cartSummary'
import { AdminTrendChart } from '../components/AdminTrendChart'
import { AdminRevenueSection } from '../components/AdminRevenueSection'
import {
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSectionTitle,
  AdminStatCard,
  adminPanelClass,
} from '../components/admin-ui'
import { cn } from '@/lib/utils'

const DASHBOARD_STAT_CARDS = [
  {
    id: 'orders',
    title: 'Total Orders',
    icon: PieChart,
    trend: 80,
  },
  {
    id: 'users',
    title: 'Customers',
    icon: Users,
    trend: 90,
  },
  {
    id: 'products',
    title: 'Products',
    icon: Package,
    trend: 88,
  },
  {
    id: 'revenue',
    title: 'Revenue',
    icon: IndianRupee,
    trend: 88,
  },
]

const ADMIN_MODULES = [
  {
    id: 'products',
    title: 'Products',
    description: 'Manage rental devices, pricing, images, categories, and availability.',
    statLabel: 'Total products',
    accent: 'blue',
  },
  {
    id: 'users',
    title: 'Users',
    description: 'View registered customers, profiles, KYC status, and account activity.',
    statLabel: 'Registered users',
    accent: 'pink',
  },
  {
    id: 'orders',
    title: 'Orders',
    description: 'Track rental orders, delivery status, payments, and fulfillment.',
    statLabel: 'Total orders',
    accent: 'blue',
  },
  {
    id: 'kyc',
    title: 'KYC Verifications',
    description: 'Review identity documents, OCR results, and face verification status.',
    statLabel: 'Pending KYC',
    accent: 'amber',
  },
  {
    id: 'website',
    title: 'Website Content',
    description: 'Update homepage banners, deals, pages, contact info, and site settings.',
    statLabel: 'Content sections',
    accent: 'blue',
  },
  {
    id: 'support',
    title: 'Support & Inquiries',
    description: 'Handle customer tickets, contact form submissions, and live chat.',
    statLabel: 'Open tickets',
    accent: 'pink',
  },
]

const MODULE_ACCENT_CLASS = {
  blue: 'border-t-[#1a1a1a]',
  pink: 'border-t-[#666]',
  amber: 'border-t-[#999]',
}

function loadOpenSupportCount() {
  return getOpenSupportCount()
}

function formatStatValue(id, stats) {
  if (id === 'revenue') return formatINR(stats.revenue)
  if (id === 'products') return stats.products.toLocaleString('en-IN')
  if (id === 'users') return stats.users.toLocaleString('en-IN')
  if (id === 'orders') return stats.orders.toLocaleString('en-IN')
  return '0'
}

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: getCatalogProducts().length,
    users: 0,
    orders: 0,
    kyc: getPendingKycReviewCount(),
    revenue: 0,
    website: 12,
    support: loadOpenSupportCount(),
  })

  useEffect(() => {
    let active = true

    async function loadStats() {
      try {
        const users = await fetchAdminUsers()
        const orders = loadAdminOrders()
        const orderStats = getAdminOrderStats(orders)

        if (!active) return

        setStats({
          products: getCatalogProducts().length,
          users: users.length,
          orders: orderStats.total,
          kyc: await fetchPendingKycReviewCount(),
          revenue: orderStats.revenue,
          website: 12,
          support: await fetchOpenSupportCount(),
        })
      } catch {
        if (active) {
          setStats((current) => ({
            ...current,
            products: getCatalogProducts().length,
            kyc: getPendingKycReviewCount(),
            support: loadOpenSupportCount(),
          }))
        }
      }
    }

    loadStats()
    return () => {
      active = false
    }
  }, [])

  const statForModule = (id) => {
    if (id === 'products') return stats.products
    if (id === 'users') return stats.users
    if (id === 'orders') return stats.orders
    if (id === 'kyc') return stats.kyc
    if (id === 'website') return stats.website
    if (id === 'support') return stats.support
    return 0
  }

  return (
    <AdminPage>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_STAT_CARDS.map((card) => (
          <AdminStatCard
            key={card.id}
            icon={card.icon}
            label={card.title}
            value={formatStatValue(card.id, stats)}
            trend={card.trend}
          />
        ))}
      </div>

      <AdminTrendChart
        orders={stats.orders}
        users={stats.users}
        revenue={stats.revenue}
      />

      <AdminRevenueSection />

      <AdminPanel className="p-0" aria-label="Admin modules">
        <div className="border-b border-[#e5e5e5] p-4">
          <AdminSectionTitle>Management modules</AdminSectionTitle>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {ADMIN_MODULES.map((module) => (
            <section
              key={module.id}
              id={module.id}
              className={cn(
                adminPanelClass,
                'flex scroll-mt-[100px] flex-col gap-3 border-t-2 p-4',
                MODULE_ACCENT_CLASS[module.accent],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-base font-bold text-[#1a1a1a]">{module.title}</h4>
                <span className="flex flex-col items-end text-[22px] font-bold leading-none text-[#1a1a1a]">
                  {statForModule(module.id)}
                  <small className="mt-1 text-[10px] font-semibold tracking-wide text-[#666] uppercase">
                    {module.statLabel}
                  </small>
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[#666]">{module.description}</p>
              <AdminPrimaryButton className="self-start opacity-85" disabled>
                Open module (coming soon)
              </AdminPrimaryButton>
            </section>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel className="p-4">
        <AdminSectionTitle className="mb-3">Admin privileges</AdminSectionTitle>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-relaxed text-[#666]">
          <li className="relative pl-5 before:absolute before:top-[7px] before:left-0 before:size-1.5 before:bg-[#1a1a1a]">
            Full access to rental product catalog and pricing
          </li>
          <li className="relative pl-5 before:absolute before:top-[7px] before:left-0 before:size-1.5 before:bg-[#1a1a1a]">
            User accounts, profiles, and KYC verification control
          </li>
          <li className="relative pl-5 before:absolute before:top-[7px] before:left-0 before:size-1.5 before:bg-[#1a1a1a]">
            Order management and delivery status updates
          </li>
          <li className="relative pl-5 before:absolute before:top-[7px] before:left-0 before:size-1.5 before:bg-[#1a1a1a]">
            Website content, banners, and page configuration
          </li>
        </ul>
      </AdminPanel>
    </AdminPage>
  )
}

export default AdminDashboardPage
