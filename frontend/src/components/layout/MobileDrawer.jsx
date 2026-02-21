import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, Package, Heart, LogOut, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store';

export default function MobileDrawer({ isOpen, onClose, categories }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer-panel flex flex-col">
        {/* Header */}
        <div style={{background:'#f68b1e'}} className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <span style={{color:'#f68b1e'}} className="font-black text-sm">{(user?.first_name || user?.username || 'U')[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user?.first_name} {user?.last_name}</p>
                <p className="text-orange-100 text-xs truncate max-w-[160px]">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white font-bold">Welcome!</p>
              <div className="flex items-center gap-2 mt-1">
                <Link to="/login" onClick={onClose} className="bg-white text-orange-500 text-xs font-bold px-3 py-1 rounded">Login</Link>
                <Link to="/register" onClick={onClose} className="border border-white text-white text-xs font-bold px-3 py-1 rounded">Register</Link>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-white p-1 rounded hover:bg-white/20">
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Quick links */}
          {isAuthenticated && (
            <div className="border-b border-gray-100">
              {[
                {to:'/profile', icon:<User size={16}/>, label:'My Account'},
                {to:'/orders', icon:<Package size={16}/>, label:'My Orders'},
                {to:'/wishlist', icon:<Heart size={16}/>, label:'My Wishlist'},
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50 last:border-0">
                  <span className="text-orange-400">{item.icon}</span> {item.label}
                  <ChevronRight size={14} className="ml-auto text-gray-300"/>
                </Link>
              ))}
            </div>
          )}

          {/* Special sections */}
          <div className="border-b border-gray-100">
            <Link to="/products?flash=true" onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-orange-50"
              style={{color:'#e74c3c'}}>
              <Zap size={16}/> Flash Sale
            </Link>
            <Link to="/products?ordering=-created_at" onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-orange-50"
              style={{color:'#f68b1e'}}>
              <TrendingUp size={16}/> New Arrivals
            </Link>
          </div>

          {/* Categories */}
          <div>
            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Categories</p>
            {categories.map(cat => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50">
                <span className="text-orange-400">{cat.icon}</span> {cat.name}
                <ChevronRight size={14} className="ml-auto text-gray-300"/>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isAuthenticated && (
          <div className="border-t border-gray-100 p-4 flex-shrink-0">
            <button onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-2 text-sm text-red-500 font-semibold w-full justify-center py-2 border border-red-200 rounded hover:bg-red-50">
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}