function CategoryIcon({ type }) {
  const icons = {
    laptop: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 38H46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 38L18 34H30L34 38" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    desktop: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M20 30V36" stroke="currentColor" strokeWidth="2" />
        <path d="M14 36H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    printer: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="10" y="18" width="28" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="6" width="20" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="34" width="20" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    projector: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="16" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="36" cy="25" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M42 25H46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    accessories: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="20" width="32" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="12" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
        <circle cx="36" cy="26" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    networking: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="14" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="24" r="2" fill="currentColor" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <circle cx="32" cy="24" r="2" fill="currentColor" />
        <path d="M16 34V38M24 34V38M32 34V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  }

  return icons[type] ?? icons.laptop
}

export default CategoryIcon
