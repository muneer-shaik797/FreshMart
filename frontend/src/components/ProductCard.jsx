import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Star, ShoppingCart, Leaf } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const ProductCard = ({ product }) => {
  const { items, addItem, updateQty, removeItem } = useCartStore();

  const cartItem = items.find((i) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product.id, qtyInCart + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qtyInCart <= 1) {
      removeItem(product.id);
    } else {
      updateQty(product.id, qtyInCart - 1);
    }
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      transition: 'all 0.25s ease'
    }}>
      {/* Product Image Container */}
      <Link to={`/product/${product.id}`} style={{ position: 'relative', overflow: 'hidden', height: '190px', background: '#f8fafc', display: 'block' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 2 }}>
          {product.discountPercent > 0 && (
            <span className="badge badge-discount">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isOrganic && (
            <span className="badge badge-organic">
              <Leaf size={11} /> Organic
            </span>
          )}
        </div>

        {!product.inStock && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '700',
            fontSize: '0.9rem',
            backdropFilter: 'blur(2px)'
          }}>
            Out of Stock
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', fontWeight: '700', color: '#b45309' }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: '0.96rem',
            fontWeight: '600',
            color: 'var(--text-main)',
            marginBottom: '0.35rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem'
          }}>
            {product.name}
          </h3>
        </Link>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          {product.unit}
        </span>

        {/* Pricing and Action Row */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Cart Stepper / Add button */}
          {product.inStock ? (
            qtyInCart > 0 ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  style={{ padding: '0.35rem 0.55rem', color: '#fff', display: 'flex', alignItems: 'center' }}
                >
                  <Minus size={15} />
                </button>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', minWidth: '1.4rem', textAlign: 'center' }}>
                  {qtyInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  style={{ padding: '0.35rem 0.55rem', color: '#fff', display: 'flex', alignItems: 'center' }}
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#f0f9ff',
                  color: 'var(--primary)',
                  border: '1.5px solid #bae6fd',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                <Plus size={14} /> Add
              </button>
            )
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: '600' }}>
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
