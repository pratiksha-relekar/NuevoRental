import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PanelLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '4rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'

const SidebarContext = createContext(null)

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobile
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [openUncontrolled, setOpenUncontrolled] = useState(defaultOpen)

  const open = openProp ?? openUncontrolled
  const setOpen = useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(open) : value
      if (onOpenChange) {
        onOpenChange(next)
      } else {
        setOpenUncontrolled(next)
      }
    },
    [onOpenChange, open],
  )

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen((prev) => !prev)
    }
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT) return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      toggleSidebar()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  const value = useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn('sidebar-provider', className)}
        data-sidebar-state={state}
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
          ...style,
        }}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

export function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  className,
  children,
  ...props
}) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

  if (collapsible === 'none') {
    return (
      <aside
        data-sidebar="sidebar"
        data-side={side}
        data-variant={variant}
        className={cn('sidebar sidebar--static', className)}
        {...props}
      >
        {children}
      </aside>
    )
  }

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className={cn('sidebar-mobile-overlay', openMobile && 'is-open')}
          onClick={() => setOpenMobile(false)}
          aria-label="Close sidebar"
        />
        <aside
          data-sidebar="sidebar"
          data-side={side}
          data-variant={variant}
          data-mobile="true"
          className={cn('sidebar sidebar--mobile', openMobile && 'is-open', className)}
          {...props}
        >
          {children}
        </aside>
      </>
    )
  }

  return (
    <aside
      data-sidebar="sidebar"
      data-side={side}
      data-variant={variant}
      data-state={state}
      data-collapsible={collapsible}
      className={cn('sidebar sidebar--desktop', className)}
      {...props}
    >
      {children}
      {collapsible === 'icon' && <SidebarRail />}
    </aside>
  )
}

export function SidebarInset({ className, ...props }) {
  return <div className={cn('sidebar-inset', className)} {...props} />
}

export function SidebarTrigger({ className, ...props }) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      className={cn('sidebar-trigger', className)}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      {...props}
    >
      <PanelLeft size={18} />
    </button>
  )
}

export function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      className={cn('sidebar-rail', className)}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      tabIndex={-1}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }) {
  return <div className={cn('sidebar-header', className)} {...props} />
}

export function SidebarFooter({ className, ...props }) {
  return <div className={cn('sidebar-footer', className)} {...props} />
}

export function SidebarContent({ className, ...props }) {
  return <div className={cn('sidebar-content', className)} {...props} />
}

export function SidebarGroup({ className, ...props }) {
  return <div className={cn('sidebar-group', className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }) {
  return <div className={cn('sidebar-group-label', className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }) {
  return <div className={cn('sidebar-group-content', className)} {...props} />
}

export function SidebarMenu({ className, ...props }) {
  return <ul className={cn('sidebar-menu', className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }) {
  return <li className={cn('sidebar-menu-item', className)} {...props} />
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  children,
  ...props
}) {
  const classes = cn('sidebar-menu-button', isActive && 'is-active', className)

  if (asChild) {
    const onlyChild = Array.isArray(children) ? children[0] : children
    if (isValidElement(onlyChild)) {
      return cloneElement(onlyChild, {
        ...props,
        className: cn(classes, onlyChild.props.className),
        'data-active': isActive ? 'true' : undefined,
      })
    }
  }

  return (
    <button
      type="button"
      className={classes}
      data-active={isActive ? 'true' : undefined}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarMenuBadge({ className, ...props }) {
  return <span className={cn('sidebar-menu-badge', className)} {...props} />
}
