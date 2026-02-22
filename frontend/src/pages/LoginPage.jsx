import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import '../styles/login.css'; // Import the new CSS file

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Left panel - hidden on mobile */}
      <div className="login-brand-panel">
        <ShoppingBag size={80} className="login-brand-icon"/>
        <h1 className="login-brand-title">
          Kenya's #1 <br/>Marketplace
        </h1>
        <p className="login-brand-subtitle">
          Shop from thousands of products with fast delivery, secure M-Pesa payments, and unbeatable prices.
        </p>
        <div className="login-stats-grid">
          {[['500K+','Products'],['100K+','Customers'],['99%','Satisfaction']].map(([n,l]) => (
            <div key={l} className="login-stat-card">
              <p className="login-stat-number">{n}</p>
              <p className="login-stat-label">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-header">
            <Link to="/" className="login-logo-link">
              <div className="login-logo-icon">
                <span>M</span>
              </div>
              <span className="login-logo-text">Mkurugenzi</span>
            </Link>
            <h2 className="login-header-title">Sign In</h2>
            <p className="login-header-subtitle">Welcome back! Enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-form-label">Email or Username</label>
              <input 
                type="text" 
                value={form.username} 
                onChange={e=>setForm({...form,username:e.target.value})}
                className="form-input" 
                placeholder="your@email.com" 
                required 
                autoFocus
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Password</label>
              <div className="login-password-wrapper">
                <input 
                  type={showPwd ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={e=>setForm({...form,password:e.target.value})}
                  className="form-input login-password-input" 
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button" 
                  onClick={()=>setShowPwd(!showPwd)}
                  className="login-password-toggle"
                >
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary login-submit-btn"
            >
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?
              <Link to="/register" className="login-footer-link">Create account</Link>
            </p>
          </div>

          <div className="login-demo-box">
            <p className="login-demo-title">Demo Credentials</p>
            <p className="login-demo-content">
              Username: <code className="login-demo-code">demo</code> · 
              Password: <code className="login-demo-code">demo123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}