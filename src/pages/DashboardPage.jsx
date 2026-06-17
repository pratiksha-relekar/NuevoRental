import { Link } from 'react-router-dom'
import '../styles/pageAnimations.css'
import './DashboardPage.css'

const DASHBOARD_SECTIONS = [
  { title: 'My Orders', description: 'View active and past rental orders.', to: '/dashboard' },
  { title: 'Payments & Invoices', description: 'Track payments and download GST invoices.', to: '/dashboard' },
  { title: 'KYC Status', description: 'Check verification status and upload documents.', to: '/kyc' },
  { title: 'Support Tickets', description: 'Raise and follow up on support requests.', to: '/support' },
  { title: 'Upgrade / Extend Rental', description: 'Extend duration or upgrade your device plan.', to: '/dashboard' },
  { title: 'Schedule Pickup', description: 'Book doorstep pickup when your rental ends.', to: '/dashboard' },
]

function DashboardPage() {
  return (
    <section className="page-section dashboard-page" aria-labelledby="dashboard-heading">
      <div className="page-section-inner">
        <header className="dashboard-header">
          <span className="page-eyebrow">Customer Portal</span>
          <h1 id="dashboard-heading" className="page-title">Dashboard Welcome</h1>
          <p className="page-lead">
            Welcome to your Nuevo Rental dashboard. Manage orders, payments, KYC, and support easily.
          </p>
        </header>

        <div className="dashboard-grid">
          {DASHBOARD_SECTIONS.map((section) => (
            <Link key={section.title} to={section.to} className="dashboard-card page-animate-item">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <span className="dashboard-card-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
