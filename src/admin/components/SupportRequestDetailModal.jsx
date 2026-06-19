import {
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
} from 'lucide-react'
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_OPTIONS,
} from '../../data/supportStorage'
import './ProductFormModal.css'
import './SupportRequestDetailModal.css'

export function SupportRequestDetailModal({ request, onClose, onStatusChange, onNotesChange }) {
  if (!request) return null

  return (
    <div className="admin-modal-root admin-modal-root--wide" role="presentation">
      <button type="button" className="admin-modal-scrim" onClick={onClose} aria-label="Close modal" />
      <div
        className="admin-support-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-detail-title"
      >
        <div className="admin-support-detail-header">
          <div className="admin-support-detail-profile">
            <span className="admin-support-detail-avatar" aria-hidden="true">
              {request.initials}
            </span>
            <div>
              <span className="admin-support-detail-eyebrow">{request.id}</span>
              <h2 id="support-detail-title">{request.name}</h2>
              <p>{request.topicLabel}</p>
            </div>
          </div>
          <button type="button" className="admin-support-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="admin-support-detail-badges">
          <span className={`admin-support-detail-status admin-support-detail-status--${request.status}`}>
            {request.statusLabel}
          </span>
          {request.isRegisteredUser && (
            <span className="admin-support-detail-badge admin-support-detail-badge--user">
              Registered customer · {request.userOrderCount} order{request.userOrderCount === 1 ? '' : 's'}
            </span>
          )}
          <span className="admin-support-detail-badge">Submitted {request.createdLabel}</span>
        </div>

        <div className="admin-support-detail-actions">
          {request.telHref && (
            <a href={request.telHref} className="admin-support-contact-btn admin-support-contact-btn--call">
              <Phone size={16} aria-hidden="true" />
              Call {request.phone}
            </a>
          )}
          {request.mailHref && (
            <a href={request.mailHref} className="admin-support-contact-btn admin-support-contact-btn--email">
              <Mail size={16} aria-hidden="true" />
              Email customer
            </a>
          )}
          {request.whatsappHref && (
            <a
              href={request.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="admin-support-contact-btn admin-support-contact-btn--whatsapp"
            >
              <MessageSquare size={16} aria-hidden="true" />
              WhatsApp
            </a>
          )}
        </div>

        <div className="admin-support-detail-layout">
          <section className="admin-support-detail-section">
            <h3>
              <User size={16} aria-hidden="true" />
              Customer details
            </h3>
            <dl className="admin-support-detail-dl">
              <div>
                <dt>Full name</dt>
                <dd>{request.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{request.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{request.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Inquiry type</dt>
                <dd>{request.topicLabel}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{request.source === 'contact' ? 'Contact us page' : 'Support page'}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{request.updatedLabel}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-support-detail-section">
            <h3>
              <MessageSquare size={16} aria-hidden="true" />
              Support message
            </h3>
            <p className="admin-support-detail-message">{request.message || 'No message provided.'}</p>
          </section>

          <section className="admin-support-detail-section admin-support-detail-section--full">
            <h3>Admin follow-up</h3>
            <label className="admin-support-detail-field">
              <span>Ticket status</span>
              <select
                value={request.status}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                {SUPPORT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {SUPPORT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-support-detail-field">
              <span>Internal notes</span>
              <textarea
                rows={4}
                value={request.adminNotes ?? ''}
                placeholder="Call summary, resolution steps, or follow-up reminders..."
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </label>
          </section>
        </div>

        <div className="admin-support-detail-footer">
          <p>
            <Clock3 size={14} aria-hidden="true" />
            Nuevo Rental support hours: Mon–Sat, 9am – 7pm IST · Hotline{' '}
            <a href="tel:+918080808964">8080808964</a>
          </p>
          <p>
            <MapPin size={14} aria-hidden="true" />
            Pan-India rental support across Pune, Mumbai, Delhi NCR, Bengaluru, and more.
          </p>
        </div>
      </div>
    </div>
  )
}
