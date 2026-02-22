import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Heart, Star, Truck, Shield, RefreshCw,
  Plus, Minus, Share2, ChevronRight, Package, Store, Check
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import '../styles/product-detail.css'; // Import the new CSS file

function StarRow({ rating, size = 14 }) {
  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map(s => (
        <Star 
          key={s} 
          size={size} 
          className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        />
      ))}
    </div>
  );
}

function Skeleton({ className, style }) {
  return <div className={`skeleton rounded ${className}`} style={style} />;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    setQty(1);
    setSelectedVariant(null);
    window.scrollTo(0, 0);
    
    Promise.allSettled([
      productsAPI.detail(slug),
      productsAPI.reviews(slug),
      productsAPI.list({ page_size: 8 }),
    ]).then(([prodRes, revRes, relRes]) => {
      if (prodRes.status === 'fulfilled') setProduct(prodRes.value.data);
      else { 
        toast.error('Product not found'); 
        navigate('/products'); 
      }
      if (revRes.status === 'fulfilled') {
        setReviews(revRes.value.data?.results || revRes.value.data || []);
      }
      if (relRes.status === 'fulfilled') {
        const d = relRes.value.data?.results || relRes.value.data || [];
        setRelated(d.filter(p => p.slug !== slug && p.id !== slug).slice(0, 8));
      }
    }).finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated) { 
      toast.error('Please login first'); 
      navigate('/login'); 
      return; 
    }
    setAdding(true);
    try {
      await addToCart(product.id, qty, selectedVariant?.id || null);
      toast.success('Added to cart! 🛒');
      if (buyNow) navigate('/cart');
    } catch { 
      toast.error('Failed to add to cart'); 
    } finally { 
      setAdding(false); 
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { 
      toast.error('Please login first'); 
      return; 
    }
    const res = await toggleWishlist(product.id);
    toast.success(res?.wishlisted ? '❤️ Added to wishlist' : 'Removed from wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { 
      toast.error('Please login to review'); 
      return; 
    }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(slug, newReview);
      toast.success('Review submitted!');
      const res = await productsAPI.reviews(slug);
      setReviews(res.data?.results || res.data || []);
      setNewReview({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally { 
      setSubmittingReview(false); 
    }
  };

  if (loading) return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-skeleton">
          <div className="product-skeleton-grid">
            <div>
              <Skeleton className="w-full" style={{ paddingTop: '100%' }} />
              <div className="product-skeleton-thumbnails">
                {[0, 1, 2, 3].map(i => (
                  <Skeleton key={i} className="product-skeleton-thumb" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images || [];
  const currentImg = images[imgIdx];
  const effectivePrice = product.discounted_price || product.effective_price || product.price;
  const originalPrice = product.price;
  const discount = product.discount_percent || 0;
  const inStock = (product.stock || 0) > 0;
  const wishlisted = isWishlisted(product.id);
  const avgRating = parseFloat(product.rating || 0);
  const ratingDistrib = [5, 4, 3, 2, 1].map(r => ({
    r, count: reviews.filter(rv => rv.rating === r).length
  }));

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-breadcrumb">
        <div className="product-breadcrumb-inner">
          <Link to="/" className="product-breadcrumb-link">Home</Link>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <Link 
                to={`/category/${product.category.slug}`} 
                className="product-breadcrumb-link capitalize"
              >
                {product.category.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="product-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <div className="product-detail-container">
        {/* Main product card */}
        <div className="product-detail-card">
          <div className="product-detail-grid">
            {/* Images */}
            <div className="product-gallery">
              <div className="product-main-image">
                {currentImg ? (
                  <img src={currentImg.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">
                    <Package size={64} />
                  </div>
                )}
                {discount > 0 && (
                  <span className="badge-discount product-discount-badge">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="product-thumbnails">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setImgIdx(i)}
                      className={`product-thumbnail ${i === imgIdx ? 'product-thumbnail--active' : ''}`}
                    >
                      <img src={img.image} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="product-info">
              {/* Store */}
              {product.store && (
                <Link to={`/stores/${product.store.slug}`} className="product-store-link">
                  <Store size={12} /> {product.store.name}
                  {product.store.is_verified && (
                    <Check size={11} className="product-store-verified" />
                  )}
                </Link>
              )}

              {/* Name */}
              <h1 className="product-name">{product.name}</h1>

              {/* Rating summary */}
              <div className="product-rating-summary">
                <div className="product-rating-stars">
                  <StarRow rating={avgRating} size={14} />
                  <span className="product-rating-value">{avgRating.toFixed(1)}</span>
                </div>
                <span className="product-review-count">
                  ({product.review_count || reviews.length} reviews)
                </span>
                <span className={`product-stock-badge ${
                  inStock ? 'product-stock-badge--in' : 'product-stock-badge--out'
                }`}>
                  {inStock ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="product-price-section">
                <div className="product-price-row">
                  <span className="product-current-price">
                    KES {Number(effectivePrice).toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="product-original-price">
                        KES {Number(originalPrice).toLocaleString()}
                      </span>
                      <span className="badge-discount product-save-badge">
                        Save KES {Number(originalPrice - effectivePrice).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="product-variants">
                  <p className="product-variants-label">Select Variant</p>
                  <div className="product-variants-list">
                    {product.variants.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                        className={`product-variant-btn ${
                          selectedVariant?.id === v.id ? 'product-variant-btn--selected' : ''
                        }`}
                      >
                        {v.name}
                        {v.price && (
                          <span className="product-variant-price">
                            KES {Number(v.price).toLocaleString()}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="product-quantity">
                <span className="product-quantity-label">Qty</span>
                <div className="product-quantity-control">
                  <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="product-quantity-btn"
                    disabled={qty <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="product-quantity-value">{qty}</span>
                  <button 
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="product-quantity-btn"
                    disabled={qty >= product.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="product-actions">
                <button 
                  onClick={() => handleAddToCart(false)} 
                  disabled={adding || !inStock}
                  className="product-cart-btn"
                >
                  <ShoppingCart size={16} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => handleAddToCart(true)} 
                  disabled={adding || !inStock}
                  className="product-buy-btn"
                >
                  Buy Now
                </button>
                <button 
                  onClick={handleWishlist}
                  className={`product-wishlist-btn ${
                    wishlisted ? 'product-wishlist-btn--active' : ''
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={`product-wishlist-icon ${
                      wishlisted ? 'product-wishlist-icon--active' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Trust icons */}
              <div className="product-trust-badges">
                {[
                  { icon: <Truck size={16} />, label: 'Fast Delivery' },
                  { icon: <Shield size={16} />, label: 'Buyer Protection' },
                  { icon: <RefreshCw size={16} />, label: 'Easy Returns' },
                ].map(({ icon, label }) => (
                  <div key={label} className="product-trust-item">
                    <span className="product-trust-icon">{icon}</span>
                    <span className="product-trust-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="product-tabs-header">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)}
                className={`product-tab-btn ${
                  tab === t.id ? 'product-tab-btn--active' : ''
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="product-tab-content">
            {tab === 'description' && (
              <div className="product-description">
                {product.description || 'No description available.'}
              </div>
            )}

            {tab === 'specs' && (
              <div>
                {product.attributes?.length > 0 ? (
                  <table className="product-specs-table">
                    <tbody>
                      {product.attributes.map((attr, i) => (
                        <tr key={i} className="product-specs-row">
                          <td className="product-specs-name">{attr.name}</td>
                          <td className="product-specs-value">{attr.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400 text-sm">No specifications available.</p>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                {/* Rating overview */}
                {reviews.length > 0 && (
                  <div className="product-reviews-summary">
                    <div className="text-center flex-shrink-0">
                      <div className="text-5xl font-black text-gray-900">
                        {avgRating.toFixed(1)}
                      </div>
                      <StarRow rating={avgRating} size={18} />
                      <p className="text-xs text-gray-400 mt-1">
                        {reviews.length} reviews
                      </p>
                    </div>
                    <div className="product-rating-distribution">
                      {ratingDistrib.map(({ r, count }) => (
                        <div key={r} className="product-rating-distribution-item">
                          <span className="w-4 text-right text-gray-500">{r}</span>
                          <Star size={10} className="star-filled flex-shrink-0" />
                          <div className="product-rating-distribution-bar">
                            <div 
                              className="product-rating-distribution-fill"
                              style={{ 
                                width: reviews.length 
                                  ? `${(count / reviews.length) * 100}%` 
                                  : '0%' 
                              }}
                            />
                          </div>
                          <span className="w-6 text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                <div className="product-reviews-list">
                  {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No reviews yet. Be the first to review!
                    </p>
                  ) : reviews.map(r => (
                    <div key={r.id} className="product-review-item">
                      <div className="product-review-header">
                        <div className="product-review-avatar">
                          {(r.user_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="product-review-content">
                          <div className="product-review-meta">
                            <span className="product-review-author">
                              {r.user_name || 'Anonymous'}
                            </span>
                            {r.is_verified_purchase && (
                              <span className="product-review-verified">
                                <Check size={10} /> Verified Purchase
                              </span>
                            )}
                            <span className="product-review-date">
                              {new Date(r.created_at).toLocaleDateString('en-KE')}
                            </span>
                          </div>
                          <StarRow rating={r.rating} size={12} />
                          {r.title && (
                            <p className="product-review-title">{r.title}</p>
                          )}
                          <p className="product-review-comment">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Write review */}
                <div className="product-review-form">
                  <h3 className="product-review-form-title">Write a Review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="register-field-label">Rating</label>
                        <div className="product-rating-selector">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button 
                              key={s} 
                              type="button" 
                              onClick={() => setNewReview(r => ({ ...r, rating: s }))}
                              className="product-rating-star-btn"
                            >
                              <Star 
                                size={24} 
                                className={`product-rating-star ${
                                  s <= newReview.rating ? 'product-rating-star--filled' : ''
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="register-field-label">Title (optional)</label>
                        <input 
                          value={newReview.title} 
                          onChange={e => setNewReview(r => ({ ...r, title: e.target.value }))}
                          className="form-input" 
                          placeholder="Summary of your review"
                        />
                      </div>
                      <div>
                        <label className="register-field-label">Your Review *</label>
                        <textarea 
                          value={newReview.comment} 
                          onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))}
                          className="product-review-textarea" 
                          rows={4} 
                          required 
                          placeholder="Share your experience with this product..."
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={submittingReview} 
                        className="btn-primary product-review-submit"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      <Link to="/login" className="text-orange-500 font-bold hover:underline">
                        Login
                      </Link> to write a review.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="product-related">
            <div className="section-header">
              <h2 className="section-title">YOU MAY ALSO LIKE</h2>
              <Link to="/products" className="section-link">
                See More <ChevronRight size={14} />
              </Link>
            </div>
            <div className="product-related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}