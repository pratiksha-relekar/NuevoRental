import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCartWishlist } from '../context/CartWishlistContext'
import '../styles/pageAnimations.css'
import './CartWishlistPages.css'

function WishlistPage() {
  const {
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    addToCart,
  } = useCartWishlist()

  return (
    <section className="bag-page" aria-labelledby="wishlist-heading">
      <div className="bag-page-inner">
        <header className="bag-page-header page-animate-item">
          <span className="page-eyebrow">Saved Items</span>
          <h1 id="wishlist-heading" className="page-title">My Wishlist</h1>
          <p className="bag-page-lead">
            {wishlistCount > 0
              ? `${wishlistCount} product${wishlistCount === 1 ? '' : 's'} saved for later`
              : 'Save products you like and rent them whenever you are ready.'}
          </p>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="bag-empty page-animate-item">
            <Heart size={48} strokeWidth={1.5} aria-hidden="true" />
            <p>Your wishlist is empty.</p>
            <Link to="/rent-products" className="bag-btn bag-btn--primary">
              Explore Rentals
            </Link>
          </div>
        ) : (
          <ul className="wishlist-grid">
            {wishlistItems.map((item) => (
              <li key={item.productId} className="wishlist-card page-animate-item">
                <Link to={`/product/${item.productId}`} className="wishlist-card-image">
                  <img src={item.image} alt={item.title} />
                </Link>

                <div className="wishlist-card-body">
                  <Link to={`/product/${item.productId}`} className="wishlist-card-title">
                    {item.title}
                  </Link>
                  <p className="wishlist-card-price">
                    ₹{item.rentalPrice.toLocaleString('en-IN')}
                    <span>/{item.period}</span>
                  </p>

                  <div className="wishlist-card-actions">
                    <button
                      type="button"
                      className="bag-btn bag-btn--primary bag-btn--sm"
                      onClick={() => addToCart(item, { quantity: 1, durationPlanId: '1m' })}
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="bag-btn bag-btn--ghost bag-btn--sm"
                      onClick={() => toggleWishlist(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default WishlistPage
