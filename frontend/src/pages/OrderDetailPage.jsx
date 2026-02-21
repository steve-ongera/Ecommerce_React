import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, XCircle, ChevronRight, Check } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['pending','confirmed','processing','shipped','delivered'];
const STATUS = {
  pending:    { label:'Pending',    cls:'status-pending' },
  confirmed:  { label:'Confirmed',  cls:'status-confirmed' },
  processing: { label:'Processing', cls:'status-processing' },
  shipped:    { label:'Shipped',    cls:'status-shipped' },
  delivered:  { label:'Delivered',  cls:'status-delivered' },
  cancelled:  { label:'Cancelled',  cls:'status-cancelled' },
};

function Skeleton({ h = '60px' }) {
  return <div className="skeleton rounded" style={{height: h, marginBottom:'8px'}}/>;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.detail(id)
      .then(({data}) => setOrder(data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const {data} = await orderAPI.cancel(id);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.error || 'Cannot cancel'); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {[100,60,80,120,60].map((h,i) => <Skeleton key={i} h={`${h}px`}/>)}
    </div>
  );
  if (!order) return null;

  const s = STATUS[order.status] || {label:order.status, cls:'status-pending'};
  const stepIdx = STEPS.indexOf(order.status);
  const addr = order.shipping_address_detail;

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6 space-y-3">
        {/* Header */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <Link to="/orders" className="hover:text-orange-500">Orders</Link>
                <ChevronRight size={12}/>
                <span>{order.order_number}</span>
              </div>
              <h1 className="font-black text-lg text-gray-900">{order.order_number}</h1>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleString('en-KE', {weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.payment_status==='paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.payment_status === 'paid' ? '✓ Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        {!['cancelled','refunded'].includes(order.status) && (
          <div className="bg-white rounded shadow-sm p-5">
            <h2 className="font-black text-sm text-gray-900 mb-4">ORDER PROGRESS</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200"/>
              <div className="absolute left-0 top-4 h-0.5 bg-green-400 transition-all"
                style={{width: `${Math.max(0, stepIdx / (STEPS.length-1) * 100)}%`}}/>
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                    i < stepIdx ? 'bg-green-400 border-green-400 text-white' :
                    i === stepIdx ? 'border-orange-400 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`} style={i===stepIdx ? {background:'#f68b1e'} : {}}>
                    {i < stepIdx ? <Check size={14}/> : i+1}
                  </div>
                  <span className={`text-xs capitalize text-center leading-tight ${
                    i <= stepIdx ? 'font-bold text-gray-800' : 'text-gray-400'
                  }`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-black text-sm text-gray-900 mb-3 flex items-center gap-2">
            <Package size={16} style={{color:'#f68b1e'}}/> ITEMS ({order.items?.length})
          </h2>
          <div className="divide-y divide-gray-50">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × KES {Number(item.unit_price).toLocaleString()}</p>
                </div>
                <p className="font-black text-sm text-gray-900 flex-shrink-0">KES {Number(item.subtotal).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {addr && (
          <div className="bg-white rounded shadow-sm p-4">
            <h2 className="font-black text-sm text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={16} style={{color:'#f68b1e'}}/> DELIVERY ADDRESS
            </h2>
            <p className="text-sm font-bold text-gray-900">{addr.full_name}</p>
            <p className="text-sm text-gray-600">{addr.street}</p>
            <p className="text-sm text-gray-600">{addr.town}, {addr.county}</p>
            <p className="text-sm text-gray-400">{addr.phone}</p>
          </div>
        )}

        {/* Payment summary */}
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="font-black text-sm text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={16} style={{color:'#f68b1e'}}/> PAYMENT SUMMARY
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="capitalize font-semibold">{order.payment_method?.replace('_',' ')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>KES {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{Number(order.shipping_fee) === 0 ? <span className="text-green-600 font-bold">FREE</span> : `KES ${Number(order.shipping_fee).toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between font-black text-base border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span style={{color:'#e74c3c'}}>KES {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {['pending','confirmed'].includes(order.status) && (
            <button onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-300 text-red-500 rounded font-bold text-sm hover:bg-red-50 transition-colors">
              <XCircle size={16}/> Cancel Order
            </button>
          )}
          <Link to="/products"
            className="flex-1 flex items-center justify-center py-3 border border-gray-200 rounded font-bold text-sm hover:bg-gray-50 text-gray-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}