import { Navigate, Route } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminInvoicesPage from './pages/AdminInvoicesPage'
import AdminKycPage from './pages/AdminKycPage'
import AdminContentPage from './pages/AdminContentPage'
import AdminWeeklyOffersPage from './pages/AdminWeeklyOffersPage'
import AdminSupportPage from './pages/AdminSupportPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

export const adminRoutes = (
  <>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="invoices" element={<AdminInvoicesPage />} />
      <Route path="kyc" element={<AdminKycPage />} />
      <Route path="content" element={<AdminContentPage />} />
      <Route path="weekly-offers" element={<AdminWeeklyOffersPage />} />
      <Route path="support" element={<AdminSupportPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>
  </>
)
