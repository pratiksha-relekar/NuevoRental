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
import './ProductFormModal.css'
import './OrderDetailModal.css'

function DetailSection({ title, icon: Icon, children }) {
  return (
    <section className="admin-order-detail-section">
      <h3>
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
    <div className="admin-modal-root admin-modal-root--wide" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div className="admin-order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <div className="admin-order-detail-header">
          <div className="admin-order-detail-header-main">
            <span className="admin-order-detail-eyebrow">{order.id}</span>
            <div className="admin-order-detail-title-row">
              <span className="admin-order-detail-avatar" aria-hidden="true">
                {customer.initials}
              </span>
              <div>
                <h2 id="order-detail-title">{order.customerName}</h2>
                <p>{order.userEmail}</p>
              </div>
            </div>
          </div>
          <button type="button" className="admin-order-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="admin-order-detail-badges">
          <span className={`admin-order-detail-status admin-order-detail-status--${order.status}`}>
            {ADMIN_ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          <span className={`admin-order-detail-kyc admin-order-detail-kyc--${customer.kyc.status}`}>
            <ShieldCheck size={14} aria-hidden="true" />
            KYC: {customer.kyc.statusLabel}
          </span>
          {customer.isOnline && (
            <span className="admin-order-detail-online">
              <Wifi size={14} aria-hidden="true" />
              Active session
            </span>
          )}
          <span className="admin-order-detail-provider">
            {customer.provider === 'google' ? 'Google sign-in' : 'Email sign-in'}
          </span>
        </div>

        <div className="admin-order-detail-layout">
          <div className="admin-order-detail-column">
            <DetailSection title="Customer profile" icon={User}>
              <dl className="admin-order-detail-dl">
                <div>
                  <dt>Full name</dt>
                  <dd>{customer.displayName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{customer.phone || delivery.phone || 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Profile location</dt>
                  <dd>{customer.location || 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{customer.joinedLabel}</dd>
                </div>
                <div>
                  <dt>Total rental orders</dt>
                  <dd>{customer.totalOrders}</dd>
                </div>
              </dl>
              {customer.aboutMe && (
                <p className="admin-order-detail-note">{customer.aboutMe}</p>
              )}
            </DetailSection>

            <DetailSection title="KYC verification" icon={ShieldCheck}>
              <div className="admin-order-detail-kyc-progress">
                <div className="admin-order-detail-kyc-progress-head">
                  <strong>{customer.kyc.progressPercent}% complete</strong>
                  <span>{customer.kyc.completedSteps}/{customer.kyc.totalSteps} steps</span>
                </div>
                <div className="admin-order-detail-kyc-bar">
                  <span style={{ width: `${customer.kyc.progressPercent}%` }} />
                </div>
              </div>

              <ul className="admin-order-detail-kyc-steps">
                {customer.kyc.steps.map((step) => (
                  <li key={step.id} className={`admin-order-detail-kyc-step admin-order-detail-kyc-step--${step.status}`}>
                    <span>{step.label}</span>
                    <em>{step.status}</em>
                  </li>
                ))}
              </ul>

              <dl className="admin-order-detail-dl admin-order-detail-dl--compact">
                <div>
                  <dt>Current step</dt>
                  <dd>{customer.kyc.activeStepLabel}</dd>
                </div>
                <div>
                  <dt>Documents uploaded</dt>
                  <dd>
                    {customer.kyc.documents.aadhaar ? 'Aadhaar ✓' : 'Aadhaar —'}
                    {' · '}
                    {customer.kyc.documents.pan ? 'PAN ✓' : 'PAN —'}
                  </dd>
                </div>
                {customer.kyc.completedLabel && (
                  <div>
                    <dt>Verified on</dt>
                    <dd>{customer.kyc.completedLabel}</dd>
                  </div>
                )}
              </dl>

              {customer.kyc.ocrData && (
                <div className="admin-order-detail-ocr">
                  <h4>Identity details (OCR)</h4>
                  <dl className="admin-order-detail-dl admin-order-detail-dl--compact">
                    <div>
                      <dt>Name</dt>
                      <dd>{customer.kyc.ocrData.name || '—'}</dd>
                    </div>
                    <div>
                      <dt>Aadhaar</dt>
                      <dd>{customer.kyc.ocrData.aadhaar || '—'}</dd>
                    </div>
                    <div>
                      <dt>PAN</dt>
                      <dd>{customer.kyc.ocrData.pan || '—'}</dd>
                    </div>
                    <div>
                      <dt>Date of birth</dt>
                      <dd>{customer.kyc.ocrData.dob || '—'}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {customer.kyc.status !== 'approved' && (
                <p className="admin-order-detail-warning">
                  This customer has not completed KYC verification. Review identity before dispatching high-value rentals.
                </p>
              )}
            </DetailSection>
          </div>

          <div className="admin-order-detail-column">
            <DetailSection title="Delivery & schedule" icon={Truck}>
              <dl className="admin-order-detail-dl">
                <div>
                  <dt>Recipient</dt>
                  <dd>{delivery.fullName || order.customerName}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>
                    {delivery.addressLine1}
                    {delivery.addressLine2 ? `, ${delivery.addressLine2}` : ''}
                    <br />
                    {delivery.city}, {delivery.state} – {delivery.pincode}
                  </dd>
                </div>
                {delivery.landmark && (
                  <div>
                    <dt>Landmark</dt>
                    <dd>{delivery.landmark}</dd>
                  </div>
                )}
                <div>
                  <dt>Address type</dt>
                  <dd>{delivery.addressType || 'Home'}</dd>
                </div>
                <div>
                  <dt>Delivery slot</dt>
                  <dd>{order.scheduleLabel}</dd>
                </div>
                <div>
                  <dt>Estimated delivery</dt>
                  <dd>{order.estimatedDelivery || '2–3 business days'}</dd>
                </div>
                {delivery.instructions && (
                  <div>
                    <dt>Delivery instructions</dt>
                    <dd>{delivery.instructions}</dd>
                  </div>
                )}
                {delivery.coordinates && (
                  <div>
                    <dt>GPS coordinates</dt>
                    <dd>
                      <MapPin size={12} aria-hidden="true" />
                      {delivery.coordinates.lat?.toFixed(5)}, {delivery.coordinates.lng?.toFixed(5)}
                    </dd>
                  </div>
                )}
              </dl>
            </DetailSection>

            <DetailSection title="Payment summary" icon={CreditCard}>
              <dl className="admin-order-detail-dl admin-order-detail-dl--compact">
                <div>
                  <dt>Payment method</dt>
                  <dd>
                    {order.paymentMethod === 'cod' ? 'Pay on delivery' : order.paymentMethod.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt>Payment status</dt>
                  <dd>{order.paymentStatus === 'paid' ? 'Paid' : 'Pay on delivery'}</dd>
                </div>
                <div>
                  <dt>Catalog MRP</dt>
                  <dd>{formatINR(summaryBreakdown.totalMrp)}</dd>
                </div>
                <div>
                  <dt>Rental discount</dt>
                  <dd>- {formatINR(summaryBreakdown.rentalDiscount)}</dd>
                </div>
                <div>
                  <dt>Nuevo offer</dt>
                  <dd>- {formatINR(summaryBreakdown.nuevoOfferDiscount)}</dd>
                </div>
                {summaryBreakdown.bulkBonusDiscount > 0 && (
                  <div>
                    <dt>Bulk bonus</dt>
                    <dd>- {formatINR(summaryBreakdown.bulkBonusDiscount)}</dd>
                  </div>
                )}
                <div>
                  <dt>Total savings</dt>
                  <dd>{formatINR(summaryBreakdown.totalSavings)}</dd>
                </div>
                <div>
                  <dt>Security deposit</dt>
                  <dd>{formatINR(summaryBreakdown.securityDeposit)}</dd>
                </div>
                <div className="admin-order-detail-total">
                  <dt>Amount payable</dt>
                  <dd>{formatINR(summaryBreakdown.payAmount)}</dd>
                </div>
              </dl>
            </DetailSection>

            <DetailSection title={`Rental items (${order.itemCount})`} icon={Package}>
              <ul className="admin-order-detail-items">
                {(order.items ?? []).map((item) => (
                  <li key={`${item.id ?? item.title}-${item.quantity}`}>
                    <img
                      src={typeof item.image === 'string' ? item.image : getProductImage(item)}
                      alt=""
                      className="admin-order-detail-item-image"
                    />
                    <div>
                      <strong>{item.title ?? item.name}</strong>
                      <small>
                        Qty {item.quantity ?? 1}
                        {item.durationLabel ? ` · ${item.durationLabel}` : ''}
                        {item.period ? ` · per ${item.period}` : ''}
                      </small>
                      <span>{formatINR((item.rentalPrice ?? item.unitPrice ?? 0) * (item.quantity ?? 1))}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Order timeline" icon={BadgeCheck}>
              <ul className="admin-order-detail-timeline">
                <li>
                  <span>Placed</span>
                  <strong>{order.placedLabel}</strong>
                </li>
                <li>
                  <span>Current status</span>
                  <strong>{ADMIN_ORDER_STATUS_LABELS[order.status]}</strong>
                </li>
                {order.updatedAt && (
                  <li>
                    <span>Last updated</span>
                    <strong>
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

              <label className="admin-order-detail-status-field">
                <span>Update order status</span>
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                >
                  {ADMIN_ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {ADMIN_ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </DetailSection>
          </div>
        </div>
      </div>
    </div>
  )
}
