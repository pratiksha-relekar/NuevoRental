import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  BadgeCheck,
  Clock3,
  Eye,
  FileImage,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  XCircle,
} from 'lucide-react'
import {
  approveUserKyc,
  getAdminKycStats,
  getAdminKycUserByEmail,
  loadAdminKycUserDetail,
  loadAdminKycUsers,
  rejectUserKyc,
} from '../../data/kycStorage'
import { formatKycStatus } from '../../data/userStorage'
import { KycReviewModal } from '../components/KycReviewModal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
const FILTER_TABS = [
  { id: 'all', label: 'All users' },
  { id: 'in_review', label: 'Awaiting review' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'approved', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'not_started', label: 'Not started' },
]

function StatCard({ icon: Icon, label, value, note, tone, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      className={`admin-kyc-stat-card admin-kyc-stat-card--${tone}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <span className="admin-kyc-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <span className="admin-kyc-stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </motion.article>
  )
}

function AdminKycPage() {
  const reduceMotion = useReducedMotion()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const nextUsers = await loadAdminKycUsers()
      setUsers(nextUsers)
      if (selectedUser) {
        const refreshed = await getAdminKycUserByEmail(selectedUser.email, nextUsers)
        setSelectedUser(refreshed)
      }
    } catch (error) {
      setUsers([])
      setLoadError(error?.message || 'Could not load KYC records from Firestore.')
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  useEffect(() => {
    void refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => getAdminKycStats(users), [users])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      if (activeFilter !== 'all' && user.kycStatus !== activeFilter) return false
      if (!query) return true

      const haystack = [
        user.displayName,
        user.email,
        user.phone,
        user.location,
        user.kycStatusLabel,
        user.provider,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, search, activeFilter])

  const openReview = async (user) => {
    setSelectedUser(user)
    setReviewLoading(true)
    try {
      const fresh = await loadAdminKycUserDetail(user.email)
      if (fresh) {
        setSelectedUser(fresh)
      }
    } finally {
      setReviewLoading(false)
    }
  }

  const handleApprove = async (user) => {
    const confirmed = window.confirm(
      `Approve KYC for ${user.displayName}? This will verify their identity and confirm ${user.pendingOrderCount} pending rental order${user.pendingOrderCount === 1 ? '' : 's'}.`,
    )
    if (!confirmed) return

    await approveUserKyc(user.email)
    await refresh()
  }

  const handleReject = async (user) => {
    const reason = window.prompt(
      `Reject KYC for ${user.displayName}? Enter a reason for the customer (optional):`,
      user.kyc.rejectionReason || '',
    )
    if (reason === null) return

    await rejectUserKyc(user.email, reason)
    await refresh()
  }

  return (
    <div className="admin-kyc-page">
      <header className="admin-kyc-page-head">
        <div>
          <h1>KYC Verifications</h1>
          <p>
            Review registered customers, compare Aadhaar/PAN uploads with OCR data, and approve identity
            before confirming rental orders on Nuevo Rental.
          </p>
          {loadError && (
            <Alert className="admin-kyc-load-error">
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}
        </div>
        <Button type="button" className="admin-kyc-refresh-btn" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh queue'}
        </Button>
      </header>

      <div className="admin-kyc-stat-grid">
        <StatCard icon={Users} label="Registered users" value={stats.total} note="all rental accounts" tone="blue" delay={0} />
        <StatCard icon={Clock3} label="Awaiting review" value={stats.awaitingReview} note="submitted for admin approval" tone="amber" delay={0.05} />
        <StatCard icon={BadgeCheck} label="Verified" value={stats.verified} note="KYC approved by admin" tone="green" delay={0.1} />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} note="needs re-submission" tone="pink" delay={0.15} />
        <StatCard icon={ShoppingBag} label="Pending orders" value={stats.withPendingOrders} note="orders waiting on KYC" tone="purple" delay={0.2} />
      </div>

      <section className="admin-kyc-panel">
        <div className="admin-kyc-panel-head">
          <div>
            <h2>Identity verification queue</h2>
            <p>
              {loading
                ? 'Loading KYC records...'
                : `${filteredUsers.length} matching user${filteredUsers.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <div className="admin-kyc-toolbar">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="admin-kyc-tabs">
              {FILTER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`admin-kyc-tab${activeFilter === tab.id ? ' is-active' : ''}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <label className="admin-kyc-search">
            <Search size={16} aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or city"
            />
          </label>
        </div>

        <div className="admin-kyc-table-wrap">
          <Table className="admin-kyc-table">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>OCR details</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>KYC status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.email}
                  className={user.needsReview ? 'is-review-priority' : ''}
                >
                  <TableCell>
                    <div className="admin-kyc-user-cell">
                      <span className="admin-kyc-avatar" aria-hidden="true">
                        {user.initials}
                        {user.isOnline && <span className="admin-kyc-online-dot" />}
                      </span>
                      <div className="admin-kyc-user-info">
                        <strong>
                          {user.displayName}
                          {user.kycStatus === 'approved' && (
                            <BadgeCheck className="admin-kyc-verified-icon" size={14} aria-label="Verified" />
                          )}
                        </strong>
                        <span className="admin-kyc-user-email">{user.email}</span>
                        {user.phone && <em className="admin-kyc-user-phone">{user.phone}</em>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="admin-kyc-docs-cell">
                      <span className={user.kyc.documents.hasAadhaar ? 'is-uploaded' : ''}>
                        <FileImage size={13} aria-hidden="true" />
                        Aadhaar {user.kyc.documents.hasAadhaar ? '✓' : '—'}
                      </span>
                      <span className={user.kyc.documents.hasPan ? 'is-uploaded' : ''}>
                        <FileImage size={13} aria-hidden="true" />
                        PAN {user.kyc.documents.hasPan ? '✓' : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.kyc.ocrData ? (
                      <div className="admin-kyc-ocr-cell">
                        <strong>{user.kyc.ocrData.name || '—'}</strong>
                        <span>{user.kyc.ocrData.aadhaar || '—'}</span>
                        <span>{user.kyc.ocrData.pan || '—'}</span>
                      </div>
                    ) : (
                      <em className="admin-kyc-muted">Not extracted</em>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="admin-kyc-orders-cell">
                      <strong>{user.orderCount}</strong>
                      {user.pendingOrderCount > 0 && (
                        <span className="admin-kyc-pending-orders">
                          {user.pendingOrderCount} awaiting KYC
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`admin-kyc-status admin-kyc-status--${user.kycStatus}`}>
                      <ShieldCheck size={12} aria-hidden="true" />
                      {formatKycStatus(user.kycStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.kyc.submittedLabel}</TableCell>
                  <TableCell>
                    <div className="admin-kyc-actions-cell">
                      <Button
                        type="button"
                        className="admin-kyc-review-btn"
                        onClick={() => void openReview(user)}
                      >
                        <Eye size={15} aria-hidden="true" />
                        Review
                      </Button>
                      {user.canReview && (
                        <>
                          <Button
                            type="button"
                            className="admin-kyc-quick-btn admin-kyc-quick-btn--approve"
                            onClick={() => void handleApprove(user)}
                            disabled={!user.hasDocuments}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="admin-kyc-quick-btn admin-kyc-quick-btn--reject"
                            onClick={() => void handleReject(user)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredUsers.length === 0 && (
            <p className="admin-kyc-empty">No users match your search or filter.</p>
          )}
        </div>

        <div className="admin-kyc-cards">
          {filteredUsers.map((user, index) => (
            <motion.article
              key={user.email}
              className={`admin-kyc-card${user.needsReview ? ' admin-kyc-card--priority' : ''}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="admin-kyc-card-top">
                <div className="admin-kyc-user-cell">
                  <span className="admin-kyc-avatar" aria-hidden="true">{user.initials}</span>
                  <div className="admin-kyc-user-info">
                    <strong>{user.displayName}</strong>
                    <span className="admin-kyc-user-email">{user.email}</span>
                  </div>
                </div>
                <Badge className={`admin-kyc-status admin-kyc-status--${user.kycStatus}`}>
                  {formatKycStatus(user.kycStatus)}
                </Badge>
              </div>
              <div className="admin-kyc-card-meta">
                <span>{user.kyc.documents.hasAadhaar && user.kyc.documents.hasPan ? 'Docs uploaded' : 'Docs incomplete'}</span>
                <span>{user.orderCount} orders</span>
                {user.pendingOrderCount > 0 && <span>{user.pendingOrderCount} pending</span>}
              </div>
              <Button type="button" className="admin-kyc-review-btn" onClick={() => openReview(user)}>
                <Eye size={15} aria-hidden="true" />
                Review KYC
              </Button>
            </motion.article>
          ))}
        </div>
      </section>

      <KycReviewModal
        user={selectedUser}
        loading={reviewLoading}
        onClose={() => setSelectedUser(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}

export default AdminKycPage
