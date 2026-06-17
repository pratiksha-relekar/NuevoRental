import { CATEGORIES } from '../data/categories'
import './CategorySection.css'

function CategorySection({ activeCategory, onCategoryChange }) {
  const handleClick = (categoryId) => {
    onCategoryChange?.(categoryId)
    requestAnimationFrame(() => {
      document.getElementById('rental-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className="category-section" aria-label="Product categories">
      <div className="category-section-inner">
        <h2 className="category-section-title">Rent by Category</h2>

        <div className="category-scroll" role="list">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                type="button"
                role="listitem"
                className={`category-item${isActive ? ' category-item--active' : ''}`}
                onClick={() => handleClick(category.id)}
                aria-pressed={isActive}
              >
                <span className="category-circle">
                  <img src={category.image} alt="" className="category-circle-img" />
                </span>
                <span className="category-label">{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
