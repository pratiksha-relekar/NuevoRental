import {
  BadgeCheck,
  CheckCircle2,
  FileImage,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  User,
  Wifi,
  X,
  XCircle,
} from 'lucide-react'
import { getKycDocumentPreview } from '../../data/kycStorage'
import { formatINR } from '../../utils/cartSummary'
import { formatKycStatus } from '../../data/userStorage'
import { getProductImage } from '../../data/products'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
function DocumentCard({ label, document }) {
  const preview = getKycDocumentPreview(document)

  return (
    <article className="admin-kyc-doc-card">
      <div className="admin-kyc-doc-card-head">
        <FileImage size={16} aria-hidden="true" />
        <strong>{label}</strong>
      </div>
      {preview ? (
        <img src={preview} alt={`${label} preview`} className="admin-kyc-doc-preview" />
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

export function KycReviewModal({ user, loading = false, onClose, onApprove, onReject }) {
  if (!user) return null

  const { kyc, orders, pendingOrders } = user
  const canDecide = user.canReview ?? (
    user.kycStatus !== 'approved'
    && (user.kycStatus === 'in_review' || user.hasDocuments)
  )

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="admin-kyc-review-modal admin-modal-root--wide"
        showCloseButton={false}
        aria-labelledby="kyc-review-title"
      >
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
          <Button type="button" variant="ghost" className="admin-kyc-review-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {loading && (
          <Alert className="admin-kyc-review-loading">
            <AlertDescription>Loading latest KYC documents from Firestore...</AlertDescription>
          </Alert>
        )}

        <div className="admin-kyc-review-badges">
          <Badge className={`admin-kyc-review-status admin-kyc-review-status--${user.kycStatus}`}>
            <ShieldCheck size={14} aria-hidden="true" />
            {formatKycStatus(user.kycStatus)}
          </Badge>
          {user.isOnline && (
            <Badge className="admin-kyc-review-badge admin-kyc-review-badge--online">
              <Wifi size={14} aria-hidden="true" />
              Active session
            </Badge>
          )}
          <Badge className="admin-kyc-review-badge">
            {user.provider === 'google' ? 'Google sign-in' : 'Email sign-in'}
          </Badge>
          {user.pendingOrderCount > 0 && (
            <Badge className="admin-kyc-review-badge admin-kyc-review-badge--orders">
              <ShoppingBag size={14} aria-hidden="true" />
              {user.pendingOrderCount} order{user.pendingOrderCount === 1 ? '' : 's'} awaiting KYC
            </Badge>
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
              <DocumentCard label="Live selfie" document={kyc.documents.selfie} />
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

        {canDecide && (
          <div className="admin-kyc-review-actions">
            <p>
              Review the uploaded Aadhaar/PAN documents and live selfie. Approving KYC lets this customer
              rent products and confirms {pendingOrders.length || 'any pending'} rental order
              {pendingOrders.length === 1 ? '' : 's'} for dispatch.
            </p>
            <div className="admin-kyc-review-action-btns">
              <Button
                type="button"
                variant="outline"
                className="admin-kyc-review-btn admin-kyc-review-btn--reject"
                onClick={() => onReject(user)}
                disabled={loading}
              >
                <XCircle size={16} aria-hidden="true" />
                Reject KYC
              </Button>
              <Button
                type="button"
                className="admin-kyc-review-btn admin-kyc-review-btn--approve"
                onClick={() => onApprove(user)}
                disabled={loading || !user.hasDocuments}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                Approve KYC
              </Button>
            </div>
          </div>
        )}

        {user.kycStatus === 'approved' && (
          <Alert className="admin-kyc-review-approved-banner">
            <CheckCircle2 size={18} aria-hidden="true" />
            <AlertDescription>
              KYC verified on {kyc.completedLabel}. Customer can rent any product on Nuevo Rental.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}
