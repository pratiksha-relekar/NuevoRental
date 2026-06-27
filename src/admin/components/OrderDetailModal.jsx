import {
  BadgeCheck,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  User,
  Wifi,
  X,
} from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
import {
  ADMIN_ORDER_STATUS_LABELS,
  ADMIN_ORDER_STATUS_OPTIONS,
} from '../../data/orderStorage'
import { getProductImage } from '../../data/products'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  AdminIconButton,
  adminSelectTriggerClass,
  AdminStatusBadge,
} from './admin-ui'

const labelClass = 'text-[11px] font-semibold tracking-wide text-[#444] uppercase'

const sectionClass = 'border border-[#e5e5e5] bg-[#fafafa] p-4'
const sectionTitleClass = 'mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#666] uppercase'
const dlClass = 'grid grid-cols-2 gap-2.5 max-md:grid-cols-1'
const dtClass = 'text-[10px] font-semibold tracking-wide text-[#888] uppercase'
const ddClass = 'text-sm text-[#1a1a1a]'

function getOrderStatusTone(status) {
  if (status === 'placed' || status === 'confirmed') return 'warning'
  if (status === 'out_for_delivery') return 'info'
  if (status === 'delivered' || status === 'returned') return 'success'
  if (status === 'canceled') return 'danger'
  return 'neutral'
}

function getKycStatusTone(status) {
  if (status === 'approved') return 'success'
  if (status === 'pending' || status === 'in_review') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'neutral'
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <section className={sectionClass}>
      <h3 className={sectionTitleClass}>
        {Icon && <Icon size={16} aria-hidden="true" />}
        {title}
      </h3>
      {children}
    </section>
  )
}

