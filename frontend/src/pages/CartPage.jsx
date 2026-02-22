import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import '../styles/cart.css'; // Import the new CSS file

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
    <div className="cart-empty">
      <div className="cart-empty-card">
        <div className="cart-empty-icon">
          <i className="bi bi-bag"></i>
        </div>
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p className="cart-empty-text">Browse our products and add items to your cart</p>
        <Link to="/products" className="btn-primary cart-empty-btn">
          Start Shopping
        </Link>
      </div>
    </div>
  );

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 2000 ? 0 : 200;
  const total = Number(subtotal) + shipping;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">
            Shopping Cart <span className="cart-title-count">({cart.item_count} items)</span>
          </h1>
          <button onClick={() => clearCart()} className="cart-clear-btn">
            Clear all
          </button>
        </div>

        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items-section">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/products/${item.product?.slug || item.product?.id}`} className="cart-item-image-link">
                  <div className="cart-item-image">
                    {item.product?.primary_image ? (
                      <img src={item.product.primary_image} alt={item.product.name} />
                    ) : (
                      <div className="cart-item-image-placeholder">
                        <i className="bi bi-box"></i>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="cart-item-details">
                  <Link to={`/products/${item.product?.slug || item.product?.id}`} className="cart-item-name">
                    {item.product?.name}
                  </Link>
                  <p className="cart-item-store">{item.product?.store_name}</p>
                  
                  <div className="cart-item-actions">
                    <span className="cart-item-price">
                      KES {Number(item.unit_price).toLocaleString()}
                    </span>
                    
                    <div className="cart-item-controls">
                      <div className="cart-quantity">
                        <button 
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          className="cart-quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="cart-quantity-value">{item.quantity}</span>
                        <button 
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="cart-quantity-btn"
                          disabled={item.quantity >= item.product?.stock}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      
                      <span className="cart-item-subtotal">
                        KES {Number(item.subtotal).toLocaleString()}
                      </span>
                      
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="cart-item-remove"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/products" className="cart-continue-link">
              <i className="bi bi-arrow-left"></i> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="cart-summary">
            <h2 className="cart-summary-title">ORDER SUMMARY</h2>

            <div className="cart-summary-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-summary-item">
                  <span className="cart-summary-item-name">
                    {item.product?.name} ×{item.quantity}
                  </span>
                  <span className="cart-summary-item-price">
                    KES {Number(item.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-calc">
              <div className="cart-summary-row">
                <span>Subtotal ({cart.item_count} items)</span>
                <span>KES {Number(subtotal).toLocaleString()}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                {shipping === 0 ? (
                  <span className="cart-summary-row--free">
                    <i className="bi bi-check-circle-fill"></i> FREE
                  </span>
                ) : (
                  <span>KES {shipping.toLocaleString()}</span>
                )}
              </div>
              
              {shipping === 0 && (
                <p className="cart-delivery-free">
                  <i className="bi bi-truck"></i> You qualify for free delivery!
                </p>
              )}
              
              {shipping > 0 && (
                <p className="cart-delivery-more">
                  Add KES {(2000 - Number(subtotal)).toLocaleString()} more for free delivery
                </p>
              )}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-amount">KES {total.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="btn-primary cart-checkout-btn"
            >
              Proceed to Checkout <i className="bi bi-arrow-right"></i>
            </button>

            {/* Trust */}
            <div className="cart-trust">
              <span className="cart-trust-item">
                <i className="bi bi-lock"></i> Secure Checkout
              </span>
              <span className="cart-trust-item">
                <i className="bi bi-phone"></i> M-Pesa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}