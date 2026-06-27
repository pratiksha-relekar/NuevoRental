import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink, LogOut, Settings, Shield } from 'lucide-react'
import { SidebarTrigger } from '../../components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
      if (target.closest('[data-admin-profile-popover]')) return
      if (target.closest('[data-admin-profile-scrim]')) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    onLogout()
  }

  const menuLinkClass =
    'flex w-full items-center gap-2.5 rounded-none px-3 py-2.5 text-left text-sm font-medium text-[#1a1a1a] no-underline transition-colors hover:bg-[#f5f5f5]'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#e5e5e5] bg-white px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <h1 className="truncate text-sm font-semibold tracking-wide text-[#1a1a1a] uppercase md:text-base">
          Admin Dashboard
        </h1>
      </div>

      <div className="relative">
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          className="h-auto rounded-none px-2 py-1.5 hover:bg-[#f5f5f5]"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span
            className="inline-flex size-8 items-center justify-center bg-[#1a1a1a] text-xs font-bold text-white"
            aria-hidden="true"
          >
            {getInitials(admin.displayName)}
          </span>
          <span className="hidden min-w-0 flex-col items-start sm:flex">
            <span className="text-[10px] font-medium tracking-wide text-[#888] uppercase">Hello,</span>
            <span className="max-w-[120px] truncate text-sm font-semibold text-[#1a1a1a]">{admin.displayName}</span>
          </span>
          <ChevronDown className={cn('size-4 text-[#666] transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </Button>

        {open && popover && createPortal(
          <>
            <Button
              type="button"
              variant="ghost"
              data-admin-profile-scrim
              className="fixed inset-0 z-[90] h-full w-full rounded-none bg-[#1a1a1a]/20 p-0 hover:bg-[#1a1a1a]/20"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
            />
            <div
              ref={popoverRef}
              data-admin-profile-popover
              role="menu"
              aria-label="Admin account menu"
              className="fixed z-[100] border border-[#d8d8d8] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                top: popover.top,
                right: popover.right,
                width: popover.width,
              }}
            >
              <div className="flex items-center gap-3 border-b border-[#ececec] px-4 py-3">
                <span
                  className="inline-flex size-10 items-center justify-center bg-[#1a1a1a] text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {getInitials(admin.displayName)}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-[#1a1a1a]">{admin.displayName}</strong>
                  <span className="block text-xs text-[#888]">{formatRole(admin.role)}</span>
                </div>
              </div>

              <div className="p-2">
                <Link to="/" role="menuitem" className={menuLinkClass} onClick={() => setOpen(false)}>
                  <ExternalLink size={18} strokeWidth={2} aria-hidden="true" />
                  View website
                </Link>

                <Link
                  to="/admin/settings"
                  role="menuitem"
                  className={menuLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <Settings size={18} strokeWidth={2} aria-hidden="true" />
                  Admin settings
                </Link>

                <Link
                  to="/admin/dashboard"
                  role="menuitem"
                  className={menuLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <Shield size={18} strokeWidth={2} aria-hidden="true" />
                  Admin dashboard
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  role="menuitem"
                  className={cn(menuLinkClass, 'text-[#c0392b] hover:bg-[#fdf2f2] hover:text-[#a94442]')}
                  onClick={handleLogout}
                >
                  <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                  Logout
                </Button>
              </div>
            </div>
          </>,
          document.body,
        )}
      </div>
    </header>
  )
}
