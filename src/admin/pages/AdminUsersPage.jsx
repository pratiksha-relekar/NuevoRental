import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  CircleUserRound,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  Wifi,
} from 'lucide-react'
import {
  deleteRegisteredUser,
  fetchAdminUsers,
  formatKycStatus,
  getAdminUserStats,
} from '../../data/userStorage'
import { UserDetailModal } from '../components/UserDetailModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSearchField,
  AdminStatCard,
  AdminStatusBadge,
  AdminIconButton,
  AdminToolbar,
  adminSelectTriggerClass,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'

function getKycTone(status) {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'in_review') return 'info'
  if (status === 'rejected') return 'danger'
  return 'neutral'
}

function AdminUsersPage() {
  const [version, setVersion] = useState(0)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    let active = true

    async function loadUsers() {
      setLoading(true)
      try {
        const nextUsers = await fetchAdminUsers()
        if (active) {
          setUsers(nextUsers)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [version])

  const stats = useMemo(() => getAdminUserStats(users), [users])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      if (providerFilter !== 'all' && user.provider !== providerFilter) return false
      if (kycFilter !== 'all' && user.kycStatus !== kycFilter) return false
      if (!query) return true

      const haystack = [
        user.displayName,
        user.email,
        user.phone,
        user.location,
        user.provider,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [users, search, providerFilter, kycFilter])

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete account for ${user.displayName}? This removes their orders and KYC data.`)
    if (!confirmed) return
    await deleteRegisteredUser(user.email)
    setVersion((current) => current + 1)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Users"
        description="View registered rental customers, active sessions, KYC status, and order activity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          icon={Users}
          label="Total users"
          value={stats.totalUsers}
          note="registered rental accounts"
        />
        <AdminStatCard
          icon={ShoppingBag}
          label="Active renters"
          value={stats.activeRenters}
          note={`${stats.renterPercent}% placed orders`}
        />
        <AdminStatCard
          icon={ShieldCheck}
          label="KYC verified"
          value={stats.kycVerified}
          note="identity approved"
        />
        <AdminStatCard
          icon={Wifi}
          label="Online now"
          value={stats.onlineNow}
          note={`${stats.emailUsers} email · ${stats.googleUsers} Google`}
        />
      </div>

      <AdminPanel>
        <div className="border-b border-[#e5e5e5] p-4">
          <h2 className="text-sm font-bold tracking-wide text-[#1a1a1a] uppercase">Registered accounts</h2>
          <p className="mt-1 text-sm text-[#666]">
            {loading
              ? 'Loading users…'
              : `${filteredUsers.length} matching account${filteredUsers.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <AdminToolbar className="lg:justify-start">
          <AdminSearchField
            icon={Search}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone or city"
          />

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full sm:w-[160px]')} aria-label="Filter by sign-in provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>

          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full sm:w-[160px]')} aria-label="Filter by KYC status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC status</SelectItem>
              <SelectItem value="approved">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="not_started">Not started</SelectItem>
            </SelectContent>
          </Select>
        </AdminToolbar>

        <div className={adminTableWrapClass}>
          <Table className={adminTableClass}>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.email} className={cn(user.isOnline && 'bg-[#f8fff9]')}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="relative inline-flex size-9 shrink-0 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]"
                        aria-hidden="true"
                      >
                        {user.initials}
                        {user.isOnline && (
                          <span
                            className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-[#22c55e]"
                            title="Logged in now"
                          />
                        )}
                      </span>
                      <div>
                        <strong className="inline-flex items-center gap-1 text-sm text-[#1a1a1a]">
                          {user.displayName}
                          {user.kycStatus === 'approved' && (
                            <BadgeCheck className="text-[#1f6b3a]" size={14} aria-label="KYC verified" />
                          )}
                        </strong>
                        <span className="block text-xs text-[#888]">{user.email}</span>
                        {user.isOnline && (
                          <em className="text-[11px] not-italic text-[#1f6b3a]">Active session</em>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={user.role === 'renter' ? 'info' : 'neutral'}>
                      {user.role === 'renter' ? 'Renter' : 'Customer'}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={user.provider === 'google' ? 'info' : 'neutral'}>
                      {user.provider === 'google' ? 'Google' : 'Email'}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#444]">
                      <Phone size={13} aria-hidden="true" />
                      {user.phone || <em className="text-[#aaa]">No phone</em>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#444]">
                      <MapPin size={13} aria-hidden="true" />
                      {user.location || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#444]">
                      <Package size={13} aria-hidden="true" />
                      {user.orderCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge tone={getKycTone(user.kycStatus)}>
                      {formatKycStatus(user.kycStatus)}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell>{user.joinedLabel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <AdminIconButton
                        aria-label={`View ${user.displayName}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <CircleUserRound size={16} />
                      </AdminIconButton>
                      <AdminIconButton
                        danger
                        aria-label={`Delete ${user.displayName}`}
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 size={16} />
                      </AdminIconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <AdminEmptyState>No users match your search or filters.</AdminEmptyState>
          )}
        </div>
      </AdminPanel>

      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </AdminPage>
  )
}

export default AdminUsersPage
