import { useEffect, useState } from 'react'
import {
  IndianRupee,
  Package,
  PieChart,
  TrendingUp,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        {DASHBOARD_STAT_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <Card key={card.id} className="admin-stat-card">
              <div className="admin-stat-card-head">
                <span className="admin-stat-card-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="admin-stat-card-label">{card.title}</span>
              </div>

              <strong className="admin-stat-card-value">
                {formatStatValue(card.id, stats)}
              </strong>

              <div className="admin-stat-card-trend">
                <Badge className="admin-stat-trend-badge">
                  <TrendingUp size={12} strokeWidth={2.4} aria-hidden="true" />
                  {card.trend}%
                </Badge>
                <span className="admin-stat-trend-note">vs last 7 days</span>
              </div>
            </Card>
          )
        })}
      </div>

      <AdminTrendChart
        orders={stats.orders}
        users={stats.users}
        revenue={stats.revenue}
      />

      <AdminRevenueSection />

      <section className="admin-modules" aria-label="Admin modules">
        <h3>Management modules</h3>
        <div className="admin-module-grid">
          {ADMIN_MODULES.map((module) => (
            <Card
              key={module.id}
              id={module.id}
              className={`admin-module-card admin-module-card--${module.accent}`}
            >
              <div className="admin-module-card-top">
                <h4>{module.title}</h4>
                <span className="admin-module-stat">
                  {statForModule(module.id)}
                  <small>{module.statLabel}</small>
                </span>
              </div>
              <p>{module.description}</p>
              <Button type="button" className="admin-module-btn" disabled>
                Open module (coming soon)
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="admin-privileges">
        <h3>Admin privileges</h3>
        <ul>
          <li>Full access to rental product catalog and pricing</li>
          <li>User accounts, profiles, and KYC verification control</li>
          <li>Order management and delivery status updates</li>
          <li>Website content, banners, and page configuration</li>
        </ul>
      </section>
    </div>
  )
}

export default AdminDashboardPage
