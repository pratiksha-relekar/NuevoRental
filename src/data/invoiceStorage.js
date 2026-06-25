import { fetchAdminOrders, loadAdminOrders } from './orderStorage'

export const INVOICE_STATUS_LABELS = {
  draft: 'Draft',
  paid: 'Paid',
  due: 'Due',
  recurring: 'Recurring',
  overdue: 'Overdue',
  canceled: 'Canceled',
}

export const INVOICE_STATUS_FILTERS = [
  'all',
  'draft',
  'paid',
  'due',
  'recurring',
  'overdue',
  'canceled',
]

export const NUEVO_RENTAL_INVOICE_FROM = {
  name: 'Nuevo Rental',
  contact: 'Nuevo Rental Support',
  email: 'support@nuevorental.com',
  phone: '8080808964',
  website: 'nuevo-rental-inky.vercel.app',
  address: 'Pan-India IT Equipment Rental, Pune, Maharashtra, India',
}

function formatShipToAddress(delivery = {}) {
  const parts = [
    delivery.addressLine1,
    delivery.addressLine2,
    delivery.city,
    delivery.state,
    delivery.pincode ? `PIN ${delivery.pincode}` : '',
  ].filter(Boolean)

  return parts.join(', ') || '—'
}

function formatPaymentMethodLabel(method) {
  if (method === 'cod') return 'Pay on delivery'
  if (method === 'upi') return 'UPI'
  if (method === 'card') return 'Credit / Debit Card'
  return (method ?? '—').toUpperCase()
}

function formatInvoiceDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatInvoiceShortDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isRecurringOrder(order) {
  return (order.items ?? []).some((item) => {
    const label = `${item.durationLabel ?? ''} ${item.period ?? ''}`.toLowerCase()
    return label.includes('month') || label.includes('3 month') || label.includes('6 month') || label.includes('12 month')
  })
}

function isInvoiceOverdue(order, dueDate) {
  if (!dueDate) return false
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const paymentStatus = order.paymentStatus ?? order.payment?.status ?? 'pending'
  return due < today && paymentStatus !== 'paid' && order.status !== 'canceled'
}

export function getInvoiceStatus(order) {
  if (order.status === 'canceled') return 'canceled'
  if (order.awaitingKyc || order.status === 'placed') return 'draft'

  const recurring = isRecurringOrder(order)
  const paymentMethod = order.paymentMethod ?? order.payment?.method ?? 'cod'
  const paid = order.paymentStatus === 'paid' || paymentMethod !== 'cod'

  if (paid && recurring) return 'recurring'
  if (paid) return 'paid'
  const dueDate = order.deliveryDate ?? order.delivery?.deliveryDate
  if (isInvoiceOverdue(order, dueDate)) return 'overdue'
  if (recurring) return 'recurring'
  return 'due'
}

export function buildInvoiceFromOrder(order) {
  const summary = order.summaryBreakdown ?? order.summary ?? {}
  const delivery = order.delivery ?? {}
  const paymentMethod = order.paymentMethod ?? order.payment?.method ?? 'cod'
  const paymentStatus = order.paymentStatus ?? order.payment?.status ?? 'pending'
  const totalAmount = Number(order.payAmount ?? summary.payAmount ?? 0)
  const status = getInvoiceStatus({
    ...order,
    paymentMethod,
    paymentStatus,
  })
  const isPaid = status === 'paid' || status === 'recurring'
  const paidAmount = isPaid ? totalAmount : 0
  const dueAmount = isPaid || status === 'canceled' ? 0 : totalAmount
  const placedAt = order.placedAt ?? order.updatedAt ?? new Date().toISOString()
  const dueDate = order.deliveryDate ?? delivery.deliveryDate ?? order.placedAt
  const year = new Date(placedAt).getFullYear()
  const orderId = String(order.id ?? 'ORDER')
  const invoiceSuffix = orderId.replace(/^NR-/, '').slice(-6).toUpperCase() || '000000'
  const deliveryCity = order.deliveryCity ?? delivery.city ?? ''

  return {
    id: `INV-${year}-${invoiceSuffix}`,
    orderId: orderId,
    userEmail: order.userEmail ?? order.customerEmail ?? delivery.email ?? '',
    customerName: order.customerName ?? delivery.fullName ?? 'Customer',
    customerEmail: order.userEmail ?? order.customerEmail ?? delivery.email ?? '',
    customerPhone: order.customerPhone ?? delivery.phone ?? '',
    customerCompany: deliveryCity ? `${deliveryCity} · Nuevo Rental` : 'Nuevo Rental Customer',
    createdAt: placedAt,
    createdLabel: formatInvoiceDate(placedAt),
    createdShortLabel: formatInvoiceShortDate(placedAt),
    dueDate,
    dueDateLabel: isRecurringOrder(order) ? 'Recurring' : formatInvoiceShortDate(dueDate),
    totalAmount,
    paidAmount,
    dueAmount,
    status,
    statusLabel: INVOICE_STATUS_LABELS[status] ?? status,
    paymentMethod,
    paymentMethodLabel: formatPaymentMethodLabel(paymentMethod),
    paymentStatus,
    items: order.items ?? [],
    summary,
    delivery,
    shipToAddress: formatShipToAddress(delivery),
    deliverySlot: order.deliverySlot ?? delivery.deliverySlot ?? '',
    deliveryDate: order.deliveryDate ?? delivery.deliveryDate ?? '',
    from: NUEVO_RENTAL_INVOICE_FROM,
    order,
    isRecurring: isRecurringOrder(order),
  }
}

export function loadAdminInvoices() {
  return loadAdminOrders()
    .filter((order) => order.status !== 'canceled')
    .map(buildInvoiceFromOrder)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function fetchAdminInvoices() {
  await fetchAdminOrders()
  return loadAdminInvoices()
}

export function getAdminInvoiceStats(invoices) {
  const counts = INVOICE_STATUS_FILTERS.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  invoices.forEach((invoice) => {
    counts.all += 1
    if (counts[invoice.status] !== undefined) {
      counts[invoice.status] += 1
    }
  })

  return {
    ...counts,
    totalRevenue: invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0),
    outstanding: invoices.reduce((sum, invoice) => sum + invoice.dueAmount, 0),
  }
}

export function getAdminInvoiceById(invoiceId, invoices = loadAdminInvoices()) {
  return invoices.find((invoice) => invoice.id === invoiceId) ?? null
}
