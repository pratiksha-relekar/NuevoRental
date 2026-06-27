import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { AppSidebar } from '../components/AppSidebar'
import { AdminHeader } from '../components/AdminHeader'
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

function AdminLayout() {
  const navigate = useNavigate()
  const { admin, isAdminAuthenticated, logout } = useAdminAuth()

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login', { replace: true })
    }
  }, [isAdminAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  if (!admin) return null

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen>
        <AppSidebar onLogout={handleLogout} />
        <SidebarInset className="bg-[#ececec]">
          <AdminHeader admin={admin} onLogout={handleLogout} />

          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default AdminLayout
