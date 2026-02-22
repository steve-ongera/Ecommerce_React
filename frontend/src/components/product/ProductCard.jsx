import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { isAuthenticated }            = useAuthStore();
  const { addToCart }                  = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [addingCart, setAddingCart]    = useState(false);
  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setAddingCart(true);
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!', { icon: '🛒' });
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await toggleWishlist(product.id);
      toast.success(res?.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Error updating wishlist');
    }
  };

  const effectivePrice = product.discounted_price || product.effective_price || product.price;
  const originalPrice  = product.price;
  const discount       = product.discount_percent || 0;
  const rating         = parseFloat(product.rating || product.avg_rating || 0);
  const reviewCount    = product.review_count || 0;
  const inStock        = product.stock > 0 || product.in_stock !== false;

  return (
    <div className="product-card">

      <Link to={`/products/${product.slug || product.id}`} style={{ display: 'block', textDecoration: 'none' }}>

        {/* ── Image ───────────────────────────────────────────── */}
        <div className="pc-img-wrap">
          {product.primary_image || product.image ? (
            <img
              src={product.primary_image || product.image}
              alt={product.name}
              className="pc-img"
              loading="lazy"
            />
          ) : (
            <div className="pc-img-placeholder">
              <ShoppingCart size={40} />
            </div>
          )}

          {/* Discount / best badges */}
          <div className="pc-badges">
            {discount > 0 && (
              <span className="badge-discount">-{discount}%</span>
            )}
            {product.is_featured && !discount && (
              <span className="badge-new">BEST</span>
            )}
          </div>

          {/* Flash sale strip */}
          {product.flash_sale && (
            <div className="pc-flash">
              <Zap size={10} style={{ fill: '#fff' }} />
              Flash Deal
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`pc-wishlist-btn${inWishlist ? ' pc-wishlist-btn--active' : ''}`}
            aria-label="Toggle wishlist"
          >
            <Heart
              size={13}
              style={{
                fill:  inWishlist ? '#e74c3c' : 'none',
                color: inWishlist ? '#e74c3c' : '#aaa',
              }}
            />
          </button>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="pc-oos-overlay">
              <span className="pc-oos-label">Out of Stock</span>
            </div>
          )}
        </div>

        {/* ── Info ────────────────────────────────────────────── */}
        <div className="pc-info">

          <h3 className="pc-name line-clamp-2">{product.name}</h3>

          {/* Stars */}
          {rating > 0 && (
            <div className="pc-rating">
              <span className="stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={10}
                    className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </span>
              <span className="pc-review-count">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price">
              KES {Number(effectivePrice).toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="pc-original-price">
                KES {Number(originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Store name */}
          {product.store_name && (
            <p className="pc-store line-clamp-1">{product.store_name}</p>
          )}

        </div>
      </Link>

      {/* ── Add to cart ──────────────────────────────────────── */}
      <div className="pc-cart-wrap">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingCart}
          className="pc-cart-btn"
          style={{ background: inStock ? '#f68b1e' : '#ccc' }}
        >
          <ShoppingCart size={12} />
          {addingCart ? 'Adding…' : inStock ? 'ADD TO CART' : 'UNAVAILABLE'}
        </button>
      </div>

    </div>
  );
}