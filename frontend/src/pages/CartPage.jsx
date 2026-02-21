import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else navigate('/checkout');
  };

  if (!cart?.items?.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20" style={{background:'#f5f5f5'}}>
      <div className="bg-white rounded shadow-sm p-10 text-center max-w-sm w-full">
        <ShoppingBag size={64} className="mx-auto mb-4" style={{color:'#ddd'}}/>
        <h2 className="text-xl font-black text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Browse our products and add items to your cart</p>
        <Link to="/products" className="btn-primary inline-block px-8 py-3">Start Shopping</Link>
      </div>
    </div>
  );

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 2000 ? 0 : 200;
  const total = Number(subtotal) + shipping;

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-gray-900">
            Shopping Cart <span className="text-gray-400 font-semibold text-base">({cart.item_count} items)</span>
          </h1>
          <button onClick={() => clearCart()} className="text-sm text-red-400 hover:text-red-600 hover:underline">
            Clear all
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-2 mb-4 lg:mb-0">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white rounded shadow-sm p-3 flex gap-3">
                <Link to={`/products/${item.product?.slug || item.product?.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded overflow-hidden border border-gray-100">
                    {item.product?.primary_image ? (
                      <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover"/>
                    ) : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200">📦</div>}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?.slug || item.product?.id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-orange-500 leading-snug">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product?.store_name}</p>
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <span className="font-black text-sm" style={{color:'#e74c3c'}}>
                      KES {Number(item.unit_price).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-500 transition-colors">
                          <Minus size={12}/>
                        </button>
                        <span className="px-3 py-1.5 font-black text-sm border-x border-gray-200 min-w-[36px] text-center">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-500 transition-colors">
                          <Plus size={12}/>
                        </button>
                      </div>
                      <span className="font-black text-sm text-gray-900">
                        KES {Number(item.subtotal).toLocaleString()}
                      </span>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/products" className="block text-center py-3 bg-white rounded shadow-sm text-sm text-orange-500 font-semibold hover:bg-orange-50 transition-colors border border-orange-200">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-sm p-4 sticky top-24">
              <h2 className="font-black text-base text-gray-900 mb-4 pb-3 border-b border-gray-100">ORDER SUMMARY</h2>

              <div className="space-y-2 mb-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate mr-2 max-w-[140px]">{item.product?.name} ×{item.quantity}</span>
                    <span className="font-semibold flex-shrink-0">KES {Number(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-3 border-y border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.item_count} items)</span>
                  <span>KES {Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  {shipping === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span>KES {shipping.toLocaleString()}</span>
                  }
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    ✓ You qualify for free delivery!
                  </p>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">
                    Add KES {(2000 - Number(subtotal)).toLocaleString()} more for free delivery
                  </p>
                )}
              </div>

              <div className="flex justify-between font-black text-base py-3 mb-4">
                <span>Total</span>
                <span style={{color:'#e74c3c'}}>KES {total.toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base">
                Proceed to Checkout <ArrowRight size={18}/>
              </button>

              {/* Trust */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>🔒 Secure Checkout</span>
                <span>📱 M-Pesa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}