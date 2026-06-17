import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import TrackOrderPage from './pages/TrackOrderPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="track-order" element={<TrackOrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
