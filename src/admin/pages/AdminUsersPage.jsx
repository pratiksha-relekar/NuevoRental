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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <Card className={`admin-users-stat-card admin-users-stat-card--${tone}`}>
      <span className="admin-users-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <span className="admin-users-stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </Card>
  )
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
    <div className="admin-users-page">
      <header className="admin-users-page-head">
        <div>
          <h1>Users</h1>
          <p>View registered rental customers, active sessions, KYC status, and order activity.</p>
        </div>
      </header>

      <div className="admin-users-stat-grid">
        <StatCard
          icon={Users}
          label="Total users"
          value={stats.totalUsers}
          note="registered rental accounts"
          tone="blue"
        />
        <StatCard
          icon={ShoppingBag}
          label="Active renters"
          value={stats.activeRenters}
          note={`${stats.renterPercent}% placed orders`}
          tone="purple"
        />
        <StatCard
          icon={ShieldCheck}
          label="KYC verified"
          value={stats.kycVerified}
          note="identity approved"
          tone="green"
        />
        <StatCard
          icon={Wifi}
          label="Online now"
          value={stats.onlineNow}
          note={`${stats.emailUsers} email · ${stats.googleUsers} Google`}
          tone="amber"
        />
      </div>

      <section className="admin-users-panel">
        <div className="admin-users-panel-head">
          <div>
            <h2>Registered accounts</h2>
            <p>{filteredUsers.length} matching account{filteredUsers.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="admin-users-toolbar">
          <label className="admin-users-search">
            <Search size={16} aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or city"
            />
          </label>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="admin-users-filter" aria-label="Filter by sign-in provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>

          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="admin-users-filter" aria-label="Filter by KYC status">
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
        </div>

        <div className="admin-users-table-wrap">
          <Table className="admin-users-table">
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
                <TableRow key={user.email} className={user.isOnline ? 'is-online' : ''}>
                  <TableCell>
                    <div className="admin-users-user-cell">
                      <span className="admin-users-avatar" aria-hidden="true">
                        {user.initials}
                        {user.isOnline && <span className="admin-users-online-dot" title="Logged in now" />}
                      </span>
                      <div className="admin-users-user-info">
                        <strong>
                          {user.displayName}
                          {user.kycStatus === 'approved' && (
                            <BadgeCheck className="admin-users-verified-icon" size={14} aria-label="KYC verified" />
                          )}
                        </strong>
                        <span className="admin-users-user-email">{user.email}</span>
                        {user.isOnline && <em className="admin-users-online-label">Active session</em>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`admin-users-role admin-users-role--${user.role}`}>
                      {user.role === 'renter' ? 'Renter' : 'Customer'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`admin-users-provider admin-users-provider--${user.provider}`}>
                      {user.provider === 'google' ? 'Google' : 'Email'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="admin-users-contact">
                      <Phone size={13} aria-hidden="true" />
                      {user.phone || <em>No phone</em>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="admin-users-location">
                      <MapPin size={13} aria-hidden="true" />
                      {user.location || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="admin-users-orders">
                      <Package size={13} aria-hidden="true" />
                      {user.orderCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`admin-users-kyc admin-users-kyc--${user.kycStatus}`}>
                      {formatKycStatus(user.kycStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedLabel}</TableCell>
                  <TableCell>
                    <div className="admin-users-row-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="admin-users-icon-btn"
                        aria-label={`View ${user.displayName}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <CircleUserRound size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="admin-users-icon-btn admin-users-icon-btn--danger"
                        aria-label={`Delete ${user.displayName}`}
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <p className="admin-users-empty">No users match your search or filters.</p>
          )}
        </div>
      </section>

      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}

export default AdminUsersPage
