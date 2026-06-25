import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useCatalog } from '../../context/CatalogContext'
import { useWeeklyOffers } from '../../context/WeeklyOffersContext'
import { getPendingKycReviewCount, fetchPendingKycReviewCount } from '../../data/kycStorage'
import { fetchOpenSupportCount, getOpenSupportCount } from '../../data/supportStorage'
import { fetchAdminUsers } from '../../data/userStorage'
import { loadAdminOrders } from '../../data/orderStorage'
import { loadAdminInvoices } from '../../data/invoiceStorage'
import { cn } from '../../lib/utils'
import BrandLogo from '../../components/BrandLogo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../components/ui/sidebar'

function loadSupportCount() {
  return getOpenSupportCount()
}

function getInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  )
}

export function AppSidebar({ onLogout }) {
  const { admin } = useAdminAuth()
  const { products } = useCatalog()
  const { deals: weeklyOffers } = useWeeklyOffers()
  const { setOpenMobile, isMobile } = useSidebar()
  const [stats, setStats] = useState({
    products: products.length,
    users: 0,
    orders: 0,
    invoices: 0,
    kyc: getPendingKycReviewCount(),
    support: loadSupportCount(),
  })

  useEffect(() => {
    if (!admin) return undefined

    let active = true

    async function loadStats() {
      try {
        const users = await fetchAdminUsers()
        const orders = loadAdminOrders()

        if (!active) return

        setStats({
          products: products.length,
          users: users.length,
          orders: orders.length,
          invoices: loadAdminInvoices().length,
          kyc: await fetchPendingKycReviewCount(),
          support: await fetchOpenSupportCount(),
        })
      } catch {
        if (active) {
          setStats((current) => ({
            ...current,
            products: products.length,
            kyc: getPendingKycReviewCount(),
            support: loadSupportCount(),
          }))
        }
      }
    }

    loadStats()
    return () => {
      active = false
    }
  }, [admin, products.length])

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="sidebar-brand">
          <BrandLogo variant="sidebar" to="/admin/dashboard" className="sidebar-brand-logo-image" />
          <div className="sidebar-brand-text">
            <strong>Nuevo Admin</strong>
            <span>Control Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink
                  to="/admin/dashboard"
                  end
                  title="Dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink
                  to="/admin/products"
                  title="Products"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Package />
                  <span>Products</span>
                </NavLink>
                <SidebarMenuBadge>{stats.products}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/users"
                  title="Users"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Users />
                  <span>Users</span>
                </NavLink>
                <SidebarMenuBadge>{stats.users}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/orders"
                  title="Orders"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <ShoppingBag />
                  <span>Orders</span>
                </NavLink>
                <SidebarMenuBadge>{stats.orders}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/invoices"
                  title="Invoices"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <FileText />
                  <span>Invoices</span>
                </NavLink>
                <SidebarMenuBadge>{stats.invoices}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/kyc"
                  title="KYC"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <ShieldCheck />
                  <span>KYC</span>
                </NavLink>
                {stats.kyc > 0 && <SidebarMenuBadge>{stats.kyc}</SidebarMenuBadge>}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Website</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink
                  to="/admin/content"
                  title="Content"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Globe />
                  <span>Content</span>
                </NavLink>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/weekly-offers"
                  title="Weekly Offers"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Percent />
                  <span>Weekly Offers</span>
                </NavLink>
                <SidebarMenuBadge>{weeklyOffers.length}</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/support"
                  title="Support"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Headphones />
                  <span>Support</span>
                </NavLink>
                {stats.support > 0 && <SidebarMenuBadge>{stats.support}</SidebarMenuBadge>}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <NavLink
                  to="/admin/settings"
                  title="Settings"
                  onClick={closeMobile}
                  className={({ isActive }) => cn('sidebar-menu-button', isActive && 'is-active')}
                >
                  <Settings />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="sidebar-footer-user">
          <span className="sidebar-footer-avatar" aria-hidden="true">
            {getInitials(admin?.displayName ?? 'Admin')}
          </span>
          <div className="sidebar-footer-user-meta">
            <strong>{admin?.displayName}</strong>
            <span>{admin?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" title="View website" onClick={closeMobile}>
                <ExternalLink />
                <span>View website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="sidebar-menu-button--danger"
              title="Logout"
              onClick={() => {
                closeMobile()
                onLogout()
              }}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
