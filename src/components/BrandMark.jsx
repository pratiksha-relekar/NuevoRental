import { BRAND_ICONS } from './brandIcons'
import './PopularBrandsSection.css'

function BrandMark({ brand }) {
  const Icon = BRAND_ICONS[brand.id]

  return (
    <div className={`brand-mark brand-mark--${brand.id}`}>
      <span className="brand-mark-icon" aria-hidden="true">
        {Icon ? <Icon /> : <span className="brand-mark-fallback">{brand.name.charAt(0)}</span>}
      </span>
      <span className="brand-mark-name">{brand.name}</span>
    </div>
  )
}

export default BrandMark
