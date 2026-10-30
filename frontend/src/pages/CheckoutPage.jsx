import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Clock, CreditCard, ShieldCheck, CheckCircle2, 
  ArrowLeft, Plus, AlertCircle, ShoppingBag, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import DeliverySlotPicker from '../components/DeliverySlotPicker';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, addAddress } = useAuthStore();
  const {
    items,
    appliedCoupon,
    deliverySlot,
    getSubtotal,
    getDiscount,
    getDeliveryFee,
    getTax,
    getTotal,
    clearCart,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE_RAZORPAY');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New address state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560103',
    landmark: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      navigate('/catalog');
      return;
    }

    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.default) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    } else {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated, user, items.length, navigate]);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getTotal();

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.pincode || !newAddress.fullName || !newAddress.phone) {
      setErrorMessage('Please fill in all required address fields.');
      return;
    }

    const created = {
      ...newAddress,
      id: 'addr_' + Date.now(),
      isDefault: true,
    };

    const res = await addAddress(created);
    if (res.success) {
      setSelectedAddress(created);
      setShowNewAddressForm(false);
      setErrorMessage('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setErrorMessage('Please select or enter a delivery address.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create order in Spring Boot Backend
      const orderPayload = {
        items,
        deliveryAddress: selectedAddress,
        deliverySlot,
        deliveryNotes,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        customerEmail: user?.email,
      };

      const res = await orderApi.createOrder(orderPayload);
      const createdOrder = res.data;

      // 2. Handle Payment Flow
      if (paymentMethod === 'ONLINE_RAZORPAY') {
        // Fetch Razorpay order details from backend
        const rzpRes = await paymentApi.createRazorpayOrder(createdOrder.id);
        const rzpOrder = rzpRes.data;

        // Check if Razorpay JS SDK is loaded on window
        if (typeof window.Razorpay === 'function' && !rzpOrder.isMock) {
          const options = {
            key: rzpOrder.keyId,
            amount: Math.round(rzpOrder.amount * 100),
            currency: 'INR',
            name: 'FreshMart Supermarket',
            description: `Payment for Order #${createdOrder.orderNumber}`,
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
            order_id: rzpOrder.id,
            handler: async (response) => {
              // Verify payment on backend
              try {
                await paymentApi.verifyPayment({
                  orderId: createdOrder.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                onOrderSuccess(createdOrder.id);
              } catch (verifyErr) {
                setErrorMessage('Payment verification error: ' + verifyErr.message);
                setSubmitting(false);
              }
            },
            prefill: {
              name: createdOrder.customerName,
              email: createdOrder.customerEmail,
              contact: createdOrder.customerPhone,
            },
            theme: {
              color: '#0284c7',
            },
            modal: {
              ondismiss: () => {
                setSubmitting(false);
              },
            },
          };

          const rzpInstance = new window.Razorpay(options);
          rzpInstance.open();
        } else {
          // Instant Mock/Simulation verification for seamless local testing
          await paymentApi.verifyPayment({
            orderId: createdOrder.id,
            razorpayOrderId: rzpOrder.id,
            razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 9),
            razorpaySignature: 'sig_mock_verified',
          });
          onOrderSuccess(createdOrder.id);
        }
      } else {
        // Cash on Delivery
        onOrderSuccess(createdOrder.id);
      }
    } catch (err) {
      console.error('Order creation failed', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order.');
      setSubmitting(false);
    }
  };

  const onOrderSuccess = (orderId) => {
    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    clearCart();
    navigate(`/track-order/${orderId}`);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Checkout Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Review & Complete Checkout</h1>
      </div>

      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Delivery Address + Slot + Notes + Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Step 1: Delivery Address */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>1. Delivery Address</h3>
              </div>
              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {!showNewAddressForm && user?.addresses && user.addresses.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {user.addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{addr.fullName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{addr.phone}</span>
                        <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.3rem' }}>
                          {addr.apartment ? `${addr.apartment}, ` : ''}{addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.landmark && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Landmark: {addr.landmark}</span>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleSaveAddress} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Street Address / Flat / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Avenue, Flat 4B"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem' }}>
                    Save Address
                  </button>
                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="btn-secondary"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.86rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Delivery Scheduling Slot */}
          <DeliverySlotPicker />

          {/* Step 3: Special Delivery Instructions */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Special Delivery Instructions (Optional)
            </h3>
            <textarea
              placeholder="e.g. Ring the doorbell twice, leave with security guard, do not disturb before 8 AM..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Step 4: Payment Method Selection */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <CreditCard size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>2. Payment Selection</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('ONLINE_RAZORPAY')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'ONLINE_RAZORPAY' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: paymentMethod === 'ONLINE_RAZORPAY' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontWeight: '800' }}>
                    RZP
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      Online Payment (UPI, Cards, NetBanking via Razorpay)
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Instant confirmation • 100% 256-bit encrypted checkout
                    </div>
                  </div>
                </div>
                {paymentMethod === 'ONLINE_RAZORPAY' && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'CASH_ON_DELIVERY' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: paymentMethod === 'CASH_ON_DELIVERY' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: '800' }}>
                    💵
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      Cash on Delivery (COD)
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Pay cash or scan UPI QR code upon doorstep arrival
                    </div>
                  </div>
                </div>
                {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '90px'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            Order Summary ({items.length} items)
          </h3>

          {/* Item scroll list */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {items.map((i) => (
              <div key={i.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src={i.imageUrl} alt={i.name} style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '600', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{i.quantity} × ₹{i.price}</span>
                  </div>
                </div>
                <strong style={{ color: 'var(--text-main)' }}>₹{i.total}</strong>
              </div>
            ))}
          </div>

          {/* Bill breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee ({deliverySlot?.type})</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Taxes (5% GST)</span>
              <span>₹{tax}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '800',
              fontSize: '1.25rem',
              color: 'var(--text-main)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.75rem',
            }}>
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '0.9rem',
            textAlign: 'center',
            background: '#f8fafc',
            padding: '0.55rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            Order details & invoice will be sent to: <strong style={{ color: 'var(--text-main)' }}>{user?.email || 'your account email'}</strong>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: '800',
              gap: '0.6rem',
            }}
          >
            {submitting ? 'Processing Payment...' : `Confirm & Pay ₹${total}`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span>Guaranteed 100% Secure Checkout powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
