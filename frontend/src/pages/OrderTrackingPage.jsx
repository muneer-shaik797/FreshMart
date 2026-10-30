import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, CheckCircle, Truck, Clock, Phone, MapPin, 
  ArrowLeft, AlertTriangle, ShieldCheck, RefreshCw, Send, Sparkles, Navigation
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { wsService } from '../services/websocketService';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const subscriptionRef = useRef(null);

  const stages = [
    { key: 'PLACED', title: 'Order Placed', desc: 'Received at hub', icon: Package },
    { key: 'CONFIRMED', title: 'Confirmed', desc: 'Order verified', icon: CheckCircle },
    { key: 'PACKING', title: 'Packing Fresh', desc: 'Insulated cold pack', icon: RefreshCw },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Driver en-route', icon: Truck },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Enjoy fresh grocery!', icon: Sparkles },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PACKING': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order', err);
        setError('Order not found or access restricted.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order?.id) return;

    // Connect and subscribe to WebSocket STOMP updates for this order
    wsService.connect(() => {
      setWsConnected(true);
      subscriptionRef.current = wsService.subscribeToOrder(order.id, (payload) => {
        console.log('Received live STOMP order update:', payload);
        if (payload.order) {
          setOrder(payload.order);
        } else if (payload.status) {
          setOrder((prev) => ({
            ...prev,
            status: payload.status,
            timeline: payload.timeline || prev.timeline,
            driverLat: payload.driverLat || prev.driverLat,
            driverLng: payload.driverLng || prev.driverLng,
            estimatedMinutesRemaining: payload.estimatedMinutesRemaining ?? prev.estimatedMinutesRemaining,
          }));
        }
      });
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [order?.id]);

  const handleSimulateStep = async () => {
    if (!order) return;
    setSimulating(true);
    try {
      const res = await orderApi.simulateDriver(order.id);
      setOrder(res.data);
    } catch (err) {
      console.error('Simulation step failed', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Connecting to live fulfillment hub...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Order Tracking</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{error || 'Unable to locate order.'}</p>
        <Link to="/catalog" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Back to Groceries
        </Link>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link to="/my-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.4rem' }}>
            <ArrowLeft size={16} /> My Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Order #{order.orderNumber}</h1>
            <span className={`badge badge-status-${order.status}`} style={{ fontSize: '0.82rem' }}>
              {order.status.replace(/_/g, ' ')}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: wsConnected ? '#dcfce7' : '#f1f5f9',
              color: wsConnected ? '#15803d' : 'var(--text-muted)'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: wsConnected ? '#16a34a' : '#94a3b8' }} />
              {wsConnected ? 'STOMP Live Sync' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Interactive Simulation Button */}
        {!isCancelled && order.status !== 'DELIVERED' && (
          <button
            onClick={handleSimulateStep}
            disabled={simulating}
            className="btn-emerald"
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem' }}
          >
            <Navigation size={16} />
            <span>{simulating ? 'Advancing Driver...' : 'Simulate Live Driver Step ⚡'}</span>
          </button>
        )}
      </div>

      {/* Main Tracking Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Progress Pipeline & Driver Radar Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Animated 5-Step Order Progress Pipeline */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              Fulfillment Journey
            </h3>

            {isCancelled ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={20} />
                <span>This order was cancelled. Items have been restocked to inventory.</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', position: 'relative' }}>
                {stages.map((stg, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const IconComponent = stg.icon;

                  return (
                    <div key={stg.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                      {/* Step Circle */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: isDone ? 'linear-gradient(135deg, #0284c7, #10b981)' : '#f1f5f9',
                        color: isDone ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.5rem',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.25)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        <IconComponent size={20} />
                      </div>

                      <strong style={{ fontSize: '0.8rem', color: isDone ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.2 }}>
                        {stg.title}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                        {stg.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Radar Delivery Map Visual Simulation */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Live Delivery Radar</h3>
              </div>
              {order.status === 'OUT_FOR_DELIVERY' && (
                <span className="badge badge-status-OUT_FOR_DELIVERY" style={{ fontSize: '0.85rem' }}>
                  ⚡ ETA: {order.estimatedMinutesRemaining} Minutes
                </span>
              )}
              {order.status === 'DELIVERED' && (
                <span className="badge badge-status-DELIVERED" style={{ fontSize: '0.85rem' }}>
                  ✓ Successfully Delivered
                </span>
              )}
            </div>

            {/* Stylized Simulated Map Container */}
            <div style={{
              height: '240px',
              borderRadius: '16px',
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
              border: '1px solid #334155'
            }}>
              {/* Grid Lines simulating city blocks */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.7
              }} />

              {/* Pulsing Destination Pin */}
              <div style={{ position: 'absolute', right: '22%', top: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 4 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
                }}>
                  <MapPin size={22} />
                </div>
                <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: '700', background: 'rgba(0,0,0,0.7)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginTop: '0.3rem' }}>
                  Your Doorstep
                </span>
              </div>

              {/* Driver Vehicle Location Marker */}
              {order.status !== 'DELIVERED' ? (
                <div style={{
                  position: 'absolute',
                  left: order.status === 'OUT_FOR_DELIVERY' ? '45%' : '20%',
                  top: order.status === 'OUT_FOR_DELIVERY' ? '48%' : '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 5,
                  transition: 'all 0.8s ease'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(2, 132, 199, 0.9)',
                    animation: 'pulseSubtle 2s infinite'
                  }}>
                    <Truck size={22} />
                  </div>
                  <span style={{ color: '#67e8f9', fontSize: '0.72rem', fontWeight: '800', background: 'rgba(15, 23, 42, 0.85)', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.3rem', border: '1px solid #0284c7' }}>
                    {order.deliveryPartnerName}
                  </span>
                </div>
              ) : (
                <div style={{ zIndex: 6, textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '2.5rem' }}>🏡📦</div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#34d399' }}>Delivered to Recipient Door</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thank you for shopping fresh with FreshMart!</div>
                </div>
              )}

              {/* Coordinates strip */}
              <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', color: '#94a3b8', fontSize: '0.75rem', zIndex: 4, background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                GPS: {order.driverLat.toFixed(4)}° N, {order.driverLng.toFixed(4)}° E
              </div>
            </div>

            {/* Driver Contact & Vehicle Info Card */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              marginTop: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #10b981)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem'
                }}>
                  {order.deliveryPartnerName[0]}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: '700' }}>{order.deliveryPartnerName}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Eco Electric Van (KA-01-EV-4820)
                  </div>
                </div>
              </div>

              <a
                href={`tel:${order.deliveryPartnerPhone}`}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <Phone size={15} color="var(--primary)" />
                <span>Call Driver ({order.deliveryPartnerPhone})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Order Details, Delivery Address & Event Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Order Items & Cost Summary */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>
              Items in Delivery ({order.items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.quantity} × ₹{item.price} ({item.unit})</span>
                    </div>
                  </div>
                  <strong>₹{item.total}</strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${order.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Taxes & Eco Packing</span>
                <span>₹{order.tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span>Total Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Destination Address */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MapPin size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Delivery Destination</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '600' }}>
              {order.deliveryAddress?.fullName} • {order.deliveryAddress?.phone}
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {order.deliveryAddress?.apartment ? `${order.deliveryAddress?.apartment}, ` : ''}
              {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </p>
            {order.deliveryNotes && (
              <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#475569' }}>
                <strong>Note:</strong> {order.deliveryNotes}
              </div>
            )}
          </div>

          {/* Live Timeline Event Log */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Order Audit Timeline</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {order.timeline && order.timeline.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.35rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{log.status}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{log.description}</p>
                    <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '600' }}>By: {log.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
