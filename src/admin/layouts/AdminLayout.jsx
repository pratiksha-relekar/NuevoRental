import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { AppSidebar } from '../components/AppSidebar'
import { AdminHeader } from '../components/AdminHeader'
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar'
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
    <SidebarProvider defaultOpen>
      <AppSidebar onLogout={handleLogout} />
      <SidebarInset>
        <AdminHeader admin={admin} onLogout={handleLogout} />

        <div className="admin-inset-content">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
