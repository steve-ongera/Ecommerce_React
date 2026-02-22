import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { useWishlistStore } from '../store/index.js'

export default function WishlistPage() {
  const { wishlist, loading, fetchWishlist } = useWishlistStore()

  useEffect(() => { fetchWishlist() }, [])

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px', minHeight: '60vh' }}>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 20 }}>
        My Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
      </h1>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 8 }} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 16px' }}>
          <Heart size={56} style={{ color: '#ddd', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, marginBottom: 8 }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Save items you love and find them here later.
          </p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
          {wishlist.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}