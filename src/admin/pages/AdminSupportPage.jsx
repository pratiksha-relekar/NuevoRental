import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  Headphones,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Ticket,
} from 'lucide-react'
import { hasSupportPrivilege } from '../../backend/firestore/adminCatalog'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  fetchAdminSupportRequests,
  getAdminSupportRequestById,
  getAdminSupportStats,
  subscribeToAdminSupportQueue,
  updateSupportRequestStatus,
} from '../../data/supportStorage'
import { SupportRequestDetailModal } from '../components/SupportRequestDetailModal'
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminOutlineButton,
  AdminPrimaryButton,
  AdminSearchField,
  AdminStatCard,
  AdminStatusBadge,
  AdminTabTrigger,
  AdminTabsList,
  AdminToolbar,
} from '../components/admin-ui'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
  { id: 'all', label: 'All requests' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
]

function supportStatusTone(status) {
  switch (status) {
    case 'open':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'resolved':
      return 'success'
    case 'closed':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function AdminSupportPage() {
  const reduceMotion = useReducedMotion()
  const { admin } = useAdminAuth()
  const canManageSupport = hasSupportPrivilege(admin)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')

  useEffect(() => {
    if (!canManageSupport) {
      setLoading(false)
      return undefined
    }

    let active = true

    async function loadRequests() {
      setLoading(true)
      setLoadError('')
      try {
        const nextRequests = await fetchAdminSupportRequests()
        if (active) {
          setRequests(nextRequests)
        }
      } catch (error) {
        if (active) {
          setRequests([])
          setLoadError(error?.message || 'Could not load support requests from Firestore.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadRequests()

    const unsubscribe = subscribeToAdminSupportQueue(
      (nextRequests) => {
        if (active) {
          setRequests(nextRequests)
          setLoading(false)
        }
      },
      () => {
        if (active) {
          setLoadError('Live support updates are unavailable. Showing the latest saved data.')
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [canManageSupport])

  useEffect(() => {
    if (!selectedRequest?.id) return undefined
    const refreshed = getAdminSupportRequestById(selectedRequest.id, requests)
    if (!refreshed) return undefined
    setSelectedRequest((current) =>
      current?.id === refreshed.id
        ? { ...refreshed, adminNotes: current.adminNotes ?? refreshed.adminNotes }
        : current,
    )
    return undefined
  }, [requests, selectedRequest?.id])

  const stats = useMemo(() => getAdminSupportStats(requests), [requests])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return requests.filter((request) => {
      if (activeFilter === 'resolved') {
        if (request.status !== 'resolved' && request.status !== 'closed') return false
      } else if (activeFilter !== 'all' && request.status !== activeFilter) {
        return false
      }

      if (!query) return true

      const haystack = [
        request.id,
        request.name,
        request.email,
        request.phone,
        request.topicLabel,
        request.message,
        request.statusLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [requests, search, activeFilter])

  const refreshSelectedRequest = (requestId) => {
    setSelectedRequest(getAdminSupportRequestById(requestId, requests))
  }

  const openRequest = (request) => {
    const full = getAdminSupportRequestById(request.id, requests) ?? request
    setSelectedRequest(full)
    setNotesDraft(full.adminNotes ?? '')
  }

  const handleStatusChange = async (status) => {
    if (!selectedRequest) return
    await updateSupportRequestStatus(selectedRequest.id, status, notesDraft)
    refreshSelectedRequest(selectedRequest.id)
  }

  const handleNotesChange = async (notes) => {
    setNotesDraft(notes)
    if (!selectedRequest) return
    await updateSupportRequestStatus(selectedRequest.id, selectedRequest.status, notes)
    setSelectedRequest((current) => (current ? { ...current, adminNotes: notes } : current))
  }

  if (!canManageSupport) {
    return (
      <AdminPage>
        <AdminPageHeader
          title="Support & inquiries"
          description="You do not have permission to manage support requests. Contact a super admin to enable the manage_support privilege."
        />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Support & inquiries"
        description="Review contact form submissions, call requesting customers, and resolve rental support tickets from the Nuevo Rental website."
      />

      {loadError ? (
        <Alert className="rounded-none border-[#f0caca] bg-[#fdf2f2] text-[#a94442]">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {stats.urgent > 0 ? (
        <motion.aside
          className="flex flex-col gap-4 border border-[#e5e5e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Alert className="border-0 bg-transparent p-0 shadow-none">
            <AlertCircle size={22} className="text-[#8a6200]" aria-hidden="true" />
            <div>
              <AlertTitle className="text-sm font-bold text-[#1a1a1a]">
                {stats.urgent} urgent support request{stats.urgent === 1 ? '' : 's'} need attention
              </AlertTitle>
              <AlertDescription className="text-sm text-[#666]">
                Technical support and delivery inquiries are waiting for a callback. Review details and contact
                customers directly from each ticket.
              </AlertDescription>
            </div>
          </Alert>
          <AdminPrimaryButton type="button" onClick={() => setActiveFilter('open')}>
            View open tickets
          </AdminPrimaryButton>
        </motion.aside>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={Ticket} label="Total requests" value={stats.total} note="all support inquiries" />
        <AdminStatCard icon={MessageSquare} label="Open tickets" value={stats.open} note="awaiting admin response" />
        <AdminStatCard icon={Clock3} label="In progress" value={stats.inProgress} note="active follow-ups" />
        <AdminStatCard
          icon={CheckCircle2}
          label="Resolved today"
          value={stats.resolvedToday}
          note={`${stats.resolved} total closed`}
        />
      </div>

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1a1a1a]">Customer support requests</h2>
            <p className="mt-1 text-sm text-[#666]">
              {loading
                ? 'Loading support requests...'
                : `${filteredRequests.length} matching ticket${filteredRequests.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link
            to="/contact"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] hover:underline"
          >
            View contact page
          </Link>
        </div>

        <AdminToolbar>
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <AdminTabsList>
              {FILTER_TABS.map((tab) => (
                <AdminTabTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </AdminTabTrigger>
              ))}
            </AdminTabsList>
            <TabsContent value={activeFilter} className="hidden" />
          </Tabs>

          <AdminSearchField
            icon={Search}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, ticket ID or message"
          />
        </AdminToolbar>

        <div className="flex flex-col gap-3 p-4">
          {filteredRequests.map((request, index) => (
            <motion.article
              key={request.id}
              className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-4"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]">
                    {request.initials}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#888]">
                      {request.id}
                    </span>
                    <h3 className="text-sm font-bold text-[#1a1a1a]">{request.name}</h3>
                    <p className="text-xs text-[#666]">{request.email}</p>
                  </div>
                </div>
                <AdminStatusBadge tone={supportStatusTone(request.status)}>
                  {request.statusLabel}
                </AdminStatusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#666]">
                <AdminStatusBadge tone="neutral">{request.topicLabel}</AdminStatusBadge>
                <span>{request.createdLabel}</span>
                {request.isRegisteredUser ? (
                  <span className="text-[#1f6b3a]">
                    Registered · {request.userOrderCount} orders
                  </span>
                ) : null}
              </div>

              <p className="text-sm leading-relaxed text-[#444]">{request.messagePreview}</p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {request.telHref ? (
                    <a
                      href={request.telHref}
                      className={cn(
                        buttonVariants({ variant: 'adminOutline', size: 'admin' }),
                        'inline-flex h-8 items-center gap-1.5 px-3 text-[10px] no-underline',
                      )}
                    >
                      <Phone size={14} aria-hidden="true" />
                      Call
                    </a>
                  ) : null}
                  {request.mailHref ? (
                    <a
                      href={request.mailHref}
                      className={cn(
                        buttonVariants({ variant: 'adminOutline', size: 'admin' }),
                        'inline-flex h-8 items-center gap-1.5 px-3 text-[10px] no-underline',
                      )}
                    >
                      <Mail size={14} aria-hidden="true" />
                      Email
                    </a>
                  ) : null}
                </div>

                <AdminOutlineButton className="gap-1.5" onClick={() => openRequest(request)}>
                  <Eye size={16} aria-hidden="true" />
                  View details
                </AdminOutlineButton>
              </div>
            </motion.article>
          ))}

          {!loading && filteredRequests.length === 0 ? (
            <AdminEmptyState className="border-0">
              No support requests match your search or filter.
            </AdminEmptyState>
          ) : null}
        </div>
      </AdminPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="flex items-start gap-3 border border-[#e5e5e5] bg-white p-4">
          <Headphones size={20} className="shrink-0 text-[#1a1a1a]" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm text-[#1a1a1a]">Support hotline</strong>
            <a href="tel:+918080808964" className="text-sm font-semibold text-[#1a1a1a] hover:underline">
              8080808964
            </a>
            <span className="text-xs text-[#888]">Mon–Sat, 9am – 7pm IST</span>
          </div>
        </article>
        <article className="flex items-start gap-3 border border-[#e5e5e5] bg-white p-4">
          <Mail size={20} className="shrink-0 text-[#1a1a1a]" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm text-[#1a1a1a]">Support email</strong>
            <a href="mailto:support@nuevorental.com" className="text-sm font-semibold text-[#1a1a1a] hover:underline">
              support@nuevorental.com
            </a>
            <span className="text-xs text-[#888]">Replies within 24 hours</span>
          </div>
        </article>
      </div>

      <SupportRequestDetailModal
        request={selectedRequest ? { ...selectedRequest, adminNotes: notesDraft } : null}
        onClose={() => {
          setSelectedRequest(null)
          setNotesDraft('')
        }}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
      />
    </AdminPage>
  )
}

export default AdminSupportPage
