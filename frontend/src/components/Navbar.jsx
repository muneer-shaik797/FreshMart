import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, User as UserIcon, LogOut, 
  MapPin, Clock, ShieldCheck, ChevronDown, Menu, X, Sparkles, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

const Navbar = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const { getItemCount, setIsCartOpen, deliverySlot } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const itemCount = getItemCount();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
    navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="glass-nav">
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #075985, #0284c7, #06b6d4)',
        color: '#ffffff',
        fontSize: '0.8rem',
        padding: '0.4rem 1rem',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        letterSpacing: '0.02em',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <Sparkles size={14} color="#fef08a" />
          <span>⚡ <strong>Express 45-Min Grocery Delivery</strong> live across your city! Use code <strong>FRESH20</strong> for 20% OFF.</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
            color: '#fff',
            fontSize: '1.4rem'
          }}>
            🥬
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>Fresh</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0284c7' }}>Mart</span>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981' }}>Farm • Fresh • Daily</span>
          </div>
        </Link>

        {/* Delivery Slot Indicator */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.4rem 0.8rem',
          background: 'var(--surface-alt)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.82rem',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer'
        }} className="delivery-indicator-badge">
          <Clock size={16} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.1 }}>
              {deliverySlot?.type === 'EXPRESS' ? '⚡ 45 Mins Express' : 'Scheduled Delivery'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {deliverySlot?.title || 'Today, Next Slot'}
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search farm fresh vegetables, fruits, A2 milk, sourdough..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-subtle)',
              background: '#f8fafc',
              color: 'var(--text-main)',
              transition: 'var(--transition-fast)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </form>

        {/* Navigation Action Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/catalog" style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.92rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
            All Groceries
          </Link>

          {role === 'ROLE_ADMIN' && (
            <Link to="/admin" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: '600',
              color: '#075985',
              background: '#e0f2fe',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}>
              <LayoutDashboard size={16} />
              Admin Panel
            </Link>
          )}

          {/* User Account Menu */}
          <div style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <div>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '0.88rem'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #10b981)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '220px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 60,
                    padding: '0.5rem 0'
                  }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                      <span className="badge badge-cyan" style={{ marginTop: '0.3rem', fontSize: '0.65rem' }}>
                        {role === 'ROLE_ADMIN' ? 'Store Admin' : 'Valued Customer'}
                      </span>
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        fontWeight: '500'
                      }}
                    >
                      <Clock size={16} color="var(--primary)" />
                      My Orders & Live Tracking
                    </Link>

                    {role === 'ROLE_ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.88rem',
                          color: '#0369a1',
                          fontWeight: '600'
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.6rem 1rem',
                        fontSize: '0.88rem',
                        color: 'var(--accent-rose)',
                        fontWeight: '500',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: '0.3rem'
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
                <UserIcon size={16} />
                Sign In
              </Link>
            )}
          </div>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-primary"
            style={{ padding: '0.55rem 1.1rem', position: 'relative' }}
          >
            <ShoppingBag size={18} />
            <span style={{ fontWeight: '700' }}>Cart</span>
            {itemCount > 0 && (
              <span style={{
                background: '#ffffff',
                color: 'var(--primary-dark)',
                fontSize: '0.75rem',
                fontWeight: '800',
                borderRadius: 'var(--radius-full)',
                padding: '0.15rem 0.45rem',
                marginLeft: '0.2rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
