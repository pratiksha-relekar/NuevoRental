const GRADIENTS = (
  <defs>
    <linearGradient id="laptopBase" x1="22" y1="28" x2="98" y2="72" gradientUnits="userSpaceOnUse">
      <stop stopColor="#c8d8e8" /><stop offset="1" stopColor="#a0b8d0" />
    </linearGradient>
    <linearGradient id="laptopScreen" x1="30" y1="28" x2="90" y2="68" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e8f0f8" /><stop offset="1" stopColor="#b8cce0" />
    </linearGradient>
    <linearGradient id="screenGlow" x1="38" y1="40" x2="82" y2="58" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4a90e2" /><stop offset="1" stopColor="#2b6cb0" />
    </linearGradient>
    <linearGradient id="laptopKeyboard" x1="14" y1="72" x2="106" y2="82" gradientUnits="userSpaceOnUse">
      <stop stopColor="#d0dce8" /><stop offset="1" stopColor="#a8bcd0" />
    </linearGradient>
    <linearGradient id="towerSide" x1="78" y1="55" x2="98" y2="88" gradientUnits="userSpaceOnUse">
      <stop stopColor="#b0c4d8" /><stop offset="1" stopColor="#8098b0" />
    </linearGradient>
    <linearGradient id="towerTop" x1="72" y1="50" x2="104" y2="55" gradientUnits="userSpaceOnUse">
      <stop stopColor="#d0dce8" /><stop offset="1" stopColor="#b0c4d8" />
    </linearGradient>
    <linearGradient id="monitorFrame" x1="12" y1="30" x2="68" y2="62" gradientUnits="userSpaceOnUse">
      <stop stopColor="#c0d0e0" /><stop offset="1" stopColor="#90a8c0" />
    </linearGradient>
    <linearGradient id="monitorScreen" x1="16" y1="34" x2="64" y2="54" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4a90e2" /><stop offset="1" stopColor="#2b6cb0" />
    </linearGradient>
    <linearGradient id="monitorStand" x1="28" y1="78" x2="52" y2="82" gradientUnits="userSpaceOnUse">
      <stop stopColor="#a0b4c8" /><stop offset="1" stopColor="#8098b0" />
    </linearGradient>
    <linearGradient id="printerBody" x1="28" y1="42" x2="92" y2="68" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e0eaf4" /><stop offset="1" stopColor="#b0c4d8" />
    </linearGradient>
    <linearGradient id="projectorBody" x1="16" y1="48" x2="72" y2="72" gradientUnits="userSpaceOnUse">
      <stop stopColor="#d8e4f0" /><stop offset="1" stopColor="#a8bcd0" />
    </linearGradient>
    <linearGradient id="projectorLens" x1="62" y1="46" x2="90" y2="74" gradientUnits="userSpaceOnUse">
      <stop stopColor="#6ab0f0" /><stop offset="1" stopColor="#2b6cb0" />
    </linearGradient>
    <linearGradient id="projectorBeam" x1="90" y1="52" x2="110" y2="68" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4a90e2" stopOpacity="0.6" /><stop offset="1" stopColor="#4a90e2" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="keyboardBody" x1="14" y1="58" x2="78" y2="72" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e8f0f8" /><stop offset="1" stopColor="#c0d0e0" />
    </linearGradient>
    <linearGradient id="mouseTop" x1="82" y1="48" x2="102" y2="80" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e0eaf4" /><stop offset="1" stopColor="#b0c4d8" />
    </linearGradient>
    <linearGradient id="routerBody" x1="20" y1="52" x2="100" y2="78" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e0eaf4" /><stop offset="1" stopColor="#a8bcd0" />
    </linearGradient>
  </defs>
)

