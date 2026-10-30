import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (name.length < 2) return setFormError('Enter your full name (at least 2 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Enter a valid email address.');
    if (form.password.length < 8) return setFormError('Password must contain at least 8 characters.');
    if (form.password !== form.confirmPassword) return setFormError('Your passwords do not match.');
    const result = await register({ name, email, phone: form.phone.trim(), password: form.password });
    if (result.success) navigate('/');
    else setFormError(result.message || 'Registration failed. Please try again.');
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-register">
        <div className="auth-visual">
          <div className="auth-brand"><span className="auth-brand-mark"><Leaf size={21}/></span> FreshMart</div>
          <div className="auth-visual-copy"><span className="auth-eyebrow">A FRESHER WAY TO SHOP</span><h1>Bring the goodness of the farm home.</h1><p>Create an account to save your basket, manage deliveries and follow every order.</p></div>
          <img className="auth-produce-image" src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=85" alt="Fresh fruit and vegetable produce"/>
          <span className="auth-image-caption">Picked with care. Delivered with freshness.</span>
        </div>
        <div className="auth-panel">
          <div className="auth-mobile-brand"><Leaf size={19}/> FreshMart</div>
          <div className="auth-heading"><span className="auth-eyebrow">JOIN FRESHMART</span><h2>Create your account</h2><p>It only takes a minute to get started.</p></div>
          {formError && <div className="auth-alert" role="alert">{formError}</div>}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="register-name">Full name</label>
            <div className="auth-input-wrap"><User size={18}/><input id="register-name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={update('name')} required/></div>
            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap"><Mail size={18}/><input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required/></div>
            <label htmlFor="register-phone">Phone number <span className="auth-optional">Optional</span></label>
            <div className="auth-input-wrap"><Phone size={18}/><input id="register-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')}/></div>
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap"><Lock size={18}/><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update('password')} required/><button className="auth-eye" type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            <label htmlFor="register-confirm">Confirm password</label>
            <div className="auth-input-wrap"><Lock size={18}/><input id="register-confirm" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={update('confirmPassword')} required/></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'} {!loading && <ArrowRight size={18}/>}</button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
          <p className="auth-footnote">New registrations are assigned customer access.</p>
        </div>
      </section>
    </main>
  );
}
