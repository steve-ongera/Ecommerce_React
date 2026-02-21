import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending:    { label:'Pending',    cls:'status-pending' },
  confirmed:  { label:'Confirmed',  cls:'status-confirmed' },
  processing: { label:'Processing', cls:'status-processing' },
  shipped:    { label:'Shipped',    cls:'status-shipped' },
  delivered:  { label:'Delivered',  cls:'status-delivered' },
  cancelled:  { label:'Cancelled',  cls:'status-cancelled' },
  refunded:   { label:'Refunded',   cls:'status-cancelled' },
};

function Skeleton() {
  return <div className="bg-white rounded shadow-sm h-20 skeleton mb-2"/>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    orderAPI.list()
      .then(({data}) => setOrders(data.results || data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="skeleton h-8 w-40 rounded mb-4"/>
      {Array.from({length:4}).map((_,i) => <Skeleton key={i}/>)}
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
        <div className="bg-white rounded shadow-sm mb-4 p-4">
          <h1 className="font-black text-xl text-gray-900 mb-3">My Orders</h1>
          {/* Filter tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" style={{scrollbarWidth:'none'}}>
            {['all','pending','confirmed','processing','shipped','delivered','cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-bold rounded-full capitalize whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: filter===f ? '#f68b1e' : '#f5f5f5',
                  color: filter===f ? '#fff' : '#888'
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded shadow-sm py-16 text-center">
            <ShoppingBag size={56} className="mx-auto mb-4" style={{color:'#ddd'}}/>
            <h2 className="text-lg font-bold text-gray-600 mb-1">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-400 text-sm mb-4">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary inline-block px-8 py-3">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(order => {
              const s = STATUS[order.status] || {label:order.status, cls:'status-pending'};
              return (
                <Link key={order.id} to={`/orders/${order.id}`}>
                  <div className="bg-white rounded shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                      style={{background:'#fff3e0'}}>
                      <Package size={20} style={{color:'#f68b1e'}}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-gray-900">{order.order_number}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                        {order.payment_status === 'paid' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">PAID</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} ·{' '}
                        {new Date(order.created_at).toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric'})}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-sm" style={{color:'#e74c3c'}}>
                        KES {Number(order.total).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}