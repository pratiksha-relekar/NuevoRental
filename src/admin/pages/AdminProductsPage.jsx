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
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminIconButton,
  AdminPrimaryButton,
  AdminSearchField,
  AdminStatusBadge,
  AdminTabTrigger,
  AdminTabsList,
  AdminToolbar,
  adminSelectTriggerClass,
  adminTableClass,
  adminTableWrapClass,
} from '../components/admin-ui'

function getCategoryLabel(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.label ?? categoryId
}

function getProductStatusTone(status) {
  if (status === 'active') return 'success'
  if (status === 'draft') return 'warning'
  if (status === 'inactive') return 'neutral'
  return 'neutral'
}

function ProductThumb({ product }) {
  const src = getProductImage(product)
  return (
    <img
      src={src}
      alt=""
      className="size-11 shrink-0 border border-[#e5e5e5] object-cover"
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
    <AdminPage>
      <AdminPageHeader
        title="Products"
        description="Add new listings, manage categories and keep the Nuevo Rental catalogue tidy."
      />

      <AdminPanel>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <AdminToolbar>
            <AdminTabsList>
              <AdminTabTrigger value="products" count={products.length}>
                <Package size={16} aria-hidden="true" />
                Products
              </AdminTabTrigger>
              <AdminTabTrigger value="categories" count={categories.length}>
                <FolderOpen size={16} aria-hidden="true" />
                Categories
              </AdminTabTrigger>
            </AdminTabsList>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <AdminSearchField
                icon={Search}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, location or category"
              />

              {activeTab === 'products' && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className={cn(adminSelectTriggerClass, 'w-full sm:w-[180px]')} aria-label="Filter by category">
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

              <AdminPrimaryButton
                onClick={() =>
                  activeTab === 'products'
                    ? setProductModal({ mode: 'create' })
                    : setCategoryModal({ mode: 'create' })
                }
              >
                <Plus size={16} aria-hidden="true" />
                {activeTab === 'products' ? 'Add product' : 'Add category'}
              </AdminPrimaryButton>
            </div>
          </AdminToolbar>

          <TabsContent value="products" className="mt-0">
            <div className={adminTableWrapClass}>
              <Table className={adminTableClass}>
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
                        <div className="flex items-center gap-3">
                          <ProductThumb product={product} />
                          <div>
                            <strong className="text-sm text-[#1a1a1a]">{product.title}</strong>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#888]">
                              <span>{product.condition}</span>
                              {product.verified && (
                                <AdminStatusBadge tone="success" className="gap-1 normal-case">
                                  <BadgeCheck size={12} aria-hidden="true" />
                                  Verified
                                </AdminStatusBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge tone="neutral" className="normal-case">
                          {getCategoryLabel(categories, product.category)}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <strong className="text-sm text-[#1a1a1a]">
                          {formatINR(product.rentalPrice)}
                        </strong>
                        <span className="text-xs text-[#888]">/{product.period}</span>
                      </TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>
                        <AdminStatusBadge tone={product.source === 'catalog' ? 'info' : 'dark'}>
                          {product.source === 'catalog' ? 'Catalog' : 'Admin'}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge tone={getProductStatusTone(product.status)}>
                          {product.status}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <AdminIconButton
                            aria-label={`Edit ${product.title}`}
                            onClick={() => setProductModal({ mode: 'edit', product })}
                          >
                            <Pencil size={16} />
                          </AdminIconButton>
                          <AdminIconButton
                            danger
                            aria-label={`Delete ${product.title}`}
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 size={16} />
                          </AdminIconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <AdminEmptyState>No products match your search.</AdminEmptyState>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <div className={adminTableWrapClass}>
              <Table className={adminTableClass}>
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
                          <div className="flex items-center gap-2.5">
                            <span
                              className="inline-flex size-8 items-center justify-center border border-[#e5e5e5] bg-[#fafafa] text-xs font-bold text-[#1a1a1a]"
                              aria-hidden="true"
                            >
                              {category.label.slice(0, 1)}
                            </span>
                            <strong className="text-sm text-[#1a1a1a]">{category.label}</strong>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="border border-[#e5e5e5] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-xs text-[#666]">
                            {category.id}
                          </code>
                        </TableCell>
                        <TableCell>{category.description || '—'}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <AdminIconButton
                              aria-label={`Edit ${category.label}`}
                              onClick={() => setCategoryModal({ mode: 'edit', category })}
                            >
                              <Pencil size={16} />
                            </AdminIconButton>
                            <AdminIconButton
                              danger
                              aria-label={`Delete ${category.label}`}
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 size={16} />
                            </AdminIconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && (
                <AdminEmptyState>No categories match your search.</AdminEmptyState>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </AdminPanel>

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
    </AdminPage>
  )
}

export default AdminProductsPage
