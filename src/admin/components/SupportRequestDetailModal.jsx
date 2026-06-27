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
import { buttonVariants } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import {
  AdminIconButton,
  adminInputClass,
  adminSelectTriggerClass,
  AdminStatusBadge,
} from './admin-ui'

const labelClass = 'text-[11px] font-semibold tracking-wide text-[#444] uppercase'
const sectionClass = 'border border-[#e5e5e5] bg-[#fafafa] p-4'
const sectionTitleClass = 'mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#666] uppercase'
const dtClass = 'text-[10px] font-semibold tracking-wide text-[#888] uppercase'
const ddClass = 'text-sm text-[#1a1a1a]'

function getSupportStatusTone(status) {
  if (status === 'open') return 'warning'
  if (status === 'in_progress') return 'info'
  if (status === 'resolved') return 'success'
  if (status === 'closed') return 'neutral'
  return 'neutral'
}

export function SupportRequestDetailModal({ request, onClose, onStatusChange, onNotesChange }) {
  if (!request) return null

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[min(92vh,860px)] max-w-[760px] gap-0 overflow-auto rounded-none border-[#d8d8d8] p-0"
        showCloseButton={false}
        aria-labelledby="support-detail-title"
      >
        <div className="flex items-start justify-between border-b border-[#e5e5e5] px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-12 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-sm font-bold text-[#1a1a1a]"
              aria-hidden="true"
            >
              {request.initials}
            </span>
            <div>
              <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#666] uppercase">
                {request.id}
              </span>
              <h2 id="support-detail-title" className="text-lg font-bold text-[#1a1a1a]">
                {request.name}
              </h2>
              <p className="text-sm text-[#888]">{request.topicLabel}</p>
            </div>
          </div>
          <AdminIconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </AdminIconButton>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] px-6 py-4">
          <AdminStatusBadge tone={getSupportStatusTone(request.status)}>
            {request.statusLabel}
          </AdminStatusBadge>
          {request.isRegisteredUser && (
            <AdminStatusBadge tone="info">
              Registered customer · {request.userOrderCount} order{request.userOrderCount === 1 ? '' : 's'}
            </AdminStatusBadge>
          )}
          <AdminStatusBadge tone="neutral">Submitted {request.createdLabel}</AdminStatusBadge>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#e5e5e5] px-6 py-4">
          {request.telHref && (
            <a
              href={request.telHref}
              className={cn(
                buttonVariants({ variant: 'adminOutline', size: 'admin' }),
                'inline-flex items-center gap-2 no-underline normal-case tracking-normal',
              )}
            >
              <Phone size={16} aria-hidden="true" />
              Call {request.phone}
            </a>
          )}
          {request.mailHref && (
            <a
              href={request.mailHref}
              className={cn(
                buttonVariants({ variant: 'adminOutline', size: 'admin' }),
                'inline-flex items-center gap-2 no-underline normal-case tracking-normal',
              )}
            >
              <Mail size={16} aria-hidden="true" />
              Email customer
            </a>
          )}
        </div>

        <div className="grid gap-4 px-6 py-4">
          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <User size={16} aria-hidden="true" />
              Customer details
            </h3>
            <dl className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
              <div>
                <dt className={dtClass}>Full name</dt>
                <dd className={ddClass}>{request.name}</dd>
              </div>
              <div>
                <dt className={dtClass}>Phone</dt>
                <dd className={ddClass}>{request.phone || 'Not provided'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className={dtClass}>Email</dt>
                <dd className={ddClass}>{request.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt className={dtClass}>Inquiry type</dt>
                <dd className={ddClass}>{request.topicLabel}</dd>
              </div>
              <div>
                <dt className={dtClass}>Source</dt>
                <dd className={ddClass}>{request.source === 'contact' ? 'Contact us page' : 'Support page'}</dd>
              </div>
              <div>
                <dt className={dtClass}>Last updated</dt>
                <dd className={ddClass}>{request.updatedLabel}</dd>
              </div>
            </dl>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>
              <MessageSquare size={16} aria-hidden="true" />
              Support message
            </h3>
            <p className="text-sm leading-relaxed text-[#444]">{request.message || 'No message provided.'}</p>
          </section>

          <section className={cn(sectionClass, 'md:col-span-2')}>
            <h3 className={sectionTitleClass}>Admin follow-up</h3>
            <div className="grid gap-4">
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Ticket status</span>
                <Select value={request.status} onValueChange={onStatusChange}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full')}>
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
              <Label className="flex flex-col gap-2">
                <span className={labelClass}>Internal notes</span>
                <Textarea
                  rows={4}
                  className={cn(adminInputClass, 'min-h-[100px] resize-y')}
                  value={request.adminNotes ?? ''}
                  placeholder="Call summary, resolution steps, or follow-up reminders..."
                  onChange={(e) => onNotesChange(e.target.value)}
                />
              </Label>
            </div>
          </section>
        </div>

        <div className="space-y-2 border-t border-[#e5e5e5] px-6 py-4 text-xs text-[#888]">
          <p className="flex items-center gap-2">
            <Clock3 size={14} aria-hidden="true" />
            Nuevo Rental support hours: Mon–Sat, 9am – 7pm IST · Hotline{' '}
            <a href="tel:+918080808964" className="font-semibold text-[#1a1a1a] underline-offset-2 hover:underline">
              8080808964
            </a>
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} aria-hidden="true" />
            Pan-India rental support across Pune, Mumbai, Delhi NCR, Bengaluru, and more.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
