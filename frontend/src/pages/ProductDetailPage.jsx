import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Leaf, ShieldCheck, Truck, Clock, 
  Plus, Minus, ArrowLeft, CheckCircle2, ShoppingBag 
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { useCartStore } from '../store/useCartStore';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);

  const { items, addItem, updateQty } = useCartStore();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProductById(id);
        setProduct(res.data);

        // Fetch frequently bought together items
        if (res.data?.category) {
          const relRes = await productApi.getRelatedProducts(res.data.id, res.data.category);
          setRelated(relRes.data);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    setSelectedQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/catalog" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const cartItem = items.find((i) => i.productId === product.id);

  const handleAddToCart = () => {
    addItem(product, selectedQty);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> All Products
        </Link>
        <span>/</span>
        <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--primary)' }}>
          {product.category}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '2.5rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '3.5rem'
      }}>
        {/* Product Media Column */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            height: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Badges */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {product.discountPercent > 0 && (
                <span className="badge badge-discount" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                  {product.discountPercent}% OFF
                </span>
              )}
              {product.isOrganic && (
                <span className="badge badge-organic" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                  <Leaf size={14} /> 100% Certified Organic
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          {/* Rating & Stock row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', color: '#b45309', fontWeight: '700', fontSize: '0.88rem' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.rating}</span>
            </div>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              ({product.reviewCount} customer reviews)
            </span>
            <span style={{
              fontSize: '0.84rem',
              fontWeight: '700',
              color: product.inStock ? '#16a34a' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <CheckCircle2 size={16} />
              {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Currently Out of Stock'}
            </span>
          </div>

          {/* Price Box */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span style={{ fontSize: '1.2rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                ₹{product.originalPrice}
              </span>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              / {product.unit}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Quantity and Add to cart */}
          {product.inStock ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f1f5f9',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-strong)',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  style={{ padding: '0.65rem 0.9rem', color: 'var(--text-main)' }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ minWidth: '2.5rem', textAlign: 'center', fontWeight: '800', fontSize: '1rem' }}>
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.min(product.stockQuantity, selectedQty + 1))}
                  style={{ padding: '0.65rem 0.9rem', color: 'var(--text-main)' }}
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{ flex: 1, minWidth: '200px', padding: '0.85rem 1.8rem', fontSize: '1rem', gap: '0.6rem' }}
              >
                <ShoppingBag size={20} />
                <span>Add {selectedQty} to Cart • ₹{Math.round(selectedQty * product.price * 100) / 100}</span>
              </button>
            </div>
          ) : (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: '600' }}>
              This item is currently sold out. Our farm supply team is replenishing stock shortly!
            </div>
          )}

          {/* Value Props Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <Clock size={18} color="var(--primary)" />
              <span>45-Min Express Delivery Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="#16a34a" />
              <span>100% Quality & Freshness Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Recommendations */}
      {related.length > 0 && (
        <section>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Smart Recommendations
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.2rem' }}>
              Frequently Bought Together with {product.name}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
