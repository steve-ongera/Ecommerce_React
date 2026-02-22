import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { useWishlistStore } from '../store/index.js';
import '../styles/wishlist.css'; // Import the new CSS file

export default function WishlistPage() {
  const { wishlist, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => { 
    fetchWishlist(); 
  }, [fetchWishlist]);

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-header">
        My Wishlist {wishlist.length > 0 && (
          <span className="wishlist-count">({wishlist.length})</span>
        )}
      </h1>

      {loading ? (
        <div className="wishlist-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="wishlist-skeleton" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <i className="bi bi-heart"></i>
          </div>
          <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
          <p className="wishlist-empty-text">
            Save items you love and find them here later.
          </p>
          <Link to="/products" className="btn-primary wishlist-empty-btn">
            <i className="bi bi-shop"></i> Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}