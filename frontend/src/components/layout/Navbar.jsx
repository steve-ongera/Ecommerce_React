import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Heart, User, Search, Menu, LogOut,
  Package, ChevronDown, MapPin, Phone, Zap, TrendingUp,
  Laptop, Shirt, Home, Dumbbell, Sparkles, Car, BookOpen, Gamepad2
} from 'lucide-react'
import { useAuthStore, useCartStore } from '../../store'
import toast from 'react-hot-toast'
import MobileDrawer from './MobileDrawer.jsx'

const CATEGORIES = [
  { name: 'Electronics',  slug: 'electronics',  icon: <Laptop   size={15} /> },
  { name: 'Fashion',      slug: 'fashion',      icon: <Shirt    size={15} /> },
  { name: 'Home & Living',slug: 'home-living',  icon: <Home     size={15} /> },
  { name: 'Sports',       slug: 'sports',       icon: <Dumbbell size={15} /> },
  { name: 'Beauty',       slug: 'beauty',       icon: <Sparkles size={15} /> },
  { name: 'Automotive',   slug: 'automotive',   icon: <Car      size={15} /> },
  { name: 'Books',        slug: 'books',        icon: <BookOpen size={15} /> },
  { name: 'Gaming',       slug: 'gaming',       icon: <Gamepad2 size={15} /> },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const cart      = useCartStore((s) => s.cart)
  const itemCount = cart?.item_count || 0

  const [search,      setSearch]      = useState('')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [catMenu,     setCatMenu]     = useState(false)

  const userMenuRef = useRef(null)
  const catMenuRef  = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
      if (catMenuRef.current  && !catMenuRef.current.contains(e.target))  setCatMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      <header className="navbar">

        {/* ── Top info bar (desktop only) ───────────────── */}
        <div className="navbar-info">
          <div className="navbar-info-inner">
            <div className="navbar-info-left">
              <span className="navbar-info-item">
                <Phone size={11} /> +254 700 000 000
              </span>
              <span className="navbar-info-item">
                <MapPin size={11} /> Deliver to Kenya
              </span>
            </div>
            <div className="navbar-info-right">
              <Link to="/stores" className="navbar-info-item">Sell on Mkurugenzi</Link>
              <span style={{ color: '#555' }}>|</span>
              <span>Flash deals every day 🔥</span>
            </div>
          </div>
        </div>

        {/* ── Main orange bar ───────────────────────────── */}
        <div className="navbar-main">
          <div className="navbar-main-inner">

            {/* Hamburger (mobile/tablet) */}
            <button
              className="navbar-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">M</div>
              <div className="navbar-logo-text">
                <div className="navbar-logo-name">Mkurugenzi</div>
                <div className="navbar-logo-tld">.co.ke</div>
              </div>
            </Link>

            {/* Search */}
            <form className="navbar-search" onSubmit={handleSearch}>
              <div className="navbar-search-wrap">
                <input
                  className="navbar-search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands, categories…"
                />
                <button type="submit" className="navbar-search-btn">
                  <Search size={16} />
                  <span className="navbar-search-btn-label">Search</span>
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="navbar-actions">

              {/* Account */}
              {isAuthenticated ? (
                <div className="navbar-user-wrap" ref={userMenuRef}>
                  <button
                    className="navbar-action-btn"
                    onClick={() => setUserMenu(!userMenu)}
                    aria-label="Account menu"
                  >
                    <User size={20} />
                    <span className="navbar-action-label" style={{ maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.first_name || user?.username}
                    </span>
                  </button>
                  {userMenu && (
                    <div className="navbar-user-dropdown">
                      <div className="navbar-user-dropdown-header">
                        <div className="navbar-user-dropdown-name">{user?.first_name} {user?.last_name}</div>
                        <div className="navbar-user-dropdown-email">{user?.email}</div>
                      </div>
                      {[
                        { to: '/profile',  icon: <User    size={14} />, label: 'My Account' },
                        { to: '/orders',   icon: <Package size={14} />, label: 'My Orders'  },
                        { to: '/wishlist', icon: <Heart   size={14} />, label: 'Wishlist'   },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="navbar-user-dropdown-link"
                          onClick={() => setUserMenu(false)}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <hr className="navbar-user-dropdown-divider" />
                      <button onClick={handleLogout} className="navbar-user-dropdown-logout">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="navbar-auth">
                  <Link to="/login"    className="navbar-auth-login">Login</Link>
                  <Link to="/register" className="navbar-auth-register">Register</Link>
                </div>
              )}

              {/* Wishlist (desktop only) */}
              <Link
                to="/wishlist"
                className="navbar-action-btn navbar-wishlist-btn"
                style={{ display: 'none' }}
                aria-label="Wishlist"
              >
                <Heart size={20} />
                <span className="navbar-action-label">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="navbar-action-btn" aria-label="Cart">
                <div className="navbar-cart-wrap">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="navbar-cart-badge">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="navbar-action-label">Cart</span>
              </Link>

            </div>
          </div>
        </div>

        {/* ── Category bar (desktop only) ───────────────── */}
        <div className="navbar-cats">
          <div className="navbar-cats-inner">

            {/* All Categories dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={catMenuRef}>
              <button
                className="navbar-cats-all"
                onClick={() => setCatMenu(!catMenu)}
              >
                <Menu size={15} /> All Categories <ChevronDown size={13} />
              </button>
              {catMenu && (
                <div className="navbar-cats-dropdown">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="navbar-cats-dropdown-item"
                      onClick={() => setCatMenu(false)}
                    >
                      <span className="navbar-cats-dropdown-icon">{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick nav links */}
            <Link to="/products?flash=true"              className="nav-link" style={{ color: '#ffeb3b' }}>⚡ Flash Sale</Link>
            <Link to="/products?ordering=-discount_percent" className="nav-link">🔥 Top Deals</Link>
            <Link to="/products?ordering=-created_at"    className="nav-link">✨ New Arrivals</Link>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="nav-link">
                {cat.name}
              </Link>
            ))}

          </div>
        </div>

      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={CATEGORIES}
      />
    </>
  )
}