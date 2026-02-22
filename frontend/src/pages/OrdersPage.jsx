import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/orders.css'; // Import the new CSS file

const STATUS = {
  pending:    { label: 'Pending',    cls: 'status-pending' },
  confirmed:  { label: 'Confirmed',  cls: 'status-confirmed' },
  processing: { label: 'Processing', cls: 'status-processing' },
  shipped:    { label: 'Shipped',    cls: 'status-shipped' },
  delivered:  { label: 'Delivered',  cls: 'status-delivered' },
  cancelled:  { label: 'Cancelled',  cls: 'status-cancelled' },
  refunded:   { label: 'Refunded',   cls: 'status-cancelled' },
};

function Skeleton() {
  return <div className="orders-skeleton" />;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    orderAPI.list()
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="orders-container">
      <div className="orders-skeleton-title" />
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          
          {/* Filter tabs */}
          <div className="orders-filters">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`orders-filter-btn ${filter === f ? 'orders-filter-btn--active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <i className="bi bi-bag"></i>
            </div>
            <h2 className="orders-empty-title">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="orders-empty-text">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary orders-empty-btn">
              <i className="bi bi-shop"></i> Shop Now
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map(order => {
              const s = STATUS[order.status] || { label: order.status, cls: 'status-pending' };
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="orders-card">
                  <div className="orders-card-icon">
                    <i className="bi bi-box"></i>
                  </div>
                  
                  <div className="orders-card-content">
                    <div className="orders-card-header">
                      <span className="orders-card-number">{order.order_number}</span>
                      <span className={`orders-card-status ${s.cls}`}>{s.label}</span>
                      {order.payment_status === 'paid' && (
                        <span className="orders-card-status orders-card-status--paid">
                          <i className="bi bi-check-circle"></i> PAID
                        </span>
                      )}
                    </div>
                    <p className="orders-card-meta">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="orders-card-right">
                    <span className="orders-card-total">
                      KES {Number(order.total).toLocaleString()}
                    </span>
                    <i className="bi bi-chevron-right orders-card-arrow"></i>
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