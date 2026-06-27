import { useEffect, useState } from 'react'
import { Link, NavLink, useMatch, useResolvedPath } from 'react-router-dom'
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
  SidebarRail,
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

function SidebarNavItem({ to, end = false, title, icon: Icon, badge, onNavigate }) {
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end })
  const isActive = Boolean(match)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive: navActive }) =>
              cn(
                navActive &&
                  'bg-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:text-white [&_svg]:text-white [&_span]:text-white',
              )
            }
          />
        }
        isActive={isActive}
        tooltip={title}
        className="rounded-none text-[#1a1a1a] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] [&_svg]:text-[#1a1a1a] hover:[&_svg]:text-[#1a1a1a]"
      >
        <Icon />
        <span>{title}</span>
      </SidebarMenuButton>
      {badge != null && badge > 0 ? (
        <SidebarMenuBadge
          className={cn(
            'rounded-none text-[10px] font-bold leading-none',
            isActive
              ? 'border border-white/35 bg-white text-[#1a1a1a]'
              : 'bg-[#1a1a1a] text-white',
          )}
        >
          {badge}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
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
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <BrandLogo variant="sidebar" to="/admin/dashboard" className="shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <strong className="block text-sm text-[#1a1a1a]">Nuevo Admin</strong>
            <span className="block text-[11px] text-[#888]">Control Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem
                to="/admin/dashboard"
                end
                title="Dashboard"
                icon={LayoutDashboard}
                onNavigate={closeMobile}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem to="/admin/products" title="Products" icon={Package} badge={stats.products} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/users" title="Users" icon={Users} badge={stats.users} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/orders" title="Orders" icon={ShoppingBag} badge={stats.orders} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/invoices" title="Invoices" icon={FileText} badge={stats.invoices} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/kyc" title="KYC" icon={ShieldCheck} badge={stats.kyc} onNavigate={closeMobile} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Website</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavItem to="/admin/content" title="Content" icon={Globe} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/weekly-offers" title="Weekly Offers" icon={Percent} badge={weeklyOffers.length} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/support" title="Support" icon={Headphones} badge={stats.support} onNavigate={closeMobile} />
              <SidebarNavItem to="/admin/settings" title="Settings" icon={Settings} onNavigate={closeMobile} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="mb-1 flex items-center gap-2.5 border border-sidebar-border bg-sidebar-accent/40 p-2 group-data-[collapsible=icon]:hidden">
          <span
            className="inline-flex size-[34px] shrink-0 items-center justify-center bg-[#1a1a1a] text-xs font-bold text-white"
            aria-hidden="true"
          >
            {getInitials(admin?.displayName ?? 'Admin')}
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-[13px] text-[#1a1a1a]">{admin?.displayName}</strong>
            <span className="block truncate text-[11px] capitalize text-[#888]">
              {admin?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/" onClick={closeMobile} />}
              tooltip="View website"
              className="rounded-none text-[#1a1a1a] hover:bg-[#f5f5f5] [&_svg]:text-[#1a1a1a]"
            >
              <ExternalLink />
              <span>View website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive [&_svg]:text-destructive"
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

      <SidebarRail />
    </Sidebar>
  )
}
