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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete "${product.title}" from the catalog?`)
    if (!confirmed) return
    const result = await removeProduct(product.id)
    if (result?.ok === false) {
      window.alert(result.error)
    }
  }

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.label}"?`)
    if (!confirmed) return
    const result = await removeCategory(category.id)
    if (result?.ok === false) {
      window.alert(result.error)
    }
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="admin-products-toolbar">
          <TabsList className="admin-products-tabs">
            <TabsTrigger value="products" className={`admin-products-tab${activeTab === 'products' ? ' is-active' : ''}`}>
              <Package size={16} aria-hidden="true" />
              Products
              <span className="admin-products-tab-count">{products.length}</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className={`admin-products-tab${activeTab === 'categories' ? ' is-active' : ''}`}>
              <FolderOpen size={16} aria-hidden="true" />
              Categories
              <span className="admin-products-tab-count">{categories.length}</span>
            </TabsTrigger>
          </TabsList>

          <div className="admin-products-actions">
            <label className="admin-products-search">
              <Search size={16} aria-hidden="true" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, location or category"
              />
            </label>

            {activeTab === 'products' && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="admin-products-filter" aria-label="Filter by category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
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
            </Button>
          </div>
        </div>

        <TabsContent value="products">
          <div className="admin-products-table-wrap">
            <Table className="admin-products-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="admin-products-product-cell">
                        <ProductThumb product={product} />
                        <div>
                          <strong>{product.title}</strong>
                          <div className="admin-products-product-meta">
                            <span>{product.condition}</span>
                            {product.verified && (
                              <Badge className="admin-products-verified">
                                <BadgeCheck size={12} aria-hidden="true" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="admin-products-category-pill">
                        {getCategoryLabel(categories, product.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <strong className="admin-products-price">
                        {formatINR(product.rentalPrice)}
                      </strong>
                      <span className="admin-products-period">/{product.period}</span>
                    </TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>
                      <Badge className={`admin-products-source admin-products-source--${product.source}`}>
                        {product.source === 'catalog' ? 'Catalog' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`admin-products-status admin-products-status--${product.status}`}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="admin-products-row-actions">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="admin-products-icon-btn"
                          aria-label={`Edit ${product.title}`}
                          onClick={() => setProductModal({ mode: 'edit', product })}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="admin-products-icon-btn admin-products-icon-btn--danger"
                          aria-label={`Delete ${product.title}`}
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <p className="admin-products-empty">No products match your search.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="admin-products-table-wrap">
            <Table className="admin-products-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const count = products.filter((product) => product.category === category.id).length

                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="admin-products-category-cell">
                          <span className="admin-products-category-icon" aria-hidden="true">
                            {category.label.slice(0, 1)}
                          </span>
                          <strong>{category.label}</strong>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="admin-products-code">{category.id}</code>
                      </TableCell>
                      <TableCell>{category.description || '—'}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        <div className="admin-products-row-actions">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="admin-products-icon-btn"
                            aria-label={`Edit ${category.label}`}
                            onClick={() => setCategoryModal({ mode: 'edit', category })}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="admin-products-icon-btn admin-products-icon-btn--danger"
                            aria-label={`Delete ${category.label}`}
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredCategories.length === 0 && (
              <p className="admin-products-empty">No categories match your search.</p>
            )}
          </div>
        </TabsContent>
        </Tabs>
      </section>

      <ProductFormModal
        open={Boolean(productModal)}
        product={productModal?.mode === 'edit' ? productModal.product : null}
        categories={categories}
        onClose={() => setProductModal(null)}
        onSave={async (payload) => {
          const result = await addOrUpdateProduct(payload)
          if (result?.ok === false) {
            window.alert(result.error)
            return
          }
          setProductModal(null)
        }}
      />

      <CategoryFormModal
        open={Boolean(categoryModal)}
        category={categoryModal?.mode === 'edit' ? categoryModal.category : null}
        onClose={() => setCategoryModal(null)}
        onSave={async (payload) => {
          const result = await addOrUpdateCategory(payload)
          if (result?.ok === false) {
            window.alert(result.error)
            return
          }
          setCategoryModal(null)
        }}
      />
    </div>
  )
}

export default AdminProductsPage
