import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Navigation, ArrowRight, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { useAuthStore } from '../store/useAuthStore';

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      const res = await orderApi.cancelOrder(orderId, 'Cancelled by customer');
      setOrders(orders.map((o) => (o.id === orderId ? res.data : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.4rem' }}>My Grocery Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          View your order history, receipts, and track delivery progress in real time.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your grocery orders...
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Browse our fresh produce, organic dairy, and daily essentials!
          </p>
          <Link to="/catalog" className="btn-primary" style={{ display: 'inline-flex' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((ord) => {
            const canCancel = ord.status === 'PLACED' || ord.status === 'CONFIRMED';
            return (
              <div
                key={ord.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        Order #{ord.orderNumber}
                      </strong>
                      <span className={`badge badge-status-${ord.status}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Placed on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        disabled={cancellingId === ord.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.84rem',
                          fontWeight: '600',
                        }}
                      >
                        <XCircle size={15} />
                        <span>{cancellingId === ord.id ? 'Cancelling...' : 'Cancel Order'}</span>
                      </button>
                    )}

                    <Link
                      to={`/track-order/${ord.id}`}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', gap: '0.4rem' }}
                    >
                      <Navigation size={16} />
                      <span>Track Live</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  {ord.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <img src={it.imageUrl} alt={it.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.84rem' }}>
                        <div style={{ fontWeight: '600' }}>{it.name}</div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Qty: {it.quantity} • ₹{it.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Delivery Window: </span>
                    <span>{ord.deliverySlot?.title || 'Standard'}</span>
                  </div>

                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Total Paid: </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{ord.total}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', marginLeft: '0.4rem' }}>
                      ({ord.paymentStatus})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
