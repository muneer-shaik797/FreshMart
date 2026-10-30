import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { couponApi } from '../api/couponApi';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeItem,
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getDeliveryFee,
    getTax,
    getTotal,
    deliverySlot,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getTotal();

  const freeDeliveryThreshold = 499.0;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const availablePromos = ['FRESH20', 'SUPERGROCERY', 'FIRST50'];

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await couponApi.verifyCoupon(code, subtotal);
      if (res.data.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          message: res.data.message,
        });
        setCouponInput('');
      } else {
        setCouponError(res.data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Dimmed backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 25px rgba(0,0,0,0.15)',
          zIndex: 10,
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Your Grocery Cart</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'} in basket
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            style={{
              padding: '0.4rem',
              borderRadius: '50%',
              background: '#f1f5f9',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Goal Strip */}
        <div style={{ background: '#f0fdf4', padding: '0.75rem 1.5rem', borderBottom: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#166534', marginBottom: '0.4rem' }}>
            <span>
              {amountToFreeDelivery > 0
                ? `Add ₹${Math.round(amountToFreeDelivery)} more for FREE Delivery`
                : '🎉 Congratulations! You unlocked FREE Delivery!'}
            </span>
            <span>{Math.round(freeDeliveryProgress)}%</span>
          </div>
          <div style={{ height: '6px', background: '#dcfce7', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${freeDeliveryProgress}%`, height: '100%', background: '#16a34a', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Your cart is empty</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '280px', marginBottom: '1.5rem' }}>
                Fill your basket with fresh fruits, daily greens, artisan milk & pantry staples!
              </p>
              <button
                onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                Browse Fresh Catalog
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    ₹{item.price}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '1.4rem', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label="Remove item"
                  style={{ color: '#94a3b8', padding: '0.3rem', transition: 'var(--transition-fast)' }}
                  onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          {items.length > 0 && (
            <>
              {/* Discount Promo Box */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.85rem' }}>
                  <Tag size={16} color="var(--primary)" />
                  <span>Apply Store Coupon</span>
                </div>

                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#e0f2fe',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #7dd3fc',
                  }}>
                    <div>
                      <span style={{ fontWeight: '800', color: '#0369a1', fontSize: '0.85rem' }}>
                        🎉 {appliedCoupon.code} APPLIED
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                        Saved ₹{appliedCoupon.discountAmount}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-strong)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                        {couponError}
                      </p>
                    )}

                    {/* Quick promo suggestions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Try:</span>
                      {availablePromos.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleApplyCoupon(p)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Slot Summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {deliverySlot?.title || 'Standard Slot'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {deliverySlot?.type === 'EXPRESS' ? '⚡ 45 Mins Express Courier' : 'Scheduled Delivery Window'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer / Bill Summary & CTA */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff',
            boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Charges</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Taxes & Eco Packing (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '800',
                fontSize: '1.15rem',
                color: 'var(--text-main)',
                paddingTop: '0.6rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleProceedCheckout}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
