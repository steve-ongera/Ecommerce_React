import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [addingCart, setAddingCart] = useState(false);
  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setAddingCart(true);
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!', { icon: '🛒' });
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingCart(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await toggleWishlist(product.id);
      toast.success(res?.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Error'); }
  };

  const effectivePrice = product.discounted_price || product.effective_price || product.price;
  const originalPrice = product.price;
  const discount = product.discount_percent || 0;
  const rating = parseFloat(product.rating || product.avg_rating || 0);
  const reviewCount = product.review_count || 0;
  const inStock = product.stock > 0 || product.in_stock !== false;

  return (
    <div className="product-card group bg-white">
      <Link to={`/products/${product.slug || product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{paddingTop:'100%'}}>
          {product.primary_image || product.image ? (
            <img
              src={product.primary_image || product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-200">
              <ShoppingCart size={40}/>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge-discount">-{discount}%</span>
            )}
            {product.is_featured && !discount && (
              <span className="badge-new">BEST</span>
            )}
          </div>

          {/* Flash sale */}
          {product.flash_sale && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1 px-2 py-1 text-white text-xs font-bold"
              style={{background:'rgba(231,76,60,0.9)'}}>
              <Zap size={10} fill="white"/> Flash Deal
            </div>
          )}

          {/* Wishlist btn */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
            style={{opacity: inWishlist ? 1 : undefined}}
          >
            <Heart size={13} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}/>
          </button>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-xs text-gray-800 line-clamp-2 mb-1.5 leading-relaxed" style={{minHeight:'32px'}}>
            {product.name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}/>
                ))}
              </div>
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-black text-sm" style={{color:'#e74c3c'}}>
              KES {Number(effectivePrice).toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-gray-400 text-xs line-through">
                KES {Number(originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Verified store badge */}
          {product.store_name && (
            <p className="text-xs text-gray-400 mt-1 truncate">{product.store_name}</p>
          )}
        </div>
      </Link>

      {/* Add to cart - shown on hover on desktop, always on mobile */}
      <div className="px-3 pb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingCart}
          className="w-full py-2 text-xs font-bold text-white rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          style={{background: inStock ? '#f68b1e' : '#ccc'}}
        >
          <ShoppingCart size={12}/>
          {addingCart ? 'Adding...' : inStock ? 'ADD TO CART' : 'UNAVAILABLE'}
        </button>
      </div>
    </div>
  );
}