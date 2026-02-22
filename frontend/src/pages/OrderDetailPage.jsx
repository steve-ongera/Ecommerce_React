import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/order-detail.css'; // Import the new CSS file

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS = {
  pending:    { label: 'Pending',    cls: 'status-pending' },
  confirmed:  { label: 'Confirmed',  cls: 'status-confirmed' },
  processing: { label: 'Processing', cls: 'status-processing' },
  shipped:    { label: 'Shipped',    cls: 'status-shipped' },
  delivered:  { label: 'Delivered',  cls: 'status-delivered' },
  cancelled:  { label: 'Cancelled',  cls: 'status-cancelled' },
};

function Skeleton({ h = '60px' }) {
  return <div className="order-skeleton" style={{ height: h }} />;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.detail(id)
      .then(({ data }) => setOrder(data))
      .catch(() => { 
        toast.error('Order not found'); 
        navigate('/orders'); 
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await orderAPI.cancel(id);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Cannot cancel'); 
    }
  };

  if (loading) return (
    <div className="order-detail-container">
      <Skeleton h="100px" />
      <Skeleton h="60px" />
      <Skeleton h="80px" />
      <Skeleton h="120px" />
      <Skeleton h="60px" />
    </div>
  );
  
  if (!order) return null;

  const s = STATUS[order.status] || { label: order.status, cls: 'status-pending' };
  const stepIdx = STEPS.indexOf(order.status);
  const addr = order.shipping_address_detail;

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        {/* Header */}
        <div className="order-header">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <div className="order-breadcrumb">
                <Link to="/orders" className="order-breadcrumb-link">Orders</Link>
                <i className="bi bi-chevron-right order-breadcrumb-arrow"></i>
                <span className="order-breadcrumb-current">{order.order_number}</span>
              </div>
              <h1 className="order-number">{order.order_number}</h1>
              <p className="order-date">
                {new Date(order.created_at).toLocaleString('en-KE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="order-header-right">
              <span className={`order-status-badge ${s.cls}`}>{s.label}</span>
              <span className={`order-payment-badge ${order.payment_status === 'paid' ? 'order-payment-badge--paid' : 'order-payment-badge--pending'}`}>
                <i className="bi bi-check-circle"></i> {order.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <div className="order-progress">
            <h2 className="order-progress-title">ORDER PROGRESS</h2>
            <div className="order-steps">
              <div className="order-steps-progress-bar" />
              <div 
                className="order-steps-progress-fill" 
                style={{ width: `${Math.max(0, stepIdx / (STEPS.length - 1) * 100)}%` }}
              />
              
              {STEPS.map((step, i) => (
                <div key={step} className="order-step">
                  <div className={`order-step-circle ${
                    i < stepIdx ? 'order-step-circle--completed' :
                    i === stepIdx ? 'order-step-circle--current' :
                    'order-step-circle--pending'
                  }`}>
                    {i < stepIdx ? <i className="bi bi-check"></i> : i + 1}
                  </div>
                  <span className={`order-step-label ${
                    i <= stepIdx ? 'order-step-label--active' : 'order-step-label--inactive'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="order-section">
          <h2 className="order-section-title">
            <i className="bi bi-box"></i> ITEMS ({order.items?.length})
          </h2>
          <div className="order-items-divider">
            {order.items?.map(item => (
              <div key={item.id} className="order-item">
                <div className="order-item-image">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} />
                  ) : (
                    <div className="order-item-image-placeholder">
                      <i className="bi bi-box"></i>
                    </div>
                  )}
                </div>
                <div className="order-item-details">
                  <p className="order-item-name">{item.product_name}</p>
                  <p className="order-item-meta">
                    Qty: {item.quantity} × KES {Number(item.unit_price).toLocaleString()}
                  </p>
                </div>
                <p className="order-item-price">KES {Number(item.subtotal).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {addr && (
          <div className="order-section">
            <h2 className="order-section-title">
              <i className="bi bi-geo-alt"></i> DELIVERY ADDRESS
            </h2>
            <p className="order-address-name">{addr.full_name}</p>
            <p className="order-address-line">{addr.street}</p>
            <p className="order-address-line">{addr.town}, {addr.county}</p>
            <p className="order-address-phone">{addr.phone}</p>
          </div>
        )}

        {/* Payment summary */}
        <div className="order-section">
          <h2 className="order-section-title">
            <i className="bi bi-credit-card"></i> PAYMENT SUMMARY
          </h2>
          <div className="order-payment-summary">
            <div className="order-payment-row">
              <span>Payment Method</span>
              <span className="text-capitalize fw-semibold">
                {order.payment_method?.replace('_', ' ')}
              </span>
            </div>
            <div className="order-payment-row">
              <span>Subtotal</span>
              <span>KES {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="order-payment-row">
              <span>Shipping</span>
              {Number(order.shipping_fee) === 0 ? (
                <span className="order-payment-row--shipping-free">
                  <i className="bi bi-check-circle"></i> FREE
                </span>
              ) : (
                <span>KES {Number(order.shipping_fee).toLocaleString()}</span>
              )}
            </div>
            <div className="order-payment-row order-payment-row--total">
              <span>Total</span>
              <span className="order-total">KES {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={handleCancel} className="order-cancel-btn">
              <i className="bi bi-x-circle"></i> Cancel Order
            </button>
          )}
          <Link to="/products" className="order-shop-btn">
            <i className="bi bi-shop"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}