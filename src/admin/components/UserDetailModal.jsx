import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileImage, ShieldCheck, X } from 'lucide-react'
import { buildKycDetail, getKycDocumentPreview, loadAdminKycUserDetail } from '../../data/kycStorage'
import { formatKycStatus } from '../../data/userStorage'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AdminIconButton } from './admin-ui'

const labelClass = 'text-[11px] font-semibold tracking-wide text-[#444] uppercase'
const dtClass = 'text-[10px] font-semibold tracking-wide text-[#888] uppercase'
const ddClass = 'mt-1 text-sm text-[#1a1a1a]'

function KycDocumentThumb({ label, document }) {
  const preview = getKycDocumentPreview(document)

  return (
    <article className="border border-[#e5e5e5] bg-[#fafafa] p-3">
      <span className={labelClass}>{label}</span>
      {preview ? (
        <img src={preview} alt={`${label} preview`} className="mt-2 aspect-[4/3] w-full border border-[#e5e5e5] object-cover" />
      ) : (
        <div className="mt-2 flex aspect-[4/3] items-center justify-center border border-dashed border-[#ddd] bg-white text-xs text-[#888]">
          Not uploaded
        </div>
      )}
    </article>
  )
}

export function UserDetailModal({ user, onClose }) {
  const [kycUser, setKycUser] = useState(null)
  const [loadingKyc, setLoadingKyc] = useState(false)

  useEffect(() => {
    if (!user?.email) {
      setKycUser(null)
      return undefined
    }

    let active = true
    setLoadingKyc(true)

    loadAdminKycUserDetail(user.email)
      .then((detail) => {
        if (active) {
          setKycUser(detail)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingKyc(false)
        }
      })

    return () => {
      active = false
    }
  }, [user?.email])

  if (!user) return null

  const kyc = kycUser?.kyc ?? buildKycDetail(null)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[min(92vh,860px)] max-w-[760px] gap-0 overflow-auto rounded-none border-[#d8d8d8] p-0"
        showCloseButton={false}
        aria-labelledby="user-detail-title"
      >
        <div className="flex items-start justify-between border-b border-[#e5e5e5] px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-12 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#1a1a1a]"
              aria-hidden="true"
            >
              {user.initials}
            </span>
            <div>
              <h2 id="user-detail-title" className="text-lg font-bold text-[#1a1a1a]">
                {user.displayName}
              </h2>
              <p className="text-sm text-[#888]">{user.email}</p>
            </div>
          </div>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-4 max-sm:grid-cols-1">
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Session</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.isOnline ? 'Logged in now' : 'Offline'}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Role</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.role === 'renter' ? 'Renter' : 'Customer'}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Provider</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.provider === 'google' ? 'Google' : 'Email'}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>KYC status</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{formatKycStatus(kycUser?.kycStatus ?? user.kycStatus)}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Phone</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.phone || 'Not provided'}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Location</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.location || 'Not provided'}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Rental orders</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.orderCount}</strong>
          </div>
          <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
            <span className={labelClass}>Joined</span>
            <strong className="mt-1 block text-sm text-[#1a1a1a]">{user.joinedLabel}</strong>
          </div>
        </div>

        <section className="border-t border-[#e5e5e5] px-6 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#666] uppercase">
              <ShieldCheck size={16} aria-hidden="true" />
              KYC documents
            </h3>
            <Link
              to="/admin/kyc"
              className="text-sm font-semibold text-[#1a1a1a] underline-offset-2 hover:underline"
              onClick={onClose}
            >
              Open KYC verification
            </Link>
          </div>

          {loadingKyc ? (
            <p className="text-sm text-[#666]">Loading KYC documents...</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                <KycDocumentThumb label="Aadhaar" document={kyc.documents.aadhaar} />
                <KycDocumentThumb label="PAN" document={kyc.documents.pan} />
                <KycDocumentThumb label="Selfie" document={kyc.documents.selfie} />
              </div>

              {kyc.ocrData && (
                <dl className="mt-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                  <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
                    <dt className={dtClass}>Name</dt>
                    <dd className={ddClass}>{kyc.ocrData.name || '—'}</dd>
                  </div>
                  <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
                    <dt className={dtClass}>Aadhaar</dt>
                    <dd className={ddClass}>{kyc.ocrData.aadhaar || '—'}</dd>
                  </div>
                  <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
                    <dt className={dtClass}>PAN</dt>
                    <dd className={ddClass}>{kyc.ocrData.pan || '—'}</dd>
                  </div>
                  <div className="border border-[#e5e5e5] bg-[#fafafa] p-3">
                    <dt className={dtClass}>Submitted</dt>
                    <dd className={ddClass}>{kyc.submittedLabel}</dd>
                  </div>
                </dl>
              )}

              {!kyc.documents.hasAadhaar && !kyc.documents.hasPan && (
                <p className="mt-4 flex items-center gap-2 text-sm text-[#666]">
                  <FileImage size={14} aria-hidden="true" />
                  No KYC documents uploaded yet.
                </p>
              )}
            </>
          )}
        </section>

        {user.aboutMe && (
          <div className="border-t border-[#e5e5e5] px-6 py-4">
            <span className={labelClass}>About</span>
            <p className="mt-2 text-sm leading-relaxed text-[#444]">{user.aboutMe}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
