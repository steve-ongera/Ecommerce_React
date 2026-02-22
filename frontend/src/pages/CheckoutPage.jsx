import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addressAPI, orderAPI, mpesaAPI, couponAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import '../styles/checkout.css'; // Import the new CSS file

const STEPS = [
  { id: 0, label: 'Delivery' },
  { id: 1, label: 'Payment' },
  { id: 2, label: 'Confirm' },
];

function StepIndicator({ current }) {
  return (
    <div className="checkout-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="checkout-step">
            <div className={`checkout-step-circle ${
              i < current ? 'checkout-step-circle--completed' : 
              i === current ? 'checkout-step-circle--current' : 
              'checkout-step-circle--pending'
            }`}>
              {i < current ? <i className="bi bi-check"></i> : i + 1}
            </div>
            <span className={`checkout-step-label ${
              i === current ? 'checkout-step-label--current' : 
              i < current ? 'checkout-step-label--completed' : 
              'checkout-step-label--pending'
            }`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`checkout-step-connector ${
              i < current ? 'checkout-step-connector--completed' : 'checkout-step-connector--pending'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function MpesaModal({ amount, phone, setPhone, onConfirm, onClose, loading }) {
  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <div className="checkout-modal-header">
          <i className="bi bi-phone"></i>
          <h2 className="checkout-modal-title">M-Pesa Payment</h2>
          <p className="checkout-modal-subtitle">Lipa na M-Pesa</p>
        </div>
        <div className="checkout-modal-body">
          <div className="checkout-modal-amount">
            <p className="checkout-modal-amount-label">Amount to Pay</p>
            <p className="checkout-modal-amount-value">KES {Number(amount).toLocaleString()}</p>
          </div>
          <div className="checkout-modal-field">
            <label>M-Pesa Phone Number</label>
            <input 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="form-input" 
              placeholder="07XXXXXXXX or 2547XXXXXXXX" 
              type="tel"
            />
            <p className="checkout-modal-hint">You will receive a push notification on this number</p>
          </div>
          <div className="checkout-modal-actions">
            <button onClick={onClose} className="btn-outline checkout-modal-btn">Cancel</button>
            <button 
              onClick={onConfirm} 
              disabled={loading || !phone.trim()}
              className="btn-primary checkout-modal-btn disabled:opacity-40"
            >
              {loading ? (
                <><i className="bi bi-arrow-repeat spin"></i> Sending...</>
              ) : (
                <><i className="bi bi-phone"></i> Send STK Push</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusModal({ status, orderNumber, orderId }) {
  const navigate = useNavigate();
  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-status-modal">
        {status === 'polling' && (
          <>
            <div className="checkout-status-icon checkout-status-icon--polling">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h2 className="checkout-status-title checkout-status-title--polling">Waiting for Payment</h2>
            <p className="checkout-status-message">Check your phone for the M-Pesa prompt</p>
            <p className="checkout-status-submessage">Enter your PIN to complete payment</p>
            <div className="checkout-status-dots">
              <div className="checkout-status-dot"></div>
              <div className="checkout-status-dot"></div>
              <div className="checkout-status-dot"></div>
            </div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="checkout-status-icon checkout-status-icon--success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2 className="checkout-status-title checkout-status-title--success">Payment Successful! 🎉</h2>
            <p className="checkout-status-message">Order #{orderNumber}</p>
            <p className="checkout-status-submessage mb-4">Your order has been confirmed and is being processed</p>
            <button onClick={() => navigate(`/orders/${orderId}`)} className="btn-primary w-full">
              Track My Order
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="checkout-status-icon checkout-status-icon--failed">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <h2 className="checkout-status-title checkout-status-title--failed">Payment Failed</h2>
            <p className="checkout-status-message mb-4">The payment was not completed or was cancelled.</p>
            <div className="checkout-status-actions">
              <button onClick={() => navigate('/orders')} className="btn-outline checkout-status-btn">My Orders</button>
              <button onClick={() => window.location.reload()} className="btn-primary checkout-status-btn">Try Again</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone_number || '');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [order, setOrder] = useState(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({full_name:'', phone:'', county:'', town:'', street:'', is_default:false});
  const pollRef = useRef(null);

  useEffect(() => {
    addressAPI.list().then(({data}) => {
      // Handle paginated response or plain array
      const list = Array.isArray(data) ? data : (data.results || []);
      setAddresses(list);
      const def = list.find(a => a.is_default) || list[0];
      if (def) setSelectedAddr(def.id);
    });
  }, []);

  const handleSaveAddr = async (e) => {
    e.preventDefault();
    try {
      const {data} = await addressAPI.create({...newAddr, is_default: addresses.length === 0});
      setAddresses(prev => [...prev, data]);
      setSelectedAddr(data.id);
      setShowAddrForm(false);
      toast.success('Address saved!');
    } catch { 
      toast.error('Failed to save address'); 
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const {data} = await couponAPI.validate({code: couponCode, order_amount: cart.total});
      setCouponResult(data);
      toast.success(`Coupon applied! Save KES ${Number(data.discount_amount).toLocaleString()}`);
    } catch (err) {
      setCouponResult(null);
      toast.error(err.response?.data?.error || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { 
      toast.error('Select delivery address'); 
      return; 
    }
    setLoading(true);
    try {
      const {data} = await orderAPI.create({
        shipping_address_id: selectedAddr,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
      });
      setOrder(data);
      if (paymentMethod === 'mpesa') {
        setShowMpesaModal(true);
      } else {
        toast.success('Order placed! Pay on delivery.');
        fetchCart();
        navigate(`/orders/${data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { 
      setLoading(false); 
    }
  };

  const handleMpesaPay = async () => {
    if (!mpesaPhone.trim()) { 
      toast.error('Enter M-Pesa phone number'); 
      return; 
    }
    setLoading(true);
    try {
      const {data} = await mpesaAPI.stkPush({
        phone_number: mpesaPhone,
        amount: Math.ceil(Number(grandTotal)),
        order_id: order.id,
      });
      setShowMpesaModal(false);
      setPaymentStatus('polling');
      toast.success('Check your phone! 📱');
      startPolling(data.checkout_request_id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'M-Pesa failed. Try again.');
    } finally { 
      setLoading(false); 
    }
  };

  const startPolling = (checkoutId) => {
    let attempts = 0;
    const max = 24;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const {data} = await mpesaAPI.status(checkoutId);
        if (data.status === 'success') {
          clearInterval(pollRef.current);
          setPaymentStatus('success');
          fetchCart();
        } else if (['failed','cancelled','timeout'].includes(data.status)) {
          clearInterval(pollRef.current);
          setPaymentStatus('failed');
        } else if (attempts >= max) {
          clearInterval(pollRef.current);
          setPaymentStatus('failed');
        }
      } catch {}
    }, 5000);
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  const discount = couponResult ? Number(couponResult.discount_amount) : 0;
  const subtotal = Number(cart?.total || 0);
  const shipping = subtotal - discount >= 2000 ? 0 : 200;
  const grandTotal = subtotal - discount + shipping;

  const addr = addresses.find(a => a.id === selectedAddr);

  return (
    <div className="checkout-page">
      <StepIndicator current={step}/>

      <div className="checkout-container">
        <div className="checkout-grid">
          {/* Left flow */}
          <div className="space-y-3">
            {/* Step 0: Address */}
            <div className={`checkout-section ${step > 0 ? 'checkout-section--completed' : ''}`}>
              <div className="checkout-section-header">
                <h2 className="checkout-section-title">
                  <div className="checkout-section-number">1</div>
                  DELIVERY ADDRESS
                </h2>
                {step > 0 && (
                  <button onClick={() => setStep(0)} className="checkout-section-change">
                    Change
                  </button>
                )}
              </div>
              <div className={`checkout-section-content ${step > 0 ? 'checkout-section-content--disabled' : ''}`}>
                {step === 0 ? (
                  <>
                    <div className="checkout-address-list">
                      {addresses.length === 0 && (
                        <p className="checkout-address-empty">No addresses saved. Add one below.</p>
                      )}
                      {addresses.map(a => (
                        <label key={a.id} className={`checkout-address-card ${selectedAddr === a.id ? 'checkout-address-card--selected' : ''}`}>
                          <input 
                            type="radio" 
                            name="addr" 
                            value={a.id} 
                            checked={selectedAddr === a.id}
                            onChange={() => setSelectedAddr(a.id)} 
                            className="checkout-address-radio"
                          />
                          <div className="checkout-address-details">
                            <p className="checkout-address-name">{a.full_name}</p>
                            <p className="checkout-address-line">{a.street}, {a.town}, {a.county}</p>
                            <p className="checkout-address-phone">{a.phone}</p>
                          </div>
                          {a.is_default && (
                            <span className="checkout-address-badge">DEFAULT</span>
                          )}
                        </label>
                      ))}
                    </div>

                    {showAddrForm ? (
                      <form onSubmit={handleSaveAddr} className="checkout-address-form">
                        <div className="checkout-address-form-grid">
                          {[
                            ['full_name', 'Full Name*'],
                            ['phone', 'Phone*'],
                            ['county', 'County*'],
                            ['town', 'Town/City*']
                          ].map(([field, label]) => (
                            <div key={field} className="checkout-address-form-field">
                              <label className="checkout-address-form-label">{label}</label>
                              <input 
                                value={newAddr[field]} 
                                onChange={e => setNewAddr({...newAddr, [field]: e.target.value})}
                                className="form-input checkout-address-form-input" 
                                required={field !== 'phone' ? true : field === 'phone'}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="checkout-address-form-field">
                          <label className="checkout-address-form-label">Street Address*</label>
                          <input 
                            value={newAddr.street} 
                            onChange={e => setNewAddr({...newAddr, street: e.target.value})}
                            className="form-input checkout-address-form-input" 
                            required
                          />
                        </div>
                        <div className="checkout-address-form-actions">
                          <button type="submit" className="btn-primary">Save Address</button>
                          <button type="button" onClick={() => setShowAddrForm(false)} className="btn-outline">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setShowAddrForm(true)} className="checkout-add-address-btn">
                        <i className="bi bi-plus"></i> Add New Address
                      </button>
                    )}

                    <button 
                      onClick={() => setStep(1)} 
                      disabled={!selectedAddr}
                      className="btn-primary checkout-continue-btn"
                    >
                      Continue to Payment
                    </button>
                  </>
                ) : addr && (
                  <div className="checkout-address-summary">
                    <p className="checkout-address-summary-name">{addr.full_name}</p>
                    <p className="checkout-address-summary-details">
                      {addr.street}, {addr.town}, {addr.county} · {addr.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1: Payment */}
            {step >= 1 && (
              <div className={`checkout-section ${step > 1 ? 'checkout-section--completed' : ''}`}>
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title">
                    <div className="checkout-section-number">2</div>
                    PAYMENT METHOD
                  </h2>
                  {step > 1 && (
                    <button onClick={() => setStep(1)} className="checkout-section-change">
                      Change
                    </button>
                  )}
                </div>
                <div className={`checkout-section-content ${step > 1 ? 'checkout-section-content--disabled' : ''}`}>
                  {step === 1 ? (
                    <>
                      <div className="checkout-payment-list">
                        {[
                          {id: 'mpesa', label: 'M-Pesa', sub: 'STK Push – pay directly from your phone', emoji: '📱'},
                          {id: 'cash_on_delivery', label: 'Cash on Delivery', sub: 'Pay when your order arrives', emoji: '💵'},
                        ].map(pm => (
                          <label key={pm.id} className={`checkout-payment-card ${paymentMethod === pm.id ? 'checkout-payment-card--selected' : ''}`}>
                            <input 
                              type="radio" 
                              name="payment" 
                              value={pm.id} 
                              checked={paymentMethod === pm.id}
                              onChange={() => setPaymentMethod(pm.id)} 
                              className="checkout-payment-radio"
                            />
                            <span className="checkout-payment-emoji">{pm.emoji}</span>
                            <div className="checkout-payment-details">
                              <p className="checkout-payment-label">{pm.label}</p>
                              <p className="checkout-payment-description">{pm.sub}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button onClick={() => setStep(2)} className="btn-primary w-full">
                        Review Order
                      </button>
                    </>
                  ) : (
                    <p className="checkout-payment-summary">
                      {paymentMethod === 'mpesa' ? '📱 M-Pesa (STK Push)' : '💵 Cash on Delivery'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step >= 2 && (
              <div className="checkout-section">
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title">
                    <div className="checkout-section-number">3</div>
                    REVIEW & CONFIRM
                  </h2>
                </div>
                <div className="checkout-section-content">
                  <div className="checkout-review-box">
                    <div className="checkout-review-row">
                      <span className="checkout-review-label">Deliver to:</span>
                      <span className="checkout-review-value">{addr?.full_name} – {addr?.town}, {addr?.county}</span>
                    </div>
                    <div className="checkout-review-row">
                      <span className="checkout-review-label">Payment:</span>
                      <span className="checkout-review-value">{paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</span>
                    </div>
                    <div className="checkout-review-row">
                      <span className="checkout-review-label">Items:</span>
                      <span className="checkout-review-value">{cart?.item_count} items</span>
                    </div>
                    <div className="checkout-review-row">
                      <span className="checkout-review-label">Total:</span>
                      <span className="checkout-review-value checkout-review-total">KES {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={loading}
                    className="checkout-place-order-btn"
                  >
                    {loading ? (
                      <><i className="bi bi-arrow-repeat spin"></i> Placing Order...</>
                    ) : (
                      <><i className="bi bi-box"></i> Place Order – KES {grandTotal.toLocaleString()}</>
                    )}
                  </button>
                  <p className="checkout-secure-badge">
                    <i className="bi bi-lock"></i> Your payment is 100% secure
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="checkout-summary">
            <div className="checkout-summary-header">
              <h3>ORDER SUMMARY</h3>
            </div>
            <div className="checkout-summary-content">
              {/* Items list */}
              <div className="checkout-summary-items">
                {cart?.items?.map(item => (
                  <div key={item.id} className="checkout-summary-item">
                    <div className="checkout-summary-item-image">
                      {item.product?.primary_image ? (
                        <img src={item.product.primary_image} alt="" />
                      ) : (
                        <div className="checkout-summary-item-image-placeholder">
                          <i className="bi bi-box"></i>
                        </div>
                      )}
                    </div>
                    <div className="checkout-summary-item-details">
                      <p className="checkout-summary-item-name">{item.product?.name}</p>
                      <p className="checkout-summary-item-quantity">×{item.quantity}</p>
                    </div>
                    <span className="checkout-summary-item-price">
                      KES {Number(item.subtotal).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="checkout-coupon">
                <input 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Coupon code" 
                  className="form-input checkout-coupon-input"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="checkout-coupon-btn"
                >
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                {couponResult && (
                  <div className="checkout-total-row checkout-total-row--discount">
                    <span className="checkout-discount-icon">
                      <i className="bi bi-tag"></i> Discount
                    </span>
                    <span>-KES {Number(couponResult.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="checkout-total-row">
                  <span>Delivery</span>
                  {shipping === 0 ? (
                    <span className="checkout-total-row--free">
                      <i className="bi bi-check-circle-fill"></i> FREE
                    </span>
                  ) : (
                    <span>KES {shipping}</span>
                  )}
                </div>
                <div className="checkout-total-row checkout-total-row--grand">
                  <span>Total</span>
                  <span className="checkout-grand-total">KES {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa Modal */}
      {showMpesaModal && (
        <MpesaModal
          amount={grandTotal}
          phone={mpesaPhone}
          setPhone={setMpesaPhone}
          onConfirm={handleMpesaPay}
          onClose={() => setShowMpesaModal(false)}
          loading={loading}
        />
      )}

      {/* Payment Status Modal */}
      {paymentStatus && (
        <PaymentStatusModal
          status={paymentStatus}
          orderNumber={order?.order_number}
          orderId={order?.id}
        />
      )}
    </div>
  );
}