const ICONS = {
  laptop: (
    <>
      <ellipse cx="60" cy="88" rx="42" ry="6" fill="rgba(74,144,226,0.15)" />
      <path d="M22 72L38 28H82L98 72H22Z" fill="url(#laptopBase)" />
      <path d="M30 68H90L78 32H42L30 68Z" fill="url(#laptopScreen)" />
      <path d="M34 64H86L76 36H44L34 64Z" fill="#1a3a5c" opacity="0.85" />
      <path d="M38 58H82L74 40H46L38 58Z" fill="url(#screenGlow)" />
      <path d="M18 72H102L106 78C107 79 106 82 104 82H16C14 82 13 79 14 78L18 72Z" fill="url(#laptopKeyboard)" />
      <rect x="48" y="74" width="24" height="3" rx="1.5" fill="#4a90e2" opacity="0.6" />
    </>
  ),
  desktop: (
    <>
      <ellipse cx="48" cy="90" rx="30" ry="5" fill="rgba(74,144,226,0.12)" />
      <path d="M78 55H98V88H78V55Z" fill="url(#towerSide)" />
      <path d="M72 50H104V55H72V50Z" fill="url(#towerTop)" />
      <circle cx="88" cy="68" r="3" fill="#4a90e2" />
      <rect x="84" y="76" width="8" height="2" rx="1" fill="#6ab0f0" />
      <rect x="12" y="30" width="56" height="32" rx="2" fill="url(#monitorFrame)" />
      <rect x="16" y="34" width="48" height="20" fill="url(#monitorScreen)" />
      <rect x="36" y="62" width="8" height="16" fill="#c8d8e8" />
      <rect x="28" y="78" width="24" height="4" fill="url(#monitorStand)" />
    </>
  ),
  printer: (
    <>
      <ellipse cx="60" cy="90" rx="38" ry="5" fill="rgba(74,144,226,0.12)" />
      <path d="M28 42H92V68H28V42Z" fill="url(#printerBody)" />
      <path d="M32 36H88V42H32V36Z" fill="#d0dce8" />
      <path d="M36 28H84V36H36V36Z" fill="#e8f0f8" />
      <rect x="40" y="48" width="40" height="4" rx="1" fill="#4a90e2" opacity="0.5" />
      <circle cx="84" cy="52" r="3" fill="#4a90e2" />
      <path d="M32 68H88V78H32V78Z" fill="#f0f4f8" />
      <rect x="40" y="78" width="40" height="10" fill="white" stroke="#c0d0e0" strokeWidth="1" />
    </>
  ),
  projector: (
    <>
      <ellipse cx="50" cy="88" rx="35" ry="5" fill="rgba(74,144,226,0.12)" />
      <path d="M16 48H72V72H16V48Z" fill="url(#projectorBody)" />
      <circle cx="76" cy="60" r="14" fill="url(#projectorLens)" />
      <circle cx="76" cy="60" r="8" fill="#1a3050" opacity="0.6" />
      <path d="M90 60L110 52V68L90 60Z" fill="url(#projectorBeam)" opacity="0.5" />
      <rect x="24" y="52" width="8" height="3" rx="1" fill="#4a90e2" />
      <rect x="24" y="58" width="12" height="3" rx="1" fill="#6ab0f0" opacity="0.7" />
      <path d="M20 44H68L64 48H24L20 44Z" fill="#d8e4f0" />
    </>
  ),
  accessories: (
    <>
      <ellipse cx="60" cy="90" rx="40" ry="5" fill="rgba(74,144,226,0.12)" />
      <rect x="14" y="58" width="64" height="14" rx="2" fill="url(#keyboardBody)" />
      <rect x="18" y="62" width="6" height="4" rx="1" fill="#4a90e2" opacity="0.4" />
      <rect x="26" y="62" width="6" height="4" rx="1" fill="#6ab0f0" opacity="0.3" />
      <rect x="34" y="62" width="6" height="4" rx="1" fill="#4a90e2" opacity="0.4" />
      <rect x="42" y="62" width="6" height="4" rx="1" fill="#6ab0f0" opacity="0.3" />
      <rect x="50" y="62" width="6" height="4" rx="1" fill="#4a90e2" opacity="0.4" />
      <rect x="58" y="62" width="6" height="4" rx="1" fill="#6ab0f0" opacity="0.3" />
      <ellipse cx="92" cy="64" rx="16" ry="20" fill="#c0d0e0" />
      <path d="M92 48C86 48 82 54 82 64C82 74 86 80 92 80C98 80 102 74 102 64C102 54 98 48 92 48Z" fill="url(#mouseTop)" />
      <ellipse cx="92" cy="58" rx="3" ry="5" fill="#4a90e2" opacity="0.5" />
    </>
  ),
  networking: (
    <>
      <ellipse cx="60" cy="90" rx="38" ry="5" fill="rgba(74,144,226,0.12)" />
      <path d="M20 52H100V78H20V52Z" fill="url(#routerBody)" />
      <path d="M24 48H96V52H24V48Z" fill="#d0dce8" />
      <rect x="30" y="60" width="8" height="8" rx="2" fill="#4a90e2" opacity="0.7" />
      <rect x="42" y="60" width="8" height="8" rx="2" fill="#6ab0f0" opacity="0.5" />
      <rect x="54" y="60" width="8" height="8" rx="2" fill="#4a90e2" opacity="0.4" />
      <rect x="66" y="60" width="8" height="8" rx="2" fill="#6ab0f0" opacity="0.5" />
      <path d="M36 48V36M48 48V32M60 48V28M72 48V32M84 48V36" stroke="#4a90e2" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="68" r="3" fill="#25d366" />
    </>
  ),
}

function Category3DIcon({ type }) {
  return (
    <div className="category-3d-icon">
      <svg viewBox="0 0 120 100" className="category-3d-svg" aria-hidden="true">
        {GRADIENTS}
        {ICONS[type] ?? ICONS.laptop}
      </svg>
    </div>
  )
}

export default Category3DIcon
