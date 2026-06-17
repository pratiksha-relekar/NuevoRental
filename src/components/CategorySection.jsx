import { CATEGORIES } from '../data/categories'
import CategoryIcon from './CategoryIcon'
import './CategorySection.css'

function CategorySection({ activeCategory, onCategoryChange }) {
  return (
    <section className="category-section" aria-label="Product categories">
      <div className="category-section-inner">
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-card${activeCategory === category.id ? ' category-card--active' : ''}`}
              onClick={() => onCategoryChange?.(category.id)}
            >
              <span className="category-icon">
                <CategoryIcon type={category.icon} />
              </span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
