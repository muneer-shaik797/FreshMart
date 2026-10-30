import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, RefreshCw, Award, Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="dark-navy-section" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Guarantees Strip */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Clock size={26} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.98rem', marginBottom: '0.2rem' }}>45-Min Express Delivery</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>Lightning fast doorstep delivery with cold-chain packaging</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Award size={26} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.98rem', marginBottom: '0.2rem' }}>100% Organic & Fresh</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>Direct from verified chemical-free local partner farms</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <RefreshCw size={26} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.98rem', marginBottom: '0.2rem' }}>No-Questions-Asked Return</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>Instant replacement or refund if you are not 100% delighted</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67e8f9' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.98rem', marginBottom: '0.2rem' }}>Razorpay Secure Payments</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>Bank-grade 256-bit SSL encrypted online transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
        {/* Brand Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🥬
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>Fresh<span style={{ color: '#38bdf8' }}>Mart</span></span>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Your neighborhood farm-to-table supermarket. We deliver sustainably cultivated fruits, crisp vegetables, artisan dairy, and gourmet kitchen essentials in record time.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.08)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#38bdf8' }}>✓ FSSAI Certified</span>
            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.08)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#34d399' }}>✓ ISO 22000</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/catalog?category=Fresh%20Produce" style={{ color: 'var(--text-light)', fontSize: '0.88rem', transition: 'var(--transition-fast)' }}>Fresh Fruits & Vegetables</Link></li>
            <li><Link to="/catalog?category=Dairy%20%26%20Eggs" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Organic Dairy & Farm Eggs</Link></li>
            <li><Link to="/catalog?category=Bakery%20%26%20Bread" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Artisanal Sourdough & Bakery</Link></li>
            <li><Link to="/catalog?category=Beverages" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Cold-Pressed Juices & Brews</Link></li>
            <li><Link to="/catalog?category=Pantry%20%26%20Staples" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Aged Rice, Oils & Raw Honey</Link></li>
            <li><Link to="/catalog?category=Organic%20%26%20Health" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Organic Seeds & Superfoods</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>Customer Service</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/my-orders" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Track Live Order Status</Link></li>
            <li><Link to="/catalog" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Schedule Delivery Slot</Link></li>
            <li><Link to="/catalog" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Apply Discount Coupons</Link></li>
            <li><a href="/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Swagger API Docs ↗</a></li>
            <li><Link to="/admin" style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>Admin Inventory Portal</Link></li>
          </ul>
        </div>

        {/* Store Contacts */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>Get In Touch</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.88rem' }}>
              <MapPin size={18} color="#38bdf8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <span>FreshMart Central Hub, 4th Cross, Green Glen Layout, Bangalore 560103</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.88rem' }}>
              <Phone size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <span>+91 (080) 4567 8900</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.88rem' }}>
              <Mail size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <span>support@freshmart.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.2rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-light)' }}>
          <span>© 2026 FreshMart Inc. All rights reserved. Built with React 18, Spring Boot 3.2.5 & MongoDB.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-light)' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-light)' }}>Terms of Service</a>
            <a href="#" style={{ color: 'var(--text-light)' }}>Cold Chain Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
