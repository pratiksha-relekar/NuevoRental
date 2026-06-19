import { X } from 'lucide-react'
import { formatKycStatus } from '../../data/userStorage'
import './ProductFormModal.css'
import './UserDetailModal.css'

export function UserDetailModal({ user, onClose }) {
  if (!user) return null

  return (
    <div className="admin-modal-root" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div className="admin-user-detail-modal" role="dialog" aria-modal="true" aria-labelledby="user-detail-title">
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
          <button type="button" className="admin-user-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
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
            <strong>{formatKycStatus(user.kycStatus)}</strong>
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

        {user.aboutMe && (
          <div className="admin-user-detail-about">
            <span>About</span>
            <p>{user.aboutMe}</p>
          </div>
        )}
      </div>
    </div>
  )
}
