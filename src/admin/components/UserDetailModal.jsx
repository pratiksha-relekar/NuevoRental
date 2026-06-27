import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileImage, ShieldCheck, X } from 'lucide-react'
import { buildKycDetail, getKycDocumentPreview, loadAdminKycUserDetail } from '../../data/kycStorage'
import { formatKycStatus } from '../../data/userStorage'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
function KycDocumentThumb({ label, document }) {
  const preview = getKycDocumentPreview(document)

  return (
    <article className="admin-user-kyc-doc">
      <span>{label}</span>
      {preview ? (
        <img src={preview} alt={`${label} preview`} />
      ) : (
        <div className="admin-user-kyc-doc-empty">Not uploaded</div>
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
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="admin-user-detail-modal admin-user-detail-modal--wide admin-modal-root--wide"
        showCloseButton={false}
        aria-labelledby="user-detail-title"
      >
        <div className="admin-user-detail-header">
          <div className="admin-user-detail-profile">
            <span className="admin-user-detail-avatar" aria-hidden="true">
              {user.initials}
            </span>
            <div>
              <h2 id="user-detail-title">{user.displayName}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" className="admin-user-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <div className="admin-user-detail-grid">
          <div>
            <span>Session</span>
            <strong>{user.isOnline ? 'Logged in now' : 'Offline'}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user.role === 'renter' ? 'Renter' : 'Customer'}</strong>
          </div>
          <div>
            <span>Provider</span>
            <strong>{user.provider === 'google' ? 'Google' : 'Email'}</strong>
          </div>
          <div>
            <span>KYC status</span>
            <strong>{formatKycStatus(kycUser?.kycStatus ?? user.kycStatus)}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{user.phone || 'Not provided'}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{user.location || 'Not provided'}</strong>
          </div>
          <div>
            <span>Rental orders</span>
            <strong>{user.orderCount}</strong>
          </div>
          <div>
            <span>Joined</span>
            <strong>{user.joinedLabel}</strong>
          </div>
        </div>

        <section className="admin-user-detail-kyc">
          <div className="admin-user-detail-kyc-head">
            <h3>
              <ShieldCheck size={16} aria-hidden="true" />
              KYC documents
            </h3>
            <Link to="/admin/kyc" className="admin-user-detail-kyc-link" onClick={onClose}>
              Open KYC verification
            </Link>
          </div>

          {loadingKyc ? (
            <p className="admin-user-detail-kyc-loading">Loading KYC documents...</p>
          ) : (
            <>
              <div className="admin-user-detail-kyc-docs">
                <KycDocumentThumb label="Aadhaar" document={kyc.documents.aadhaar} />
                <KycDocumentThumb label="PAN" document={kyc.documents.pan} />
                <KycDocumentThumb label="Selfie" document={kyc.documents.selfie} />
              </div>

              {kyc.ocrData && (
                <dl className="admin-user-detail-kyc-ocr">
                  <div><dt>Name</dt><dd>{kyc.ocrData.name || '—'}</dd></div>
                  <div><dt>Aadhaar</dt><dd>{kyc.ocrData.aadhaar || '—'}</dd></div>
                  <div><dt>PAN</dt><dd>{kyc.ocrData.pan || '—'}</dd></div>
                  <div><dt>Submitted</dt><dd>{kyc.submittedLabel}</dd></div>
                </dl>
              )}

              {!kyc.documents.hasAadhaar && !kyc.documents.hasPan && (
                <p className="admin-user-detail-kyc-empty">
                  <FileImage size={14} aria-hidden="true" />
                  No KYC documents uploaded yet.
                </p>
              )}
            </>
          )}
        </section>

        {user.aboutMe && (
          <div className="admin-user-detail-about">
            <span>About</span>
            <p>{user.aboutMe}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
