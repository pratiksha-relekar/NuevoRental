import { useEffect, useMemo, useState } from 'react'
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
  fetchAdminOrders,
  loadAdminOrders,
  updateAdminOrderStatus,
} from '../../data/orderStorage'
import { formatKycStatus } from '../../data/userStorage'
import { OrderDetailModal } from '../components/OrderDetailModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSearchField,
  AdminStatCard,
  AdminStatusBadge,
  AdminTabTrigger,
  AdminTabsList,
  AdminIconButton,
  AdminToolbar,
  adminSelectTriggerClass,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'

const FILTER_TABS = [
  { id: 'all', label: 'All orders' },
  { id: 'today', label: 'Today' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'delivery', label: 'In delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'canceled', label: 'Canceled' },
]

function getOrderStatusTone(status) {
  if (status === 'delivered') return 'success'
  if (status === 'canceled') return 'danger'
  if (status === 'confirmed') return 'warning'
  if (status === 'out_for_delivery' || status === 'placed') return 'info'
  return 'neutral'
}

function getKycTone(status) {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'in_review') return 'info'
  if (status === 'rejected') return 'danger'
  return 'neutral'
}

function AdminOrdersPage() {
  const [version, setVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const orders = useMemo(() => loadAdminOrders(), [version])
  const stats = useMemo(() => getAdminOrderStats(orders), [orders])

  useEffect(() => {
    let active = true

    async function loadOrders() {
      try {
        await fetchAdminOrders()
        if (active) {
          setVersion((current) => current + 1)
        }
      } catch {
        // Fall back to cached orders mirror.
      }
    }

    loadOrders()
    return () => {
      active = false
    }
  }, [])

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
    <AdminPage>
      <AdminPageHeader
        title="Orders"
        description="Track rental orders, delivery schedules, cancellations, and fulfillment across Nuevo Rental."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AdminStatCard icon={ShoppingBag} label="Total orders" value={stats.total} note="all rental bookings" />
        <AdminStatCard icon={CalendarClock} label="Today" value={stats.today} note="placed today" />
        <AdminStatCard icon={Package} label="Scheduled" value={stats.scheduled} note="upcoming deliveries" />
        <AdminStatCard icon={Truck} label="In delivery" value={stats.delivery} note="out for delivery" />
        <AdminStatCard icon={CircleCheck} label="Delivered" value={stats.delivered} note="completed rentals" />
        <AdminStatCard icon={XCircle} label="Canceled" value={stats.canceled} note="canceled orders" />
        <AdminStatCard icon={ShieldCheck} label="KYC verified" value={stats.kycVerified} note="customers with approved KYC" />
      </div>

      <AdminPanel>
        <div className="border-b border-[#e5e5e5] p-4">
          <h2 className="text-sm font-bold tracking-wide text-[#1a1a1a] uppercase">Rental order records</h2>
          <p className="mt-1 text-sm text-[#666]">
            {filteredOrders.length} matching order{filteredOrders.length === 1 ? '' : 's'} · {formatINR(stats.revenue)} total value
          </p>
        </div>

        <AdminToolbar className="flex-col items-stretch xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full xl:w-auto">
            <AdminTabsList className="h-auto w-full flex-wrap">
              {FILTER_TABS.map((tab) => (
                <AdminTabTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </AdminTabTrigger>
              ))}
            </AdminTabsList>
          </Tabs>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
            <AdminSearchField
              icon={Search}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer, KYC, city or product"
            />

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full sm:w-[160px]')} aria-label="Filter by KYC status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC status</SelectItem>
                <SelectItem value="approved">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AdminToolbar>

        <div className={adminTableWrapClass}>
          <Table className={adminTableClass}>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={`${order.userEmail}-${order.id}`}
                  className={cn(
                    order.isCustomerOnline && 'bg-[#f8fff9]',
                    order.status === 'canceled' && 'opacity-80',
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[11px] font-semibold tracking-wide text-[#888] uppercase">
                        {order.id}
                      </span>
                      <AdminStatusBadge tone={order.provider === 'google' ? 'info' : 'neutral'}>
                        {order.provider === 'google' ? 'Google' : 'Email'}
                      </AdminStatusBadge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="relative inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]"
                        aria-hidden="true"
                      >
                        {order.customer?.initials ?? order.customerName?.[0] ?? 'U'}
                        {order.isCustomerOnline && (
                          <span
                            className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-[#22c55e]"
                            title="Active session"
                          />
                        )}
                      </span>
                      <div className="min-w-[160px] whitespace-normal">
                        <strong className="inline-flex items-center gap-1 text-sm text-[#1a1a1a]">
                          {order.customerName}
                          {order.kycStatus === 'approved' && (
                            <BadgeCheck className="text-[#1f6b3a]" size={14} aria-label="KYC verified" />
                          )}
                        </strong>
                        <span className="block text-xs text-[#888]">{order.userEmail}</span>
                        {order.customerPhone ? (
                          <span className="block text-xs text-[#666]">{order.customerPhone}</span>
                        ) : null}
                        {order.isCustomerOnline && (
                          <em className="text-[11px] not-italic text-[#1f6b3a]">Active session</em>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-normal">
                    <strong className="block max-w-[180px] text-sm text-[#1a1a1a]">{order.firstItemTitle}</strong>
                    <span className="text-xs text-[#888]">
                      {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <strong className="block text-sm text-[#1a1a1a]">{formatINR(order.payAmount)}</strong>
                    <span className="text-xs text-[#888]">
                      {order.paymentMethod === 'cod' ? 'Pay on delivery' : order.paymentMethod.toUpperCase()}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-normal">
                    <strong className="block text-sm text-[#1a1a1a]">{order.deliveryCity}</strong>
                    <span className="block text-xs text-[#888]">{order.scheduleLabel}</span>
                    <span className="block text-xs text-[#aaa]">{order.estimatedDelivery ?? 'Standard delivery'}</span>
                  </TableCell>

                  <TableCell className="whitespace-normal">
                    <AdminStatusBadge tone={getOrderStatusTone(order.status)} className="mb-2">
                      {ADMIN_ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </AdminStatusBadge>
                    <Select
                      value={order.status}
                      onValueChange={(status) => handleStatusChange(order, status)}
                    >
                      <SelectTrigger
                        className={cn(adminSelectTriggerClass, 'h-9 min-w-[140px]')}
                        aria-label={`Update status for ${order.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ADMIN_ORDER_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <AdminStatusBadge tone={getKycTone(order.kycStatus)} className="gap-1">
                      <ShieldCheck size={12} aria-hidden="true" />
                      {formatKycStatus(order.kycStatus)}
                    </AdminStatusBadge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-[#444]">{order.placedLabel}</span>
                  </TableCell>

                  <TableCell>
                    <AdminIconButton
                      aria-label={`View order ${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} />
                    </AdminIconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <AdminEmptyState>No orders match your search or filter.</AdminEmptyState>
          )}
        </div>
      </AdminPanel>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={(status) => {
          if (!selectedOrder) return
          handleStatusChange(selectedOrder, status)
        }}
      />
    </AdminPage>
  )
}

export default AdminOrdersPage
