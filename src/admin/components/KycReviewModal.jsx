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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  AdminIconButton,
  AdminOutlineButton,
  AdminPrimaryButton,
  AdminStatusBadge,
  adminDialogContentXWideClass,
} from './admin-ui'

const sectionClass = 'min-w-0 border border-[#e5e5e5] bg-[#fafafa] p-4'
const sectionTitleClass = 'mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#666] uppercase'
const dtClass = 'text-[10px] font-semibold tracking-wide text-[#888] uppercase'
const ddClass = 'mt-1 text-sm leading-relaxed text-[#1a1a1a] break-words [overflow-wrap:anywhere]'

function getKycStatusTone(status) {
  if (status === 'approved') return 'success'
  if (status === 'in_review' || status === 'in_progress') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'neutral'
}

function DocumentCard({ label, document }) {
  const preview = getKycDocumentPreview(document)

  return (
    <article className="border border-[#e5e5e5] bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
        <FileImage size={16} aria-hidden="true" />
        <strong>{label}</strong>
      </div>
      {preview ? (
        <img src={preview} alt={`${label} preview`} className="aspect-[4/3] w-full border border-[#e5e5e5] object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-[#ddd] bg-[#fafafa] text-xs text-[#888]">
          No document uploaded
        </div>
      )}
      {document?.name && <small className="mt-2 block text-xs text-[#888]">{document.name}</small>}
      {document?.uploadedAt && (
        <span className="mt-1 block text-[10px] text-[#888]">
          Uploaded {new Date(document.uploadedAt).toLocaleString('en-IN')}
        </span>
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
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={adminDialogContentXWideClass}
        showCloseButton={false}
        aria-labelledby="kyc-review-title"
      >
        <div className="flex items-start justify-between border-b border-[#e5e5e5] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex size-12 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#1a1a1a]" aria-hidden="true">
              {user.initials}
              {user.isOnline && (
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 border border-white bg-[#1f6b3a]" />
              )}
            </span>
            <div>
              <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#666] uppercase">
                KYC review
              </span>
              <h2 id="kyc-review-title" className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a]">
                {user.displayName}
                {user.kycStatus === 'approved' && (
                  <BadgeCheck size={16} aria-label="Verified" className="text-[#1f6b3a]" />
                )}
              </h2>
              <p className="text-sm text-[#888]">{user.email}</p>
            </div>
          </div>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        {loading && (
          <Alert className="mx-6 mt-4 rounded-none border-[#c8daf5] bg-[#eef4fd] text-[#245ea8]">
            <AlertDescription>Loading latest KYC documents from Firestore...</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] px-6 py-4">
          <AdminStatusBadge tone={getKycStatusTone(user.kycStatus)} className="gap-1.5">
            <ShieldCheck size={14} aria-hidden="true" />
            {formatKycStatus(user.kycStatus)}
          </AdminStatusBadge>
          {user.isOnline && (
            <AdminStatusBadge tone="success" className="gap-1.5">
              <Wifi size={14} aria-hidden="true" />
              Active session
            </AdminStatusBadge>
          )}
          <AdminStatusBadge tone="neutral">
            {user.provider === 'google' ? 'Google sign-in' : 'Email sign-in'}
          </AdminStatusBadge>
          {user.pendingOrderCount > 0 && (
            <AdminStatusBadge tone="warning" className="gap-1.5">
              <ShoppingBag size={14} aria-hidden="true" />
              {user.pendingOrderCount} order{user.pendingOrderCount === 1 ? '' : 's'} awaiting KYC
            </AdminStatusBadge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-2">
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <User size={16} aria-hidden="true" />
              Customer profile
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className={dtClass}>Phone</dt>
                <dd className={ddClass}>{user.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className={dtClass}>Location</dt>
                <dd className={ddClass}>{user.location || 'Not provided'}</dd>
              </div>
              <div>
                <dt className={dtClass}>Member since</dt>
                <dd className={ddClass}>{user.joinedLabel}</dd>
              </div>
              <div>
                <dt className={dtClass}>Total orders</dt>
                <dd className={ddClass}>{user.orderCount}</dd>
              </div>
            </dl>
            {user.aboutMe && (
              <p className="mt-3 border border-[#e5e5e5] bg-white p-3 text-sm leading-relaxed text-[#444]">
                {user.aboutMe}
              </p>
            )}
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <FileImage size={16} aria-hidden="true" />
              Uploaded documents
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DocumentCard label="Aadhaar card" document={kyc.documents.aadhaar} />
              <DocumentCard label="PAN card" document={kyc.documents.pan} />
              <DocumentCard label="Live selfie" document={kyc.documents.selfie} />
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <ShieldCheck size={16} aria-hidden="true" />
              OCR extracted details
            </h3>
            {kyc.ocrData ? (
              <dl className="grid grid-cols-1 gap-3">
                <div>
                  <dt className={dtClass}>Name on ID</dt>
                  <dd className={ddClass}>{kyc.ocrData.name || '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Profile name</dt>
                  <dd className={ddClass}>{user.displayName}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Aadhaar number</dt>
                  <dd className={ddClass}>{kyc.ocrData.aadhaar || '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>PAN number</dt>
                  <dd className={ddClass}>{kyc.ocrData.pan || '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Date of birth</dt>
                  <dd className={ddClass}>{kyc.ocrData.dob || '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Submitted on</dt>
                  <dd className={ddClass}>{kyc.submittedLabel}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-[#666]">
                OCR data not available yet. User may still be uploading documents.
              </p>
            )}
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <Package size={16} aria-hidden="true" />
              Rental orders ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="text-sm text-[#666]">No rental orders placed by this customer yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className={cn(
                      'border border-[#e5e5e5] bg-white p-3',
                      order.awaitingKyc && 'border-[#f0d9a8] bg-[#fff8ea]',
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <strong className="text-sm text-[#1a1a1a]">{order.id}</strong>
                      <AdminStatusBadge tone={order.awaitingKyc ? 'warning' : 'neutral'}>
                        {order.awaitingKyc ? 'Awaiting KYC approval' : order.status}
                      </AdminStatusBadge>
                    </div>
                    <p className="text-sm text-[#444]">
                      {order.firstItemTitle}
                      {order.itemCount > 1 ? ` + ${order.itemCount - 1} more` : ''}
                      {' · '}
                      {formatINR(order.payAmount)}
                    </p>
                    <small className="mt-1 flex items-center gap-1 text-xs text-[#888]">
                      <MapPin size={12} aria-hidden="true" />
                      {order.deliveryCity} · {order.scheduleLabel}
                    </small>
                    <small className="mt-0.5 block text-xs text-[#888]">Placed {order.placedLabel}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cn(sectionClass, 'lg:col-span-2')}>
            <h3 className={sectionTitleClass}>Verification steps</h3>
            <div className="mb-2 flex items-center justify-between text-sm">
              <strong className="text-[#1a1a1a]">{kyc.progressPercent}% complete</strong>
              <span className="text-[#888]">{kyc.completedSteps}/{kyc.totalSteps} steps</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden bg-[#e5e5e5]">
              <span
                className="block h-full bg-[#1a1a1a] transition-all"
                style={{ width: `${kyc.progressPercent}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {kyc.steps.map((step) => (
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
            {kyc.rejectionReason && (
              <p className="mt-3 border border-[#f0caca] bg-[#fdf2f2] p-3 text-xs text-[#a94442]">
                Previous rejection: {kyc.rejectionReason}
              </p>
            )}
          </section>
        </div>

        {canDecide && (
          <div className="border-t border-[#e5e5e5] px-6 py-4">
            <p className="mb-4 text-sm leading-relaxed text-[#666]">
              Review the uploaded Aadhaar/PAN documents and live selfie. Approving KYC lets this customer
              rent products and confirms {pendingOrders.length || 'any pending'} rental order
              {pendingOrders.length === 1 ? '' : 's'} for dispatch.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <AdminOutlineButton
                className="gap-2 border-[#f0d0d0] text-[#c0392b] normal-case tracking-normal hover:bg-[#c0392b] hover:text-white"
                onClick={() => onReject(user)}
                disabled={loading}
              >
                <XCircle size={16} aria-hidden="true" />
                Reject KYC
              </AdminOutlineButton>
              <AdminPrimaryButton
                className="gap-2 normal-case tracking-normal"
                onClick={() => onApprove(user)}
                disabled={loading || !user.hasDocuments}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                Approve KYC
              </AdminPrimaryButton>
            </div>
          </div>
        )}

        {user.kycStatus === 'approved' && (
          <Alert className="mx-6 mb-6 rounded-none border-[#b8dfc4] bg-[#eef8f0] text-[#1f6b3a]">
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
