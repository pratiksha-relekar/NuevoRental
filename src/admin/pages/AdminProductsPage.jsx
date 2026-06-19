import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  FolderOpen,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { getProductImage } from '../../data/products'
import { formatINR } from '../../utils/cartSummary'
import { CategoryFormModal } from '../components/CategoryFormModal'
import { ProductFormModal } from '../components/ProductFormModal'
import './AdminProductsPage.css'

function getCategoryLabel(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.label ?? categoryId
}

function ProductThumb({ product }) {
  const src = getProductImage(product)
  return (
    <img
      src={src}
      alt=""
      className="admin-products-thumb"
      loading="lazy"
    />
  )
}

function AdminProductsPage() {
  const {
    products,
    categories,
    addOrUpdateProduct,
    removeProduct,
    addOrUpdateCategory,
    removeCategory,
  } = useCatalog()

  const [activeTab, setActiveTab] = useState('products')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [productModal, setProductModal] = useState(null)
  const [categoryModal, setCategoryModal] = useState(null)

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.label])),
    [categories],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      if (!matchesCategory) return false
      if (!query) return true

      const haystack = [
        product.title,
        product.location,
        categoryMap[product.category],
        product.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [products, search, categoryFilter, categoryMap])

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return categories

    return categories.filter((category) =>
      `${category.label} ${category.description} ${category.id}`.toLowerCase().includes(query),
    )
  }, [categories, search])

  const handleDeleteProduct = (product) => {
    const confirmed = window.confirm(`Delete "${product.title}" from the catalog?`)
    if (!confirmed) return
    removeProduct(product.id)
  }

  const handleDeleteCategory = (category) => {
    const confirmed = window.confirm(`Delete category "${category.label}"?`)
    if (!confirmed) return
    removeCategory(category.id)
  }

  return (
    <div className="admin-products-page">
      <header className="admin-products-page-head">
        <div>
          <h1>Products</h1>
          <p>Add new listings, manage categories and keep the Nuevo Rental catalogue tidy.</p>
        </div>
      </header>

      <section className="admin-products-panel">
        <div className="admin-products-toolbar">
          <div className="admin-products-tabs">
            <button
              type="button"
              className={`admin-products-tab${activeTab === 'products' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={16} aria-hidden="true" />
              Products
              <span className="admin-products-tab-count">{products.length}</span>
            </button>
            <button
              type="button"
              className={`admin-products-tab${activeTab === 'categories' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FolderOpen size={16} aria-hidden="true" />
              Categories
              <span className="admin-products-tab-count">{categories.length}</span>
            </button>
          </div>

          <div className="admin-products-actions">
            <label className="admin-products-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, location or category"
              />
            </label>

            {activeTab === 'products' && (
              <select
                className="admin-products-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className="admin-products-add-btn"
              onClick={() =>
                activeTab === 'products'
                  ? setProductModal({ mode: 'create' })
                  : setCategoryModal({ mode: 'create' })
              }
            >
              <Plus size={16} aria-hidden="true" />
              {activeTab === 'products' ? 'Add product' : 'Add category'}
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="admin-products-table-wrap">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-products-product-cell">
                        <ProductThumb product={product} />
                        <div>
                          <strong>{product.title}</strong>
                          <div className="admin-products-product-meta">
                            <span>{product.condition}</span>
                            {product.verified && (
                              <span className="admin-products-verified">
                                <BadgeCheck size={12} aria-hidden="true" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-products-category-pill">
                        {getCategoryLabel(categories, product.category)}
                      </span>
                    </td>
                    <td>
                      <strong className="admin-products-price">
                        {formatINR(product.rentalPrice)}
                      </strong>
                      <span className="admin-products-period">/{product.period}</span>
                    </td>
                    <td>{product.location}</td>
                    <td>
                      <span className={`admin-products-source admin-products-source--${product.source}`}>
                        {product.source === 'catalog' ? 'Catalog' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-products-status admin-products-status--${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-products-row-actions">
                        <button
                          type="button"
                          className="admin-products-icon-btn"
                          aria-label={`Edit ${product.title}`}
                          onClick={() => setProductModal({ mode: 'edit', product })}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-products-icon-btn admin-products-icon-btn--danger"
                          aria-label={`Delete ${product.title}`}
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <p className="admin-products-empty">No products match your search.</p>
            )}
          </div>
        ) : (
          <div className="admin-products-table-wrap">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const count = products.filter((product) => product.category === category.id).length

                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="admin-products-category-cell">
                          <span className="admin-products-category-icon" aria-hidden="true">
                            {category.label.slice(0, 1)}
                          </span>
                          <strong>{category.label}</strong>
                        </div>
                      </td>
                      <td>
                        <code className="admin-products-code">{category.id}</code>
                      </td>
                      <td>{category.description || '—'}</td>
                      <td>{count}</td>
                      <td>
                        <div className="admin-products-row-actions">
                          <button
                            type="button"
                            className="admin-products-icon-btn"
                            aria-label={`Edit ${category.label}`}
                            onClick={() => setCategoryModal({ mode: 'edit', category })}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-products-icon-btn admin-products-icon-btn--danger"
                            aria-label={`Delete ${category.label}`}
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredCategories.length === 0 && (
              <p className="admin-products-empty">No categories match your search.</p>
            )}
          </div>
        )}
      </section>

      <ProductFormModal
        open={Boolean(productModal)}
        product={productModal?.mode === 'edit' ? productModal.product : null}
        categories={categories}
        onClose={() => setProductModal(null)}
        onSave={(payload) => {
          addOrUpdateProduct(payload)
          setProductModal(null)
        }}
      />

      <CategoryFormModal
        open={Boolean(categoryModal)}
        category={categoryModal?.mode === 'edit' ? categoryModal.category : null}
        onClose={() => setCategoryModal(null)}
        onSave={(payload) => {
          addOrUpdateCategory(payload)
          setCategoryModal(null)
        }}
      />
    </div>
  )
}

export default AdminProductsPage
