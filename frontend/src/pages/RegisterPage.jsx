import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import '../styles/register.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone_number: '', password: '', password2: '', role: 'customer'
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { 
      toast.error('Passwords do not match'); 
      return; 
    }
    if (form.password.length < 6) { 
      toast.error('Password must be at least 6 characters'); 
      return; 
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Mkurugenzi 🎉');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        Object.entries(errors).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`));
      } else toast.error('Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="register-logo-link">
            <div className="register-logo-icon">
              <span>M</span>
            </div>
            <span className="register-logo-text">Mkurugenzi</span>
          </Link>
          <h2 className="register-header-title">Create Account</h2>
          <p className="register-header-subtitle">Join thousands of Kenyan shoppers</p>
        </div>

        <div className="register-card">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-name-row">
              {/* First Name */}
              <div className="register-field">
                <label className="register-field-label">
                  First Name<span className="register-required-star">*</span>
                </label>
                <input 
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleInputChange}
                  className="form-input" 
                  placeholder="John" 
                  required
                />
              </div>

              {/* Last Name */}
              <div className="register-field">
                <label className="register-field-label">
                  Last Name<span className="register-required-star">*</span>
                </label>
                <input 
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleInputChange}
                  className="form-input" 
                  placeholder="Doe" 
                  required
                />
              </div>
            </div>
            
            {/* Username */}
            <div className="register-field">
              <label className="register-field-label">
                Username<span className="register-required-star">*</span>
              </label>
              <input 
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="johndoe" 
                required
              />
            </div>

            {/* Email */}
            <div className="register-field">
              <label className="register-field-label">
                Email Address<span className="register-required-star">*</span>
              </label>
              <input 
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="john@email.com" 
                required
              />
            </div>

            {/* Phone Number */}
            <div className="register-field">
              <label className="register-field-label">
                Phone Number
              </label>
              <input 
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="07XXXXXXXX"
              />
            </div>

            {/* Role Selection */}
            <div className="register-role-container">
              <span className="register-role-label">
                Account Type<span className="register-required-star">*</span>
              </span>
              <div className="register-role-grid">
                {[
                  { val: 'customer', label: '🛒 Customer', sub: 'Shop & buy' },
                  { val: 'vendor', label: '🏪 Vendor', sub: 'Sell products' }
                ].map(role => (
                  <label 
                    key={role.val}
                    className={`register-role-card ${form.role === role.val ? 'register-role-card--selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="role" 
                      value={role.val} 
                      checked={form.role === role.val}
                      onChange={handleInputChange} 
                      className="register-role-radio"
                    />
                    <div className="register-role-content">
                      <p className="register-role-title">{role.label}</p>
                      <p className="register-role-subtitle">{role.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="register-field">
              <label className="register-field-label">
                Password<span className="register-required-star">*</span>
              </label>
              <div className="register-password-wrapper">
                <input 
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="form-input register-password-input" 
                  placeholder="Min 6 characters" 
                  required 
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)} 
                  className="register-password-toggle"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="register-field">
              <label className="register-field-label">
                Confirm Password<span className="register-required-star">*</span>
              </label>
              <input 
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="Repeat password" 
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?
              <Link to="/login" className="register-footer-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}