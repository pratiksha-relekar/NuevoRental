import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FirebaseProvider } from './context/FirebaseContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CatalogProvider } from './context/CatalogContext'
import { AuthProvider } from './context/AuthContext'
import { CartWishlistProvider } from './context/CartWishlistContext'
import { KycProvider } from './context/KycContext'
import { OrdersProvider } from './context/OrdersContext'
import SiteLayout from './layouts/SiteLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import KycPage from './pages/KycPage'
import PricingPage from './pages/PricingPage'
import SupportPage from './pages/SupportPage'
import CorporatePage from './pages/CorporatePage'
import LocationsPage from './pages/LocationsPage'
import RentProductsPage from './pages/RentProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import SearchResultsPage from './pages/SearchResultsPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { adminRoutes } from './admin/routes'
import './App.css'

function App() {
  return (
    <FirebaseProvider>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
        <CatalogProvider>
        <KycProvider>
        <OrdersProvider>
        <CartWishlistProvider>
        <Routes>
          {adminRoutes}

          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="kyc" element={<KycPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="corporate" element={<CorporatePage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="rent-products" element={<RentProductsPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
          </Route>
        </Routes>
        </CartWishlistProvider>
        </OrdersProvider>
        </KycProvider>
        </CatalogProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
    </FirebaseProvider>
  )
}

export default App
