import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RentalAssuranceSection from '../components/RentalAssuranceSection'

function SiteLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="app">
      <Header />
      <main>
        <Outlet />
      </main>
      <RentalAssuranceSection />
      <Footer />
    </div>
  )
}

export default SiteLayout
