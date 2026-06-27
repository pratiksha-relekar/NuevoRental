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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
const FILTER_TABS = [
  { id: 'all', label: 'All requests' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
]

function StatCard({ icon: Icon, label, value, note, tone, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      className={`admin-support-stat-card admin-support-stat-card--${tone}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <span className="admin-support-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <span className="admin-support-stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </motion.article>
  )
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
      <div className="admin-support-page">
        <header className="admin-support-page-head">
          <div>
            <h1>Support & inquiries</h1>
            <p>You do not have permission to manage support requests. Contact a super admin to enable the manage_support privilege.</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="admin-support-page">
      <header className="admin-support-page-head">
        <div>
          <h1>Support & inquiries</h1>
          <p>
            Review contact form submissions, call requesting customers, and resolve rental support
            tickets from the Nuevo Rental website.
          </p>
          {loadError && (
            <Alert className="admin-support-load-error">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      {stats.urgent > 0 && (
        <motion.aside
          className="admin-support-alert"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Alert className="admin-support-alert-copy border-0 bg-transparent p-0 shadow-none">
            <AlertCircle size={22} aria-hidden="true" />
            <div>
              <AlertTitle>
                {stats.urgent} urgent support request{stats.urgent === 1 ? '' : 's'} need attention
              </AlertTitle>
              <AlertDescription>
                Technical support and delivery inquiries are waiting for a callback. Review details
                and contact customers directly from each ticket.
              </AlertDescription>
            </div>
          </Alert>
          <Button
            type="button"
            className="admin-support-alert-btn"
            onClick={() => setActiveFilter('open')}
          >
            View open tickets
          </Button>
        </motion.aside>
      )}

      <div className="admin-support-stat-grid">
        <StatCard icon={Ticket} label="Total requests" value={stats.total} note="all support inquiries" tone="blue" delay={0} />
        <StatCard icon={MessageSquare} label="Open tickets" value={stats.open} note="awaiting admin response" tone="amber" delay={0.05} />
        <StatCard icon={Clock3} label="In progress" value={stats.inProgress} note="active follow-ups" tone="purple" delay={0.1} />
        <StatCard icon={CheckCircle2} label="Resolved today" value={stats.resolvedToday} note={`${stats.resolved} total closed`} tone="green" delay={0.15} />
      </div>

      <section className="admin-support-panel">
        <div className="admin-support-panel-head">
          <div>
            <h2>Customer support requests</h2>
            <p>
              {loading
                ? 'Loading support requests...'
                : `${filteredRequests.length} matching ticket${filteredRequests.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link to="/contact" target="_blank" rel="noreferrer" className="admin-support-contact-link">
            View contact page
          </Link>
        </div>

        <div className="admin-support-toolbar">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="admin-support-tabs">
              {FILTER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`admin-support-tab${activeFilter === tab.id ? ' is-active' : ''}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <label className="admin-support-search">
            <Search size={16} aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, ticket ID or message"
            />
          </label>
        </div>

        <div className="admin-support-list">
          {filteredRequests.map((request, index) => (
            <motion.article
              key={request.id}
              className={`admin-support-card admin-support-card--${request.status}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="admin-support-card-top">
                <div className="admin-support-card-customer">
                  <span className="admin-support-card-avatar" aria-hidden="true">
                    {request.initials}
                  </span>
                  <div className="admin-support-card-user-info">
                    <span className="admin-support-card-id">{request.id}</span>
                    <h3>{request.name}</h3>
                    <p>{request.email}</p>
                  </div>
                </div>
                <Badge className={`admin-support-status admin-support-status--${request.status}`}>
                  {request.statusLabel}
                </Badge>
              </div>

              <div className="admin-support-card-meta">
                <Badge className={`admin-support-topic admin-support-topic--${request.topic}`}>
                  {request.topicLabel}
                </Badge>
                <span>{request.createdLabel}</span>
                {request.isRegisteredUser && (
                  <span className="admin-support-registered">Registered · {request.userOrderCount} orders</span>
                )}
              </div>

              <p className="admin-support-card-message">{request.messagePreview}</p>

              <div className="admin-support-card-actions">
                <div className="admin-support-quick-actions">
                  {request.telHref && (
                    <a href={request.telHref} className="admin-support-quick-btn admin-support-quick-btn--call">
                      <Phone size={14} aria-hidden="true" />
                      Call
                    </a>
                  )}
                  {request.mailHref && (
                    <a href={request.mailHref} className="admin-support-quick-btn">
                      <Mail size={14} aria-hidden="true" />
                      Email
                    </a>
                  )}
                </div>

                <Button
                  type="button"
                  className="admin-support-view-btn"
                  onClick={() => openRequest(request)}
                >
                  <Eye size={16} aria-hidden="true" />
                  View details
                </Button>
              </div>
            </motion.article>
          ))}

          {!loading && filteredRequests.length === 0 && (
            <p className="admin-support-empty">No support requests match your search or filter.</p>
          )}
        </div>
      </section>

      <section className="admin-support-channels">
        <article className="admin-support-channel-card">
          <Headphones size={20} aria-hidden="true" />
          <div>
            <strong>Support hotline</strong>
            <a href="tel:+918080808964">8080808964</a>
            <span>Mon–Sat, 9am – 7pm IST</span>
          </div>
        </article>
        <article className="admin-support-channel-card">
          <Mail size={20} aria-hidden="true" />
          <div>
            <strong>Support email</strong>
            <a href="mailto:support@nuevorental.com">support@nuevorental.com</a>
            <span>Replies within 24 hours</span>
          </div>
        </article>
      </section>

      <SupportRequestDetailModal
        request={selectedRequest ? { ...selectedRequest, adminNotes: notesDraft } : null}
        onClose={() => {
          setSelectedRequest(null)
          setNotesDraft('')
        }}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
      />
    </div>
  )
}

export default AdminSupportPage
