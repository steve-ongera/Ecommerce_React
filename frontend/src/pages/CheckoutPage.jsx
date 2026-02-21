import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Plus, CheckCircle, XCircle, Loader, MapPin, ChevronRight, CreditCard, Package } from 'lucide-react';
import { addressAPI, orderAPI, mpesaAPI, couponAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 0, label: 'Delivery' },
  { id: 1, label: 'Payment' },
  { id: 2, label: 'Confirm' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center py-4 px-4 bg-white shadow-sm mb-4">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              i < current ? 'bg-green-500 text-white' : i === current ? 'text-white' : 'bg-gray-200 text-gray-500'
            }`} style={i === current ? {background:'#f68b1e'} : {}}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-bold hidden sm:block ${i === current ? 'text-orange-600' : i < current ? 'text-green-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 max-w-16" style={{background: i < current ? '#22c55e' : '#e5e7eb'}}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function MpesaModal({ amount, phone, setPhone, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100 text-center" style={{background:'#f68b1e', borderRadius:'8px 8px 0 0'}}>
          <Smartphone size={32} className="mx-auto text-white mb-2"/>
          <h2 className="text-white font-black text-lg">M-Pesa Payment</h2>
          <p className="text-orange-100 text-sm">Lipa na M-Pesa</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-xs text-gray-500">Amount to Pay</p>
            <p className="text-2xl font-black text-gray-900">KES {Number(amount).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">M-Pesa Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="form-input" placeholder="07XXXXXXXX or 2547XXXXXXXX" type="tel"/>
            <p className="text-xs text-gray-400 mt-1">You will receive a push notification on this number</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 btn-outline py-3">Cancel</button>
            <button onClick={onConfirm} disabled={loading || !phone.trim()}
              className="flex-1 btn-primary py-3 disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <Loader size={16} className="animate-spin"/> : <Smartphone size={16}/>}
              {loading ? 'Sending...' : 'Send STK Push'}
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm text-center p-8">
        {status === 'polling' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'#fff3e0'}}>
              <Loader size={40} className="animate-spin" style={{color:'#f68b1e'}}/>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Waiting for Payment</h2>
            <p className="text-gray-500 text-sm mb-2">Check your phone for the M-Pesa prompt</p>
            <p className="text-gray-400 text-xs">Enter your PIN to complete payment</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{background:'#f68b1e', animationDelay:`${i*0.2}s`}}/>
              ))}
            </div>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500"/>
            <h2 className="text-xl font-black text-green-700 mb-2">Payment Successful! 🎉</h2>
            <p className="text-gray-500 text-sm mb-1">Order #{orderNumber}</p>
            <p className="text-gray-400 text-xs mb-6">Your order has been confirmed and is being processed</p>
            <button onClick={() => navigate(`/orders/${orderId}`)} className="btn-primary w-full py-3">
              Track My Order
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle size={64} className="mx-auto mb-4 text-red-400"/>
            <h2 className="text-xl font-black text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-4">The payment was not completed or was cancelled.</p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/orders')} className="flex-1 btn-outline py-3 text-sm">My Orders</button>
              <button onClick={() => window.location.reload()} className="flex-1 btn-primary py-3 text-sm">Try Again</button>
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
  const [newAddr, setNewAddr] = useState({full_name:'',phone:'',county:'',town:'',street:'',is_default:false});
  const pollRef = useRef(null);

  useEffect(() => {
    addressAPI.list().then(({data}) => {
      setAddresses(data);
      const def = data.find(a => a.is_default) || data[0];
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
    } catch { toast.error('Failed to save address'); }
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
    if (!selectedAddr) { toast.error('Select delivery address'); return; }
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
    } finally { setLoading(false); }
  };

  const handleMpesaPay = async () => {
    if (!mpesaPhone.trim()) { toast.error('Enter M-Pesa phone number'); return; }
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
    } finally { setLoading(false); }
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
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <StepIndicator current={step}/>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          {/* Left flow */}
          <div className="lg:col-span-2 space-y-3 mb-4 lg:mb-0">

            {/* Step 0: Address */}
            <div className={`bg-white rounded shadow-sm ${step > 0 ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black" style={{background:'#f68b1e'}}>1</div>
                  DELIVERY ADDRESS
                </h2>
                {step > 0 && (
                  <button onClick={() => setStep(0)} className="text-xs text-orange-500 font-bold hover:underline">Change</button>
                )}
              </div>
              <div className={`p-4 ${step > 0 ? 'pointer-events-none' : ''}`}>
                {step === 0 ? (
                  <>
                    <div className="space-y-2 mb-3">
                      {addresses.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No addresses saved. Add one below.</p>
                      )}
                      {addresses.map(a => (
                        <label key={a.id}
                          className={`flex items-start gap-3 p-3 border-2 rounded cursor-pointer transition-all ${selectedAddr===a.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                          <input type="radio" name="addr" value={a.id} checked={selectedAddr===a.id}
                            onChange={() => setSelectedAddr(a.id)} className="mt-1 accent-orange-500"/>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{a.full_name}</p>
                            <p className="text-xs text-gray-600">{a.street}, {a.town}, {a.county}</p>
                            <p className="text-xs text-gray-400">{a.phone}</p>
                          </div>
                          {a.is_default && <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded flex-shrink-0">DEFAULT</span>}
                        </label>
                      ))}
                    </div>

                    {showAddrForm ? (
                      <form onSubmit={handleSaveAddr} className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-3">
                          {[['full_name','Full Name*'],['phone','Phone*'],['county','County*'],['town','Town/City*']].map(([f,l]) => (
                            <div key={f}>
                              <label className="text-xs font-bold text-gray-600 mb-0.5 block">{l}</label>
                              <input value={newAddr[f]} onChange={e=>setNewAddr({...newAddr,[f]:e.target.value})}
                                className="form-input py-2 text-sm" required/>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-0.5 block">Street Address*</label>
                          <input value={newAddr.street} onChange={e=>setNewAddr({...newAddr,street:e.target.value})}
                            className="form-input py-2 text-sm" required/>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary px-5 py-2 text-sm">Save Address</button>
                          <button type="button" onClick={()=>setShowAddrForm(false)} className="btn-outline px-5 py-2 text-sm">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={()=>setShowAddrForm(true)}
                        className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 mt-2">
                        <Plus size={16}/> Add New Address
                      </button>
                    )}

                    <button onClick={() => setStep(1)} disabled={!selectedAddr}
                      className="mt-4 btn-primary w-full py-3 disabled:opacity-40">
                      Continue to Payment
                    </button>
                  </>
                ) : addr && (
                  <div className="text-sm text-gray-700">
                    <p className="font-bold">{addr.full_name}</p>
                    <p className="text-gray-500">{addr.street}, {addr.town}, {addr.county} · {addr.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1: Payment */}
            {step >= 1 && (
              <div className={`bg-white rounded shadow-sm ${step > 1 ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black" style={{background:'#f68b1e'}}>2</div>
                    PAYMENT METHOD
                  </h2>
                  {step > 1 && <button onClick={() => setStep(1)} className="text-xs text-orange-500 font-bold hover:underline">Change</button>}
                </div>
                <div className={`p-4 ${step > 1 ? 'pointer-events-none' : ''}`}>
                  {step === 1 ? (
                    <>
                      <div className="space-y-2 mb-4">
                        {[
                          {id:'mpesa', label:'M-Pesa', sub:'STK Push – pay directly from your phone', emoji:'📱'},
                          {id:'cash_on_delivery', label:'Cash on Delivery', sub:'Pay when your order arrives', emoji:'💵'},
                        ].map(pm => (
                          <label key={pm.id}
                            className={`flex items-center gap-3 p-3.5 border-2 rounded cursor-pointer transition-all ${paymentMethod===pm.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                            <input type="radio" name="payment" value={pm.id} checked={paymentMethod===pm.id}
                              onChange={() => setPaymentMethod(pm.id)} className="accent-orange-500"/>
                            <span className="text-xl flex-shrink-0">{pm.emoji}</span>
                            <div>
                              <p className="font-bold text-sm">{pm.label}</p>
                              <p className="text-xs text-gray-400">{pm.sub}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button onClick={() => setStep(2)} className="btn-primary w-full py-3">
                        Review Order
                      </button>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700">
                      {paymentMethod === 'mpesa' ? '📱 M-Pesa (STK Push)' : '💵 Cash on Delivery'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step >= 2 && (
              <div className="bg-white rounded shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black" style={{background:'#f68b1e'}}>3</div>
                    REVIEW & CONFIRM
                  </h2>
                </div>
                <div className="p-4">
                  <div className="bg-gray-50 rounded p-3 mb-4 text-sm space-y-1">
                    <p><span className="font-bold text-gray-600">Deliver to:</span> {addr?.full_name} – {addr?.town}, {addr?.county}</p>
                    <p><span className="font-bold text-gray-600">Payment:</span> {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</p>
                    <p><span className="font-bold text-gray-600">Items:</span> {cart?.item_count} items</p>
                    <p><span className="font-bold text-gray-600">Total:</span> <span style={{color:'#e74c3c'}} className="font-black">KES {grandTotal.toLocaleString()}</span></p>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="w-full py-4 rounded font-black text-base text-white flex items-center justify-center gap-2 transition-all"
                    style={{background: loading ? '#ccc' : '#27ae60'}}>
                    {loading ? <Loader size={20} className="animate-spin"/> : <Package size={20}/>}
                    {loading ? 'Placing Order...' : `Place Order – KES ${grandTotal.toLocaleString()}`}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                    🔒 Your payment is 100% secure
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-sm sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-black text-sm text-gray-900">ORDER SUMMARY</h3>
              </div>
              <div className="p-4">
                {/* Items list */}
                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                  {cart?.items?.map(item => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product?.primary_image
                          ? <img src={item.product.primary_image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 flex-shrink-0">KES {Number(item.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-1.5 mb-4">
                  <input value={couponCode} onChange={e=>setCouponCode(e.target.value)}
                    placeholder="Coupon code" className="form-input py-2 text-sm flex-1"/>
                  <button onClick={handleApplyCoupon}
                    className="px-3 py-2 text-xs font-bold text-white rounded flex-shrink-0"
                    style={{background:'#3d3d3d'}}>
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  {couponResult && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span className="flex items-center gap-1"><Tag size={12}/> Discount</span>
                      <span>-KES {Number(couponResult.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    {shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : <span>KES {shipping}</span>}
                  </div>
                  <div className="flex justify-between font-black text-base border-t border-gray-100 pt-2 mt-2">
                    <span>Total</span>
                    <span style={{color:'#e74c3c'}}>KES {grandTotal.toLocaleString()}</span>
                  </div>
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