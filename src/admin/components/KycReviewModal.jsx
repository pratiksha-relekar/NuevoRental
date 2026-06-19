import {
  BadgeCheck,
  CheckCircle2,
  FileImage,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  Wifi,
  X,
  XCircle,
} from 'lucide-react'
import { formatINR } from '../../utils/cartSummary'
import { formatKycStatus } from '../../data/userStorage'
import { getProductImage } from '../../data/products'
import './ProductFormModal.css'
import './KycReviewModal.css'

function DocumentCard({ label, document }) {
  return (
    <article className="admin-kyc-doc-card">
      <div className="admin-kyc-doc-card-head">
        <FileImage size={16} aria-hidden="true" />
        <strong>{label}</strong>
      </div>
      {document?.preview ? (
        <img src={document.preview} alt={`${label} preview`} className="admin-kyc-doc-preview" />
      ) : (
        <div className="admin-kyc-doc-empty">No document uploaded</div>
      )}
      {document?.name && <small>{document.name}</small>}
      {document?.uploadedAt && (
        <span>Uploaded {new Date(document.uploadedAt).toLocaleString('en-IN')}</span>
      )}
    </article>
  )
}

export function KycReviewModal({ user, onClose, onApprove, onReject }) {
  if (!user) return null

  const { kyc, orders, pendingOrders } = user
  const canDecide = user.kycStatus === 'in_review' || (user.hasDocuments && user.pendingOrderCount > 0)

  return (
    <div className="admin-modal-root admin-modal-root--wide" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div className="admin-kyc-review-modal" role="dialog" aria-modal="true" aria-labelledby="kyc-review-title">
        <div className="admin-kyc-review-header">
          <div className="admin-kyc-review-profile">
            <span className="admin-kyc-review-avatar" aria-hidden="true">
              {user.initials}
              {user.isOnline && <span className="admin-kyc-review-online-dot" />}
            </span>
            <div>
              <span className="admin-kyc-review-eyebrow">KYC review</span>
              <h2 id="kyc-review-title">
                {user.displayName}
                {user.kycStatus === 'approved' && (
                  <BadgeCheck className="admin-kyc-review-verified" size={16} aria-label="Verified" />
                )}
              </h2>
              <p>{user.email}</p>
            </div>
          </div>
          <button type="button" className="admin-kyc-review-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="admin-kyc-review-badges">
          <span className={`admin-kyc-review-status admin-kyc-review-status--${user.kycStatus}`}>
            <ShieldCheck size={14} aria-hidden="true" />
            {formatKycStatus(user.kycStatus)}
          </span>
          {user.isOnline && (
            <span className="admin-kyc-review-badge admin-kyc-review-badge--online">
              <Wifi size={14} aria-hidden="true" />
              Active session
            </span>
          )}
          <span className="admin-kyc-review-badge">
            {user.provider === 'google' ? 'Google sign-in' : 'Email sign-in'}
          </span>
          {user.pendingOrderCount > 0 && (
            <span className="admin-kyc-review-badge admin-kyc-review-badge--orders">
              <ShoppingBag size={14} aria-hidden="true" />
              {user.pendingOrderCount} order{user.pendingOrderCount === 1 ? '' : 's'} awaiting KYC
            </span>
          )}
        </div>

        <div className="admin-kyc-review-layout">
          <section className="admin-kyc-review-section">
            <h3>
              <User size={16} aria-hidden="true" />
              Customer profile
            </h3>
            <dl className="admin-kyc-review-dl">
              <div>
                <dt>Phone</dt>
                <dd>{user.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{user.location || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{user.joinedLabel}</dd>
              </div>
              <div>
                <dt>Total orders</dt>
                <dd>{user.orderCount}</dd>
              </div>
            </dl>
            {user.aboutMe && <p className="admin-kyc-review-note">{user.aboutMe}</p>}
          </section>

          <section className="admin-kyc-review-section">
            <h3>
              <FileImage size={16} aria-hidden="true" />
              Uploaded documents
            </h3>
            <div className="admin-kyc-doc-grid">
              <DocumentCard label="Aadhaar card" document={kyc.documents.aadhaar} />
              <DocumentCard label="PAN card" document={kyc.documents.pan} />
            </div>
          </section>

          <section className="admin-kyc-review-section">
            <h3>
              <ShieldCheck size={16} aria-hidden="true" />
              OCR extracted details
            </h3>
            {kyc.ocrData ? (
              <dl className="admin-kyc-review-dl admin-kyc-review-dl--compare">
                <div>
                  <dt>Name on ID</dt>
                  <dd>{kyc.ocrData.name || '—'}</dd>
                </div>
                <div>
                  <dt>Profile name</dt>
                  <dd>{user.displayName}</dd>
                </div>
                <div>
                  <dt>Aadhaar number</dt>
                  <dd>{kyc.ocrData.aadhaar || '—'}</dd>
                </div>
                <div>
                  <dt>PAN number</dt>
                  <dd>{kyc.ocrData.pan || '—'}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>{kyc.ocrData.dob || '—'}</dd>
                </div>
                <div>
                  <dt>Submitted on</dt>
                  <dd>{kyc.submittedLabel}</dd>
                </div>
              </dl>
            ) : (
              <p className="admin-kyc-review-empty">OCR data not available yet. User may still be uploading documents.</p>
            )}
          </section>

          <section className="admin-kyc-review-section">
            <h3>
              <Package size={16} aria-hidden="true" />
              Rental orders ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="admin-kyc-review-empty">No rental orders placed by this customer yet.</p>
            ) : (
              <ul className="admin-kyc-order-list">
                {orders.map((order) => (
                  <li key={order.id} className={order.awaitingKyc ? 'is-pending-kyc' : ''}>
                    <div className="admin-kyc-order-head">
                      <strong>{order.id}</strong>
                      <span className={`admin-kyc-order-status admin-kyc-order-status--${order.status}`}>
                        {order.awaitingKyc ? 'Awaiting KYC approval' : order.status}
                      </span>
                    </div>
                    <p>
                      {order.firstItemTitle}
                      {order.itemCount > 1 ? ` + ${order.itemCount - 1} more` : ''}
                      {' · '}
                      {formatINR(order.payAmount)}
                    </p>
                    <small>
                      <MapPin size={12} aria-hidden="true" />
                      {order.deliveryCity} · {order.scheduleLabel}
                    </small>
                    <small>Placed {order.placedLabel}</small>
                    <ul className="admin-kyc-order-items">
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.id}-${item.title}`}>
                          <img
                            src={typeof item.image === 'string' ? item.image : getProductImage(item)}
                            alt=""
                          />
                          <div>
                            <strong>{item.title}</strong>
                            <span>
                              Qty {item.quantity}
                              {item.durationLabel ? ` · ${item.durationLabel}` : ''}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-kyc-review-section admin-kyc-review-section--steps">
            <h3>Verification steps</h3>
            <div className="admin-kyc-review-progress">
              <strong>{kyc.progressPercent}% complete</strong>
              <span>{kyc.completedSteps}/{kyc.totalSteps} steps</span>
            </div>
            <div className="admin-kyc-review-progress-bar">
              <span style={{ width: `${kyc.progressPercent}%` }} />
            </div>
            <ul className="admin-kyc-review-steps">
              {kyc.steps.map((step) => (
                <li key={step.id} className={`admin-kyc-review-step admin-kyc-review-step--${step.status}`}>
                  <span>{step.label}</span>
                  <em>{step.status}</em>
                </li>
              ))}
            </ul>
            {kyc.rejectionReason && (
              <p className="admin-kyc-review-rejected-note">
                Previous rejection: {kyc.rejectionReason}
              </p>
            )}
          </section>
        </div>

        {canDecide && user.kycStatus !== 'approved' && (
          <div className="admin-kyc-review-actions">
            <p>
              Review the uploaded Aadhaar/PAN documents, compare OCR details with the customer profile,
              and check rental orders. Approving KYC will confirm {pendingOrders.length || 'pending'} rental order
              {pendingOrders.length === 1 ? '' : 's'} for dispatch.
            </p>
            <div className="admin-kyc-review-action-btns">
              <button
                type="button"
                className="admin-kyc-review-btn admin-kyc-review-btn--reject"
                onClick={() => onReject(user)}
              >
                <XCircle size={16} aria-hidden="true" />
                Reject KYC
              </button>
              <button
                type="button"
                className="admin-kyc-review-btn admin-kyc-review-btn--approve"
                onClick={() => onApprove(user)}
                disabled={!user.hasDocuments}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                Approve KYC & confirm orders
              </button>
            </div>
          </div>
        )}

        {user.kycStatus === 'approved' && (
          <div className="admin-kyc-review-approved-banner">
            <CheckCircle2 size={18} aria-hidden="true" />
            KYC verified on {kyc.completedLabel}. Rental orders are confirmed for fulfillment.
          </div>
        )}
      </div>
    </div>
  )
}
