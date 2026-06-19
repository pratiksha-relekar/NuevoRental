import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink, LogOut, Settings, Shield } from 'lucide-react'
import { SidebarTrigger } from '../../components/ui/sidebar'
import './AdminHeader.css'

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

function formatRole(role) {
  if (!role) return 'Admin'
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function AdminHeader({ admin, onLogout }) {
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [popover, setPopover] = useState(null)

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPopover(null)
      return undefined
    }

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const panelWidth = Math.min(280, window.innerWidth - 24)

      setPopover({
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
        width: panelWidth,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('.admin-profile-popover')) return
      if (target.closest('.admin-profile-scrim')) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('admin-profile-open', open)
    return () => document.body.classList.remove('admin-profile-open')
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    onLogout()
  }

  return (
    <header className="admin-inset-header">
      <div className="admin-inset-header-main">
        <SidebarTrigger />
        <h1 className="admin-inset-title">Welcome to admin dashboard</h1>
      </div>

      <div className={`admin-profile${open ? ' is-open' : ''}`}>
        <button
          ref={triggerRef}
          type="button"
          className="admin-profile-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="admin-profile-avatar admin-profile-avatar--sm" aria-hidden="true">
            {getInitials(admin.displayName)}
          </span>
          <span className="admin-profile-trigger-text">
            <span className="admin-profile-greet">Hello,</span>
            <span className="admin-profile-name">{admin.displayName}</span>
          </span>
          <ChevronDown className="admin-profile-chevron" size={16} aria-hidden="true" />
        </button>

        {open && popover && createPortal(
          <>
            <button
              type="button"
              className="admin-profile-scrim"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
            />
            <div
              ref={popoverRef}
              className="admin-profile-popover"
              role="menu"
              aria-label="Admin account menu"
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                top: popover.top,
                right: popover.right,
                width: popover.width,
              }}
            >
              <div className="admin-profile-popover-user">
                <span className="admin-profile-avatar" aria-hidden="true">
                  {getInitials(admin.displayName)}
                </span>
                <div className="admin-profile-popover-meta">
                  <strong>{admin.displayName}</strong>
                  <span>{formatRole(admin.role)}</span>
                </div>
              </div>

              <div className="admin-profile-popover-divider" />

              <Link
                to="/"
                role="menuitem"
                className="admin-profile-popover-link"
                onClick={() => setOpen(false)}
              >
                <ExternalLink size={18} strokeWidth={2} aria-hidden="true" />
                View website
              </Link>

              <Link
                to="/admin/settings"
                role="menuitem"
                className="admin-profile-popover-link"
                onClick={() => setOpen(false)}
              >
                <Settings size={18} strokeWidth={2} aria-hidden="true" />
                Admin settings
              </Link>

              <Link
                to="/admin/dashboard"
                role="menuitem"
                className="admin-profile-popover-link"
                onClick={() => setOpen(false)}
              >
                <Shield size={18} strokeWidth={2} aria-hidden="true" />
                Admin dashboard
              </Link>

              <button
                type="button"
                role="menuitem"
                className="admin-profile-popover-link admin-profile-popover-link--logout"
                onClick={handleLogout}
              >
                <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                Logout
              </button>
            </div>
          </>,
          document.body,
        )}
      </div>
    </header>
  )
}
