import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, User, Search, Menu, X, LogOut,
  Package, ChevronDown, MapPin, Phone, Tag, Zap, TrendingUp,
  Laptop, Shirt, Home, Dumbbell, Sparkles, Car, BookOpen, Gamepad2
} from 'lucide-react';
import { useAuthStore, useCartStore } from '../../store';
import toast from 'react-hot-toast';
import MobileDrawer from './MobileDrawer';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: <Laptop size={15}/> },
  { name: 'Fashion', slug: 'fashion', icon: <Shirt size={15}/> },
  { name: 'Home & Living', slug: 'home-living', icon: <Home size={15}/> },
  { name: 'Sports', slug: 'sports', icon: <Dumbbell size={15}/> },
  { name: 'Beauty', slug: 'beauty', icon: <Sparkles size={15}/> },
  { name: 'Automotive', slug: 'automotive', icon: <Car size={15}/> },
  { name: 'Books', slug: 'books', icon: <BookOpen size={15}/> },
  { name: 'Gaming', slug: 'gaming', icon: <Gamepad2 size={15}/> },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const catMenuRef = useRef(null);
  const itemCount = cart?.item_count || 0;

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 shadow-md">
        {/* Top info bar */}
        <div style={{background:'#3d3d3d'}} className="text-white text-xs py-1.5 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Phone size={11}/> +254 700 000 000</span>
              <span className="flex items-center gap-1"><MapPin size={11}/> Deliver to Kenya</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/stores" className="hover:text-orange-300">Sell on Mkurugenzi</Link>
              <span className="text-gray-400">|</span>
              <span>Flash deals every day 🔥</span>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <div style={{background:'#f68b1e'}} className="py-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3">
              {/* Hamburger - mobile */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden text-white p-1.5 rounded hover:bg-white/20 flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu size={22}/>
              </button>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span style={{color:'#f68b1e', fontFamily:'Nunito, sans-serif'}} className="font-black text-lg leading-none">M</span>
                </div>
                <div className="hidden sm:block">
                  <span style={{fontFamily:'Nunito, sans-serif'}} className="text-white font-black text-xl leading-none tracking-tight">Mkurugenzi</span>
                  <span className="block text-orange-100 text-xs leading-none">.co.ke</span>
                </div>
              </Link>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2">
                <div className="flex h-10 rounded overflow-hidden shadow-sm">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, brands, categories..."
                    className="flex-1 px-4 text-sm outline-none text-gray-800 placeholder-gray-400"
                    style={{fontFamily:'Nunito Sans, sans-serif'}}
                  />
                  <button
                    type="submit"
                    className="px-5 font-bold text-white flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    style={{background:'#e6780a'}}
                  >
                    <Search size={16}/>
                    <span className="hidden sm:inline text-sm">Search</span>
                  </button>
                </div>
              </form>

              {/* Right actions */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                {/* Account */}
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex flex-col items-center px-2 py-1 text-white hover:bg-white/20 rounded transition-colors"
                    >
                      <User size={20}/>
                      <span className="text-xs mt-0.5 max-w-[64px] truncate">{user?.first_name || user?.username}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded shadow-xl w-52 py-2 z-50 border border-gray-100">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-bold text-sm text-gray-900">{user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {[
                          {to:'/profile', icon:<User size={14}/>, label:'My Account'},
                          {to:'/orders', icon:<Package size={14}/>, label:'My Orders'},
                          {to:'/wishlist', icon:<Heart size={14}/>, label:'Wishlist'},
                        ].map(item => (
                          <Link key={item.to} to={item.to}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-100"/>
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                          <LogOut size={14}/> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center px-2 py-1">
                    <Link to="/login" className="text-white hover:bg-white/20 rounded px-2 py-1 text-xs font-bold transition-colors">
                      Login
                    </Link>
                    <Link to="/register" className="text-orange-100 text-xs hover:text-white">Register</Link>
                  </div>
                )}

                {/* Wishlist */}
                <Link to="/wishlist" className="hidden md:flex flex-col items-center px-2 py-1 text-white hover:bg-white/20 rounded transition-colors">
                  <Heart size={20}/>
                  <span className="text-xs mt-0.5">Wishlist</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="flex flex-col items-center px-2 py-1 text-white hover:bg-white/20 rounded transition-colors relative">
                  <div className="relative">
                    <ShoppingCart size={20}/>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 leading-none">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-0.5">Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Category bar - desktop only */}
        <div style={{background:'#e6780a'}} className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-0 overflow-x-auto" style={{scrollbarWidth:'none'}}>
              {/* All Categories mega */}
              <div className="relative flex-shrink-0" ref={catMenuRef}>
                <button
                  onClick={() => setCatMenuOpen(!catMenuOpen)}
                  className="flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 hover:bg-black/20 transition-colors whitespace-nowrap"
                  style={{background:'rgba(0,0,0,0.15)'}}
                >
                  <Menu size={15}/> All Categories <ChevronDown size={13}/>
                </button>
                {catMenuOpen && (
                  <div className="absolute left-0 top-full bg-white shadow-xl rounded-b-lg w-64 z-50 border-t-2 border-orange-400">
                    {CATEGORIES.map(cat => (
                      <Link key={cat.slug} to={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50 last:border-0 transition-colors"
                        onClick={() => setCatMenuOpen(false)}>
                        <span className="text-orange-400">{cat.icon}</span> {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              {[
                {label:'⚡ Flash Sale', to:'/products?flash=true', style:{color:'#ffeb3b'}},
                {label:'🔥 Top Deals', to:'/products?ordering=-discount_percent'},
                {label:'✨ New Arrivals', to:'/products?ordering=-created_at'},
                ...CATEGORIES.slice(0,5).map(c => ({label:c.name, to:`/category/${c.slug}`})),
              ].map(link => (
                <Link key={link.to} to={link.to} className="nav-link flex-shrink-0" style={link.style}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} categories={CATEGORIES}/>
    </>
  );
}