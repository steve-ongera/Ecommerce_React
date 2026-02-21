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

function StarRow({ rating, size=14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}/>
      ))}
    </div>
  );
}

function Skeleton({ className, style }) {
  return <div className={`skeleton rounded ${className}`} style={style}/>;
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
  const [newReview, setNewReview] = useState({rating:5, title:'', comment:''});
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    setQty(1);
    setSelectedVariant(null);
    window.scrollTo(0,0);
    Promise.allSettled([
      productsAPI.detail(slug),
      productsAPI.reviews(slug),
      productsAPI.list({page_size:8}),
    ]).then(([prodRes, revRes, relRes]) => {
      if (prodRes.status === 'fulfilled') setProduct(prodRes.value.data);
      else { toast.error('Product not found'); navigate('/products'); }
      if (revRes.status === 'fulfilled') setReviews(revRes.value.data?.results || revRes.value.data || []);
      if (relRes.status === 'fulfilled') {
        const d = relRes.value.data?.results || relRes.value.data || [];
        setRelated(d.filter(p => p.slug !== slug && p.id !== slug).slice(0,8));
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty, selectedVariant?.id || null);
      toast.success('Added to cart! 🛒');
      if (buyNow) navigate('/cart');
    } catch { toast.error('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    const res = await toggleWishlist(product.id);
    toast.success(res?.wishlisted ? '❤️ Added to wishlist' : 'Removed from wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(slug, newReview);
      toast.success('Review submitted!');
      const res = await productsAPI.reviews(slug);
      setReviews(res.data?.results || res.data || []);
      setNewReview({rating:5, title:'', comment:''});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full mb-3" style={{paddingTop:'100%'}}/>
              <div className="flex gap-2">{[0,1,2,3].map(i=><Skeleton key={i} className="w-16 h-16"/>)}</div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4"/>
              <Skeleton className="h-4 w-1/2"/>
              <Skeleton className="h-8 w-1/3"/>
              <Skeleton className="h-10 w-full"/>
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
  const ratingDistrib = [5,4,3,2,1].map(r => ({
    r, count: reviews.filter(rv => rv.rating === r).length
  }));

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      {/* Breadcrumb */}
      <div style={{background:'#fff', borderBottom:'1px solid #e8e8e8'}} className="py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 text-xs text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <ChevronRight size={12}/>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-orange-500 capitalize">
                {product.category.name}
              </Link>
              <ChevronRight size={12}/>
            </>
          )}
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
        {/* Main product card */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-4 sm:p-6 grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* Images */}
            <div>
              {/* Main image */}
              <div className="relative bg-gray-50 rounded overflow-hidden mb-3 flex items-center justify-center"
                style={{paddingTop:'100%'}}>
                {currentImg ? (
                  <img src={currentImg.image} alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"/>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                    <Package size={64}/>
                  </div>
                )}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 badge-discount text-sm px-2 py-1">-{discount}%</span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className="flex-shrink-0 w-14 h-14 border-2 rounded overflow-hidden transition-all"
                      style={{borderColor: i === imgIdx ? '#f68b1e' : '#e8e8e8'}}>
                      <img src={img.image} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col gap-4">
              {/* Store */}
              {product.store && (
                <Link to={`/stores/${product.store.slug}`}
                  className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1">
                  <Store size={12}/> {product.store.name}
                  {product.store.is_verified && <Check size={11} className="text-green-500"/>}
                </Link>
              )}

              {/* Name */}
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

              {/* Rating summary */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRow rating={avgRating} size={14}/>
                  <span className="text-sm font-bold text-gray-700">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-400">({product.review_count || reviews.length} reviews)</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {inStock ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="py-3 border-y border-gray-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black" style={{color:'#e74c3c'}}>
                    KES {Number(effectivePrice).toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-base text-gray-400 line-through">KES {Number(originalPrice).toLocaleString()}</span>
                      <span className="badge-discount text-sm px-2 py-0.5">Save KES {Number(originalPrice - effectivePrice).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Select Variant</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariant(selectedVariant?.id===v.id ? null : v)}
                        className="px-3 py-1.5 border-2 rounded text-xs font-semibold transition-all"
                        style={{
                          borderColor: selectedVariant?.id===v.id ? '#f68b1e' : '#ddd',
                          background: selectedVariant?.id===v.id ? '#fff3e0' : '#fff',
                          color: selectedVariant?.id===v.id ? '#f68b1e' : '#3d3d3d'
                        }}>
                        {v.name}
                        {v.price && <span className="ml-1 opacity-70">KES {Number(v.price).toLocaleString()}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-600 uppercase">Qty</span>
                <div className="flex items-center border-2 border-gray-200 rounded overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1,q-1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors">
                    <Minus size={14}/>
                  </button>
                  <span className="px-5 py-2 font-black text-base border-x border-gray-200 min-w-[50px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors">
                    <Plus size={14}/>
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2">
                <button onClick={() => handleAddToCart(false)} disabled={adding || !inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-bold text-sm transition-all disabled:opacity-40 border-2"
                  style={{borderColor:'#f68b1e', color:'#f68b1e', background:'#fff'}}>
                  <ShoppingCart size={16}/>
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button onClick={() => handleAddToCart(true)} disabled={adding || !inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-bold text-sm transition-all disabled:opacity-40"
                  style={{background:'#f68b1e', color:'#fff'}}>
                  Buy Now
                </button>
                <button onClick={handleWishlist}
                  className="p-3 border-2 rounded transition-all flex-shrink-0"
                  style={{borderColor: wishlisted ? '#e74c3c' : '#ddd', background: wishlisted ? '#fef2f2' : '#fff'}}>
                  <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}/>
                </button>
              </div>

              {/* Trust icons */}
              <div className="grid grid-cols-3 gap-2 border border-gray-100 rounded p-3 bg-gray-50">
                {[
                  {icon:<Truck size={16}/>, label:'Fast Delivery'},
                  {icon:<Shield size={16}/>, label:'Buyer Protection'},
                  {icon:<RefreshCw size={16}/>, label:'Easy Returns'},
                ].map(({icon,label}) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-orange-400">{icon}</span>
                    <span className="text-xs text-gray-500 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded shadow-sm">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              {id:'description', label:'Description'},
              {id:'specs', label:'Specifications'},
              {id:'reviews', label:`Reviews (${reviews.length})`},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-5 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 -mb-px transition-colors"
                style={{
                  borderColor: tab===t.id ? '#f68b1e' : 'transparent',
                  color: tab===t.id ? '#f68b1e' : '#888'
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {tab === 'description' && (
              <div className="prose max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || 'No description available.'}
              </div>
            )}

            {tab === 'specs' && (
              <div>
                {product.attributes?.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {product.attributes.map((attr, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2.5 font-semibold text-gray-600 w-1/3">{attr.name}</td>
                          <td className="px-4 py-2.5 text-gray-800">{attr.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-gray-400 text-sm">No specifications available.</p>}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                {/* Rating overview */}
                {reviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-6 mb-8 p-4 bg-gray-50 rounded">
                    <div className="text-center flex-shrink-0">
                      <div className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</div>
                      <StarRow rating={avgRating} size={18}/>
                      <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {ratingDistrib.map(({r, count}) => (
                        <div key={r} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-gray-500">{r}</span>
                          <Star size={10} className="star-filled flex-shrink-0"/>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-yellow-400 transition-all"
                              style={{width: reviews.length ? `${(count/reviews.length)*100}%` : '0%'}}/>
                          </div>
                          <span className="w-6 text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-4 mb-8">
                  {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
                  ) : reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-50 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
                          style={{background:'#f68b1e'}}>
                          {(r.user_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-800">{r.user_name || 'Anonymous'}</span>
                            {r.is_verified_purchase && (
                              <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                                <Check size={10}/> Verified Purchase
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleDateString('en-KE')}</span>
                          </div>
                          <StarRow rating={r.rating} size={12}/>
                          {r.title && <p className="font-semibold text-sm mt-1">{r.title}</p>}
                          <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Write review */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Rating</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setNewReview(r => ({...r, rating: s}))}>
                              <Star size={24} className={s <= newReview.rating ? 'star-filled' : 'star-empty hover:star-filled'}/>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Title (optional)</label>
                        <input value={newReview.title} onChange={e => setNewReview(r=>({...r,title:e.target.value}))}
                          className="form-input" placeholder="Summary of your review"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Your Review *</label>
                        <textarea value={newReview.comment} onChange={e => setNewReview(r=>({...r,comment:e.target.value}))}
                          className="form-input resize-none" rows={4} required placeholder="Share your experience with this product..."/>
                      </div>
                      <button type="submit" disabled={submittingReview} className="btn-primary">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      <Link to="/login" className="text-orange-500 font-bold hover:underline">Login</Link> to write a review.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="section-header">
              <h2 className="section-title">YOU MAY ALSO LIKE</h2>
              <Link to="/products" className="section-link flex items-center gap-1">See More <ChevronRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-gray-100 p-px">
              {related.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}