export function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null

  const { customer, summaryBreakdown } = order
  const delivery = order.delivery ?? {}

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[min(92vh,900px)] max-w-[980px] gap-0 overflow-auto rounded-none border-[#d8d8d8] p-0"
        showCloseButton={false}
        aria-labelledby="order-detail-title"
      >
        <div className="flex items-start justify-between border-b border-[#e5e5e5] px-6 py-4">
          <div>
            <span className="mb-1.5 inline-block text-[11px] font-semibold tracking-wide text-[#666] uppercase">
              {order.id}
            </span>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex size-11 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#1a1a1a]"
                aria-hidden="true"
              >
                {customer.initials}
              </span>
              <div>
                <h2 id="order-detail-title" className="text-lg font-bold text-[#1a1a1a]">
                  {order.customerName}
                </h2>
                <p className="text-sm text-[#888]">{order.userEmail}</p>
              </div>
            </div>
          </div>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] px-6 py-4">
          <AdminStatusBadge tone={getOrderStatusTone(order.status)}>
            {ADMIN_ORDER_STATUS_LABELS[order.status] ?? order.status}
          </AdminStatusBadge>
          <AdminStatusBadge tone={getKycStatusTone(customer.kyc.status)} className="gap-1.5">
            <ShieldCheck size={14} aria-hidden="true" />
            KYC: {customer.kyc.statusLabel}
          </AdminStatusBadge>
          {customer.isOnline && (
            <AdminStatusBadge tone="success" className="gap-1.5">
              <Wifi size={14} aria-hidden="true" />
              Active session
            </AdminStatusBadge>
          )}
          <AdminStatusBadge tone="neutral">
            {customer.provider === 'google' ? 'Google sign-in' : 'Email sign-in'}
          </AdminStatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-4">
            <DetailSection title="Customer profile" icon={User}>
              <dl className={dlClass}>
                <div>
                  <dt className={dtClass}>Full name</dt>
                  <dd className={ddClass}>{customer.displayName}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Email</dt>
                  <dd className={ddClass}>{customer.email}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Phone</dt>
                  <dd className={ddClass}>{customer.phone || delivery.phone || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Profile location</dt>
                  <dd className={ddClass}>{customer.location || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Member since</dt>
                  <dd className={ddClass}>{customer.joinedLabel}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Total rental orders</dt>
                  <dd className={ddClass}>{customer.totalOrders}</dd>
                </div>
              </dl>
              {customer.aboutMe && (
                <p className="mt-3 border border-[#e5e5e5] bg-white p-3 text-sm leading-relaxed text-[#444]">
                  {customer.aboutMe}
                </p>
              )}
            </DetailSection>

            <DetailSection title="KYC verification" icon={ShieldCheck}>
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <strong className="text-[#1a1a1a]">{customer.kyc.progressPercent}% complete</strong>
                  <span className="text-[#888]">{customer.kyc.completedSteps}/{customer.kyc.totalSteps} steps</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-[#e5e5e5]">
                  <span
                    className="block h-full bg-[#1a1a1a] transition-all"
                    style={{ width: `${customer.kyc.progressPercent}%` }}
                  />
                </div>
              </div>

              <ul className="mb-3 space-y-1.5">
                {customer.kyc.steps.map((step) => (
                  <li
                    key={step.id}
                    className="flex items-center justify-between border border-[#e5e5e5] bg-white px-3 py-2 text-sm"
                  >
                    <span className="text-[#1a1a1a]">{step.label}</span>
                    <em
                      className={cn(
                        'text-[10px] font-semibold tracking-wide uppercase not-italic',
                        step.status === 'done' && 'text-[#1f6b3a]',
                        step.status === 'active' && 'text-[#8a6200]',
                        step.status === 'pending' && 'text-[#888]',
                      )}
                    >
                      {step.status}
                    </em>
                  </li>
                ))}
              </ul>

              <dl className="grid grid-cols-1 gap-2.5">
                <div>
                  <dt className={dtClass}>Current step</dt>
                  <dd className={ddClass}>{customer.kyc.activeStepLabel}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Documents uploaded</dt>
                  <dd className={ddClass}>
                    {customer.kyc.documents.aadhaar ? 'Aadhaar ✓' : 'Aadhaar —'}
                    {' · '}
                    {customer.kyc.documents.pan ? 'PAN ✓' : 'PAN —'}
                  </dd>
                </div>
                {customer.kyc.completedLabel && (
                  <div>
                    <dt className={dtClass}>Verified on</dt>
                    <dd className={ddClass}>{customer.kyc.completedLabel}</dd>
                  </div>
                )}
              </dl>

              {customer.kyc.ocrData && (
                <div className="mt-3 border border-[#e5e5e5] bg-white p-3">
                  <h4 className="mb-2 text-[11px] font-semibold tracking-wide text-[#666] uppercase">
                    Identity details (OCR)
                  </h4>
                  <dl className="grid grid-cols-1 gap-2.5">
                    <div>
                      <dt className={dtClass}>Name</dt>
                      <dd className={ddClass}>{customer.kyc.ocrData.name || '—'}</dd>
                    </div>
                    <div>
                      <dt className={dtClass}>Aadhaar</dt>
                      <dd className={ddClass}>{customer.kyc.ocrData.aadhaar || '—'}</dd>
                    </div>
                    <div>
                      <dt className={dtClass}>PAN</dt>
                      <dd className={ddClass}>{customer.kyc.ocrData.pan || '—'}</dd>
                    </div>
                    <div>
                      <dt className={dtClass}>Date of birth</dt>
                      <dd className={ddClass}>{customer.kyc.ocrData.dob || '—'}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {customer.kyc.status !== 'approved' && (
                <p className="mt-3 border border-[#f0d9a8] bg-[#fff8ea] p-3 text-xs leading-relaxed text-[#8a6200]">
                  This customer has not completed KYC verification. Review identity before dispatching high-value rentals.
                </p>
              )}
            </DetailSection>
          </div>

          <div className="flex flex-col gap-4">
            <DetailSection title="Delivery & schedule" icon={Truck}>
              <dl className={dlClass}>
                <div>
                  <dt className={dtClass}>Recipient</dt>
                  <dd className={ddClass}>{delivery.fullName || order.customerName}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Address</dt>
                  <dd className={ddClass}>
                    {delivery.addressLine1}
                    {delivery.addressLine2 ? `, ${delivery.addressLine2}` : ''}
                    <br />
                    {delivery.city}, {delivery.state} – {delivery.pincode}
                  </dd>
                </div>
                {delivery.landmark && (
                  <div>
                    <dt className={dtClass}>Landmark</dt>
                    <dd className={ddClass}>{delivery.landmark}</dd>
                  </div>
                )}
                <div>
                  <dt className={dtClass}>Address type</dt>
                  <dd className={ddClass}>{delivery.addressType || 'Home'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Delivery slot</dt>
                  <dd className={ddClass}>{order.scheduleLabel}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Estimated delivery</dt>
                  <dd className={ddClass}>{order.estimatedDelivery || '2–3 business days'}</dd>
                </div>
                {delivery.instructions && (
                  <div>
                    <dt className={dtClass}>Delivery instructions</dt>
                    <dd className={ddClass}>{delivery.instructions}</dd>
                  </div>
                )}
                {delivery.coordinates && (
                  <div>
                    <dt className={dtClass}>GPS coordinates</dt>
                    <dd className={cn(ddClass, 'flex items-center gap-1')}>
                      <MapPin size={12} aria-hidden="true" />
                      {delivery.coordinates.lat?.toFixed(5)}, {delivery.coordinates.lng?.toFixed(5)}
                    </dd>
                  </div>
                )}
              </dl>
            </DetailSection>

            <DetailSection title="Payment summary" icon={CreditCard}>
              <dl className="grid grid-cols-1 gap-2.5">
                <div>
                  <dt className={dtClass}>Payment method</dt>
                  <dd className={ddClass}>
                    {order.paymentMethod === 'cod' ? 'Pay on delivery' : order.paymentMethod.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className={dtClass}>Payment status</dt>
                  <dd className={ddClass}>{order.paymentStatus === 'paid' ? 'Paid' : 'Pay on delivery'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Catalog MRP</dt>
                  <dd className={ddClass}>{formatINR(summaryBreakdown.totalMrp)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Rental discount</dt>
                  <dd className={ddClass}>- {formatINR(summaryBreakdown.rentalDiscount)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Nuevo offer</dt>
                  <dd className={ddClass}>- {formatINR(summaryBreakdown.nuevoOfferDiscount)}</dd>
                </div>
                {summaryBreakdown.bulkBonusDiscount > 0 && (
                  <div>
                    <dt className={dtClass}>Bulk bonus</dt>
                    <dd className={ddClass}>- {formatINR(summaryBreakdown.bulkBonusDiscount)}</dd>
                  </div>
                )}
                <div>
                  <dt className={dtClass}>Total savings</dt>
                  <dd className={ddClass}>{formatINR(summaryBreakdown.totalSavings)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Security deposit</dt>
                  <dd className={ddClass}>{formatINR(summaryBreakdown.securityDeposit)}</dd>
                </div>
                <div className="border-t border-[#e5e5e5] pt-2">
                  <dt className={dtClass}>Amount payable</dt>
                  <dd className="text-base font-bold text-[#1a1a1a]">{formatINR(summaryBreakdown.payAmount)}</dd>
                </div>
              </dl>
            </DetailSection>

            <DetailSection title={`Rental items (${order.itemCount})`} icon={Package}>
              <ul className="space-y-2">
                {(order.items ?? []).map((item) => (
                  <li
                    key={`${item.id ?? item.title}-${item.quantity}`}
                    className="flex items-start gap-3 border border-[#e5e5e5] bg-white p-3"
                  >
                    <img
                      src={typeof item.image === 'string' ? item.image : getProductImage(item)}
                      alt=""
                      className="size-14 shrink-0 border border-[#e5e5e5] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="block text-sm text-[#1a1a1a]">{item.title ?? item.name}</strong>
                      <small className="block text-xs text-[#888]">
                        Qty {item.quantity ?? 1}
                        {item.durationLabel ? ` · ${item.durationLabel}` : ''}
                        {item.period ? ` · per ${item.period}` : ''}
                      </small>
                      <span className="mt-1 block text-sm font-semibold text-[#1a1a1a]">
                        {formatINR((item.rentalPrice ?? item.unitPrice ?? 0) * (item.quantity ?? 1))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Order timeline" icon={BadgeCheck}>
              <ul className="mb-4 space-y-2">
                <li className="flex items-center justify-between border border-[#e5e5e5] bg-white px-3 py-2 text-sm">
                  <span className="text-[#888]">Placed</span>
                  <strong className="text-[#1a1a1a]">{order.placedLabel}</strong>
                </li>
                <li className="flex items-center justify-between border border-[#e5e5e5] bg-white px-3 py-2 text-sm">
                  <span className="text-[#888]">Current status</span>
                  <strong className="text-[#1a1a1a]">{ADMIN_ORDER_STATUS_LABELS[order.status]}</strong>
                </li>
                {order.updatedAt && (
                  <li className="flex items-center justify-between border border-[#e5e5e5] bg-white px-3 py-2 text-sm">
                    <span className="text-[#888]">Last updated</span>
                    <strong className="text-[#1a1a1a]">
                      {new Date(order.updatedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </strong>
                  </li>
                )}
              </ul>

              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Update order status</span>
                <Select value={order.status} onValueChange={onStatusChange}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ORDER_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ADMIN_ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>
            </DetailSection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
