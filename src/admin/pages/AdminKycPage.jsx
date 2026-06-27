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
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
  { id: 'all', label: 'All users' },
  { id: 'in_review', label: 'Awaiting review' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'approved', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'not_started', label: 'Not started' },
]

function kycStatusTone(status) {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'in_review':
      return 'warning'
    case 'in_progress':
      return 'info'
    default:
      return 'neutral'
  }
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
    <AdminPage>
      <AdminPageHeader
        title="KYC Verifications"
        description="Review registered customers, compare Aadhaar/PAN uploads with OCR data, and approve identity before confirming rental orders on Nuevo Rental."
        actions={
          <AdminPrimaryButton onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh queue'}
          </AdminPrimaryButton>
        }
      />

      {loadError ? (
        <Alert className="rounded-none border-[#f0caca] bg-[#fdf2f2] text-[#a94442]">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard icon={Users} label="Registered users" value={stats.total} note="all rental accounts" />
        <AdminStatCard icon={Clock3} label="Awaiting review" value={stats.awaitingReview} note="submitted for admin approval" />
        <AdminStatCard icon={BadgeCheck} label="Verified" value={stats.verified} note="KYC approved by admin" />
        <AdminStatCard icon={XCircle} label="Rejected" value={stats.rejected} note="needs re-submission" />
        <AdminStatCard icon={ShoppingBag} label="Pending orders" value={stats.withPendingOrders} note="orders waiting on KYC" />
      </div>

      <AdminPanel>
        <div className="border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Identity verification queue</h2>
          <p className="mt-1 text-sm text-[#666]">
            {loading
              ? 'Loading KYC records...'
              : `${filteredUsers.length} matching user${filteredUsers.length === 1 ? '' : 's'}`}
          </p>
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
            placeholder="Search name, email, phone or city"
          />
        </AdminToolbar>

        <div className={cn(adminTableWrapClass, 'hidden md:block')}>
          <Table className={adminTableClass}>
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
                  className={user.needsReview ? 'bg-[#fff8ea]' : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]">
                        {user.initials}
                        {user.isOnline ? (
                          <span className="absolute -right-0.5 -top-0.5 size-2.5 border-2 border-white bg-[#1f6b3a]" />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <strong className="flex items-center gap-1.5 text-sm text-[#1a1a1a]">
                          {user.displayName}
                          {user.kycStatus === 'approved' ? (
                            <BadgeCheck className="text-[#1f6b3a]" size={14} aria-label="Verified" />
                          ) : null}
                        </strong>
                        <span className="block truncate text-xs text-[#666]">{user.email}</span>
                        {user.phone ? <em className="block text-xs not-italic text-[#888]">{user.phone}</em> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-[#888]">
                      <span className={cn('flex items-center gap-1', user.kyc.documents.hasAadhaar && 'text-[#1f6b3a]')}>
                        <FileImage size={13} aria-hidden="true" />
                        Aadhaar {user.kyc.documents.hasAadhaar ? '✓' : '—'}
                      </span>
                      <span className={cn('flex items-center gap-1', user.kyc.documents.hasPan && 'text-[#1f6b3a]')}>
                        <FileImage size={13} aria-hidden="true" />
                        PAN {user.kyc.documents.hasPan ? '✓' : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.kyc.ocrData ? (
                      <div className="flex flex-col gap-0.5 text-xs">
                        <strong className="text-sm text-[#1a1a1a]">{user.kyc.ocrData.name || '—'}</strong>
                        <span className="text-[#666]">{user.kyc.ocrData.aadhaar || '—'}</span>
                        <span className="text-[#666]">{user.kyc.ocrData.pan || '—'}</span>
                      </div>
                    ) : (
                      <em className="text-xs not-italic text-[#999]">Not extracted</em>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-sm text-[#1a1a1a]">{user.orderCount}</strong>
                      {user.pendingOrderCount > 0 ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8a6200]">
                          {user.pendingOrderCount} awaiting KYC
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={kycStatusTone(user.kycStatus)}>
                      <ShieldCheck size={12} aria-hidden="true" />
                      {formatKycStatus(user.kycStatus)}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell>{user.kyc.submittedLabel}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminOutlineButton
                        className="h-8 gap-1.5 px-3 text-[10px]"
                        onClick={() => void openReview(user)}
                      >
                        <Eye size={15} aria-hidden="true" />
                        Review
                      </AdminOutlineButton>
                      {user.canReview ? (
                        <>
                          <Button
                            type="button"
                            className="h-8 rounded-none bg-[#1f6b3a] px-3 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-[#185a31]"
                            onClick={() => void handleApprove(user)}
                            disabled={!user.hasDocuments}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-none border-[#c0392b] bg-white px-3 text-[10px] font-semibold uppercase tracking-wide text-[#c0392b] hover:bg-[#c0392b] hover:text-white"
                            onClick={() => void handleReject(user)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!loading && filteredUsers.length === 0 ? (
            <AdminEmptyState>No users match your search or filter.</AdminEmptyState>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 p-4 md:hidden">
          {filteredUsers.map((user, index) => (
            <motion.article
              key={user.email}
              className={cn(
                'flex flex-col gap-3 border border-[#e5e5e5] bg-white p-4',
                user.needsReview && 'border-l-4 border-l-[#8a6200]',
              )}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]">
                    {user.initials}
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-sm text-[#1a1a1a]">{user.displayName}</strong>
                    <span className="block truncate text-xs text-[#666]">{user.email}</span>
                  </div>
                </div>
                <AdminStatusBadge tone={kycStatusTone(user.kycStatus)}>
                  {formatKycStatus(user.kycStatus)}
                </AdminStatusBadge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#666]">
                <span>
                  {user.kyc.documents.hasAadhaar && user.kyc.documents.hasPan ? 'Docs uploaded' : 'Docs incomplete'}
                </span>
                <span>{user.orderCount} orders</span>
                {user.pendingOrderCount > 0 ? <span>{user.pendingOrderCount} pending</span> : null}
              </div>
              <AdminOutlineButton className="w-full gap-1.5" onClick={() => openReview(user)}>
                <Eye size={15} aria-hidden="true" />
                Review KYC
              </AdminOutlineButton>
            </motion.article>
          ))}

          {!loading && filteredUsers.length === 0 ? (
            <AdminEmptyState className="border-0">No users match your search or filter.</AdminEmptyState>
          ) : null}
        </div>
      </AdminPanel>

      <KycReviewModal
        user={selectedUser}
        loading={reviewLoading}
        onClose={() => setSelectedUser(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminPage>
  )
}

export default AdminKycPage
