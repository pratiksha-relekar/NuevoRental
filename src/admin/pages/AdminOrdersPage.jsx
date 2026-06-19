import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  BadgeCheck,
  CalendarClock,
  CircleCheck,
  Eye,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
import {
  ADMIN_ORDER_STATUS_LABELS,
  getAdminOrderById,
  getAdminOrderStats,
  loadAdminOrders,
  updateAdminOrderStatus,
} from '../../data/orderStorage'
import { formatKycStatus } from '../../data/userStorage'
import { OrderDetailModal } from '../components/OrderDetailModal'
import './AdminOrdersPage.css'

const FILTER_TABS = [
  { id: 'all', label: 'All orders' },
  { id: 'today', label: 'Today' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'delivery', label: 'In delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'canceled', label: 'Canceled' },
]

function StatCard({ icon: Icon, label, value, note, tone, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      className={`admin-orders-stat-card admin-orders-stat-card--${tone}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <span className="admin-orders-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <span className="admin-orders-stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </motion.article>
  )
}

function AdminOrdersPage() {
  const reduceMotion = useReducedMotion()
  const [version, setVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const orders = useMemo(() => loadAdminOrders(), [version])
  const stats = useMemo(() => getAdminOrderStats(orders), [orders])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      if (activeFilter !== 'all' && order.bucket !== activeFilter) return false
      if (kycFilter !== 'all' && order.kycStatus !== kycFilter) return false
      if (!query) return true

      const haystack = [
        order.id,
        order.customerName,
        order.userEmail,
        order.customerPhone,
        order.firstItemTitle,
        order.deliveryCity,
        order.status,
        order.kycStatusLabel,
        order.provider,
        ADMIN_ORDER_STATUS_LABELS[order.status],
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [orders, search, activeFilter, kycFilter])

  const refresh = () => setVersion((current) => current + 1)

  const handleStatusChange = (order, status) => {
    updateAdminOrderStatus(order.userEmail, order.id, status)
    refresh()
    setSelectedOrder((current) => {
      if (!current || current.id !== order.id) return current
      return getAdminOrderById(order.userEmail, order.id) ?? current
    })
  }

  return (
    <div className="admin-orders-page">
      <header className="admin-orders-page-head">
        <div>
          <h1>Orders</h1>
          <p>Track rental orders, delivery schedules, cancellations, and fulfillment across Nuevo Rental.</p>
        </div>
      </header>

      <div className="admin-orders-stat-grid">
        <StatCard icon={ShoppingBag} label="Total orders" value={stats.total} note="all rental bookings" tone="blue" delay={0} />
        <StatCard icon={CalendarClock} label="Today" value={stats.today} note="placed today" tone="purple" delay={0.05} />
        <StatCard icon={Package} label="Scheduled" value={stats.scheduled} note="upcoming deliveries" tone="amber" delay={0.1} />
        <StatCard icon={Truck} label="In delivery" value={stats.delivery} note="out for delivery" tone="blue" delay={0.15} />
        <StatCard icon={CircleCheck} label="Delivered" value={stats.delivered} note="completed rentals" tone="green" delay={0.2} />
        <StatCard icon={XCircle} label="Canceled" value={stats.canceled} note="canceled orders" tone="pink" delay={0.25} />
        <StatCard icon={ShieldCheck} label="KYC verified" value={stats.kycVerified} note="customers with approved KYC" tone="green" delay={0.3} />
      </div>

      <section className="admin-orders-panel">
        <div className="admin-orders-panel-head">
          <div>
            <h2>Rental order records</h2>
            <p>{filteredOrders.length} matching order{filteredOrders.length === 1 ? '' : 's'} · {formatINR(stats.revenue)} total value</p>
          </div>
        </div>

        <div className="admin-orders-toolbar">
          <div className="admin-orders-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-orders-tab${activeFilter === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="admin-orders-toolbar-filters">
            <label className="admin-orders-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID, customer, KYC, city or product"
              />
            </label>

            <select
              className="admin-orders-filter"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              aria-label="Filter by KYC status"
            >
              <option value="all">All KYC status</option>
              <option value="approved">Verified</option>
              <option value="pending">Pending</option>
              <option value="in_review">In review</option>
              <option value="rejected">Rejected</option>
              <option value="not_started">Not started</option>
            </select>
          </div>
        </div>

        <div className="admin-orders-list">
          {filteredOrders.map((order, index) => (
            <motion.article
              key={`${order.userEmail}-${order.id}`}
              className={`admin-orders-card admin-orders-card--${order.status}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="admin-orders-card-top">
                <div className="admin-orders-card-customer">
                  <span className="admin-orders-card-avatar" aria-hidden="true">
                    {order.customer?.initials ?? order.customerName?.[0] ?? 'U'}
                    {order.isCustomerOnline && <span className="admin-orders-online-dot" title="Active session" />}
                  </span>
                  <div>
                    <span className="admin-orders-card-id">{order.id}</span>
                    <h3>
                      {order.customerName}
                      {order.kycStatus === 'approved' && (
                        <BadgeCheck className="admin-orders-verified-icon" size={14} aria-label="KYC verified" />
                      )}
                    </h3>
                    <p>{order.userEmail}</p>
                    {order.isCustomerOnline && (
                      <em className="admin-orders-online-label">Active session</em>
                    )}
                  </div>
                </div>
                <span className={`admin-orders-status admin-orders-status--${order.status}`}>
                  {ADMIN_ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="admin-orders-card-meta">
                <span className={`admin-orders-kyc admin-orders-kyc--${order.kycStatus}`}>
                  <ShieldCheck size={12} aria-hidden="true" />
                  {formatKycStatus(order.kycStatus)}
                </span>
                <span className={`admin-orders-provider admin-orders-provider--${order.provider}`}>
                  {order.provider === 'google' ? 'Google' : 'Email'}
                </span>
                {order.customerPhone && (
                  <span className="admin-orders-phone">{order.customerPhone}</span>
                )}
              </div>

              <div className="admin-orders-card-grid">
                <div>
                  <span>Product</span>
                  <strong>{order.firstItemTitle}</strong>
                  <small>{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</small>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{formatINR(order.payAmount)}</strong>
                  <small>{order.paymentMethod === 'cod' ? 'Pay on delivery' : order.paymentMethod.toUpperCase()}</small>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{order.deliveryCity}</strong>
                  <small>{order.scheduleLabel}</small>
                </div>
                <div>
                  <span>Placed</span>
                  <strong>{order.placedLabel}</strong>
                  <small>{order.estimatedDelivery ?? 'Standard delivery'}</small>
                </div>
              </div>

              <div className="admin-orders-card-actions">
                <label className="admin-orders-status-select">
                  <span>Update status</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    aria-label={`Update status for ${order.id}`}
                  >
                    {Object.entries(ADMIN_ORDER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="admin-orders-view-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye size={16} aria-hidden="true" />
                  View details
                </button>
              </div>
            </motion.article>
          ))}

          {filteredOrders.length === 0 && (
            <p className="admin-orders-empty">No orders match your search or filter.</p>
          )}
        </div>
      </section>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={(status) => {
          if (!selectedOrder) return
          handleStatusChange(selectedOrder, status)
        }}
      />
    </div>
  )
}

export default AdminOrdersPage
