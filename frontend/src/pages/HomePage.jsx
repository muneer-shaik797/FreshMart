import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Clock, ShieldCheck, Award, 
  Flame, Leaf, ChevronRight, CheckCircle2, ShoppingBag, Truck
} from 'lucide-react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingDeals, setTrendingDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryVisuals = [
    { name: 'Fresh Produce', icon: '🥑', color: '#ecfdf5', borderColor: '#a7f3d0', sub: 'Fruits & Veggies' },
    { name: 'Dairy & Eggs', icon: '🥛', color: '#eff6ff', borderColor: '#bfdbfe', sub: 'A2 Milk & Farm Eggs' },
    { name: 'Bakery & Bread', icon: '🍞', color: '#fffbeb', borderColor: '#fde68a', sub: 'Artisan Sourdough' },
    { name: 'Beverages', icon: '🧃', color: '#fef2f2', borderColor: '#fecaca', sub: 'Cold Pressed & Brews' },
    { name: 'Pantry & Staples', icon: '🌾', color: '#f5f3ff', borderColor: '#ddd6fe', sub: 'Aged Rice & Pure Oils' },
    { name: 'Snacks & Confectionery', icon: '🍫', color: '#fff7ed', borderColor: '#fed7aa', sub: 'Almonds & Dark Cacao' },
    { name: 'Meat & Seafood', icon: '🐟', color: '#f0fdfa', borderColor: '#99f6e4', sub: 'Fresh Salmon & Cuts' },
    { name: 'Organic & Health', icon: '🌱', color: '#f0fdf4', borderColor: '#bbf7d0', sub: 'Quinoa & Chia Seeds' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes, catRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getTrending(),
          productApi.getCategories()
        ]);
        setFeaturedProducts(featRes.data);
        setTrendingDeals(trendRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load homepage groceries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* Hero Spotlight Section */}
      <section style={{
        background: 'linear-gradient(135deg, #075985 0%, #0284c7 45%, #0d9488 100%)',
        color: '#ffffff',
        padding: '4rem 1.25rem 4.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {/* Hero Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '700',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Sparkles size={16} color="#fef08a" />
              <span>Direct From Certified Organic Farms</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '1.2rem',
              letterSpacing: '-0.02em'
            }}>
              Crisp Produce & Daily Essentials <br />
              <span style={{ color: '#67e8f9', textDecoration: 'underline decoration-emerald-400' }}>
                Delivered in 45 Minutes.
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#e0f2fe',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '2rem'
            }}>
              Experience farm-to-table freshness. 100% natural Alphonso mangoes, fresh A2 milk, slow-fermented sourdough, cold-pressed juices and pantry staples delivered straight to your kitchen door.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/catalog" className="btn-emerald" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', gap: '0.6rem' }}>
                <ShoppingBag size={20} />
                <span>Shop Fresh Groceries</span>
                <ArrowRight size={18} />
              </Link>

              <Link to="/my-orders" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                padding: '0.85rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '0.95rem'
              }}>
                <Truck size={18} color="#67e8f9" />
                <span>Track Live Order</span>
              </Link>
            </div>

            {/* Quick Guarantees row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', fontSize: '0.82rem', color: '#bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Temperature-Controlled Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>100% Contact-Free</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Banner Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '1.5rem',
              color: 'var(--text-main)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <strong style={{ fontSize: '0.95rem' }}>Live Delivery In Progress</strong>
                </div>
                <span className="badge badge-status-OUT_FOR_DELIVERY">
                  ETA: 18 Mins
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '14px', marginBottom: '1.2rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=150&q=80"
                  alt="Alphonso Mangoes"
                  style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Alphonso Mangoes + Baby Spinach</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Order #FM-98421085 • Out for delivery</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>Driver: Vikram Singh</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Dispatched from Hub</span>
                  <span style={{ color: 'var(--primary)' }}>Near Destination</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #0284c7, #10b981)' }} />
                </div>
              </div>

              <Link
                to="/track-order/6acf960af65459215650ac6e"
                className="btn-primary"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem' }}
              >
                Track Real-Time Delivery →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Showcase */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shop By Department
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>
              Explore Fresh Categories
            </h2>
          </div>
          <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.92rem' }}>
            <span>View All</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1rem'
        }}>
          {categoryVisuals.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?category=${encodeURIComponent(cat.name)}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.25rem 0.75rem',
                borderRadius: 'var(--radius-lg)',
                background: cat.color,
                border: `1.5px solid ${cat.borderColor}`,
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>{cat.icon}</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.25, marginBottom: '0.25rem' }}>
                {cat.name}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Farm Fresh Produce */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <Leaf size={16} />
              <span>Harvested This Morning</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>
              Featured Farm Fresh Spotlight
            </h2>
          </div>
          <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.92rem' }}>
            <span>See All Produce</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Special Promotional Promo Banner */}
      <section className="container">
        <div style={{
          background: 'radial-gradient(circle at top right, #0369a1, #0b1329)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ maxWidth: '580px' }}>
            <span style={{
              background: '#f59e0b',
              color: '#000',
              fontWeight: '800',
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Limited Time Welcome Offer
            </span>
            <h3 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: '800', marginTop: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.2, color: '#fff' }}>
              Enjoy 20% OFF on Your First Grocery Delivery
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Apply promo coupon code <strong style={{ color: '#38bdf8' }}>FRESH20</strong> at checkout to redeem savings on all fresh fruits, dairy, artisan bread and pantry essentials.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px dashed #38bdf8',
              borderRadius: '16px',
              padding: '0.85rem 1.6rem',
              fontSize: '1.4rem',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: '#38bdf8'
            }}>
              FRESH20
            </div>
            <Link to="/catalog" className="btn-emerald" style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}>
              Shop Deals Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Deals of the Day */}
      {trendingDeals.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ea580c', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <Flame size={16} />
                <span>Steepest Discounts</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.2rem' }}>
                Trending Deals of the Day
              </h2>
            </div>
            <Link to="/catalog?sortBy=discount" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.92rem' }}>
              <span>View All Deals</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {trendingDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
