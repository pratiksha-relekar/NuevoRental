import { useRef } from 'react'
import './SpotlightCard.css'

function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(74, 144, 226, 0.18)',
}) {
  const divRef = useRef(null)

  const handleMouseMove = (event) => {
    const rect = divRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    divRef.current.style.setProperty('--mouse-x', `${x}px`)
    divRef.current.style.setProperty('--mouse-y', `${y}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  const handleMouseLeave = () => {
    if (!divRef.current) return
    divRef.current.style.setProperty('--mouse-x', '50%')
    divRef.current.style.setProperty('--mouse-y', '50%')
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`card-spotlight ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export default SpotlightCard
