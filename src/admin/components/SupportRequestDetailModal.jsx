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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
export function SupportRequestDetailModal({ request, onClose, onStatusChange, onNotesChange }) {
  if (!request) return null

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="admin-support-detail-modal admin-modal-root--wide"
        showCloseButton={false}
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
          <Button type="button" variant="ghost" className="admin-support-detail-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <div className="admin-support-detail-badges">
          <Badge className={`admin-support-detail-status admin-support-detail-status--${request.status}`}>
            {request.statusLabel}
          </Badge>
          {request.isRegisteredUser && (
            <Badge className="admin-support-detail-badge admin-support-detail-badge--user">
              Registered customer · {request.userOrderCount} order{request.userOrderCount === 1 ? '' : 's'}
            </Badge>
          )}
          <Badge className="admin-support-detail-badge">Submitted {request.createdLabel}</Badge>
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
              <div className="admin-support-detail-dl-item admin-support-detail-dl-item--full">
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
            <Label className="admin-support-detail-field">
              <span>Ticket status</span>
              <Select value={request.status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {SUPPORT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <Label className="admin-support-detail-field">
              <span>Internal notes</span>
              <Textarea
                rows={4}
                value={request.adminNotes ?? ''}
                placeholder="Call summary, resolution steps, or follow-up reminders..."
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </Label>
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
      </DialogContent>
    </Dialog>
  )
}
