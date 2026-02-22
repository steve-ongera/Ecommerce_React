import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, User, Package, Heart, LogOut, ChevronRight, Zap, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../store'
import { useEffect } from 'react'

export default function MobileDrawer({ isOpen, onClose, categories = [] }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()

  // Close on route change
  useEffect(() => { onClose?.() }, [location.pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="drawer-header">
          {isAuthenticated ? (
            <div className="drawer-user-info">
              <div className="drawer-avatar">
                {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="drawer-user-name">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="drawer-user-email">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="drawer-welcome">Welcome!</p>
              <div className="drawer-auth-btns">
                <Link to="/login"    onClick={onClose} className="drawer-login-btn">Login</Link>
                <Link to="/register" onClick={onClose} className="drawer-register-btn">Register</Link>
              </div>
            </div>
          )}
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {/* Account links (authenticated only) */}
          {isAuthenticated && (
            <div className="drawer-section">
              {[
                { to: '/profile',  icon: <User    size={16} />, label: 'My Account' },
                { to: '/orders',   icon: <Package size={16} />, label: 'My Orders'  },
                { to: '/wishlist', icon: <Heart   size={16} />, label: 'My Wishlist'},
              ].map((item) => (
                <Link key={item.to} to={item.to} onClick={onClose} className="drawer-link">
                  <span className="drawer-link-icon">{item.icon}</span>
                  {item.label}
                  <ChevronRight size={14} className="drawer-link-arrow" />
                </Link>
              ))}
            </div>
          )}

          {/* Special nav */}
          <div className="drawer-section">
            <Link to="/products?flash=true"          onClick={onClose} className="drawer-link drawer-link--flash">
              <span className="drawer-link-icon"><Zap size={16} /></span>
              Flash Sale
              <ChevronRight size={14} className="drawer-link-arrow" />
            </Link>
            <Link to="/products?ordering=-created_at" onClick={onClose} className="drawer-link drawer-link--new">
              <span className="drawer-link-icon"><TrendingUp size={16} /></span>
              New Arrivals
              <ChevronRight size={14} className="drawer-link-arrow" />
            </Link>
          </div>

          {/* Categories */}
          <div className="drawer-section">
            <p className="drawer-section-label">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={onClose}
                className="drawer-link"
              >
                <span className="drawer-link-icon">{cat.icon}</span>
                {cat.name}
                <ChevronRight size={14} className="drawer-link-arrow" />
              </Link>
            ))}
          </div>

        </div>

        {/* Footer (logout) */}
        {isAuthenticated && (
          <div className="drawer-footer">
            <button
              onClick={() => { logout(); onClose?.() }}
              className="drawer-logout-btn"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}

      </div>
    </>
  )
}