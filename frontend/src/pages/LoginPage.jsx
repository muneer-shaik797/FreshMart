import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSubmitted(true);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Enter your password.');
      return;
    }
    const result = await login(normalizedEmail, password);
    if (result.success) {
      navigate(result.role === 'ROLE_ADMIN' ? '/admin' : (location.state?.from?.pathname || '/'));
    } else {
      setFormError(result.message || 'Unable to sign in. Check your details and try again.');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-visual">
          <div className="auth-brand"><span className="auth-brand-mark"><Leaf size={21}/></span> FreshMart</div>
          <div className="auth-visual-copy">
            <span className="auth-eyebrow">FRESHNESS, DELIVERED</span>
            <h1>Good food starts with better choices.</h1>
            <p>Shop handpicked fruits and vegetables, sourced fresh and delivered to your door.</p>
          </div>
          <img className="auth-produce-image" src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85" alt="Fresh vegetables in a market basket"/>
          <span className="auth-image-caption">Fresh picks for every day.</span>
        </div>
        <div className="auth-panel">
          <div className="auth-mobile-brand"><Leaf size={19}/> FreshMart</div>
          <div className="auth-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue shopping.</p>
          </div>
          {formError && <div className="auth-alert" role="alert">{formError}</div>}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap"><Mail size={18}/><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required/></div>
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap"><Lock size={18}/><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required/><button className="auth-eye" type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowRight size={18}/>}</button>
          </form>
          <p className="auth-switch">New to FreshMart? <Link to="/register">Create an account</Link></p>
          <p className="auth-footnote">Secure sign-in protected by encrypted authentication.</p>
        </div>
      </section>
    </main>
  );
}
