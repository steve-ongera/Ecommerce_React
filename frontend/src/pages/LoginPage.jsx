import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex" style={{background:'#f5f5f5'}}>
      {/* Left panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{background:'linear-gradient(135deg,#f68b1e,#e6780a)'}}>
        <ShoppingBag size={80} className="text-white mb-6 opacity-90"/>
        <h1 className="text-4xl font-black text-white mb-3 text-center" style={{fontFamily:'Nunito,sans-serif'}}>
          Kenya's #1 <br/>Marketplace
        </h1>
        <p className="text-orange-100 text-center max-w-sm">
          Shop from thousands of products with fast delivery, secure M-Pesa payments, and unbeatable prices.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
          {[['500K+','Products'],['100K+','Customers'],['99%','Satisfaction']].map(([n,l]) => (
            <div key={l} className="text-center bg-white/20 rounded-lg p-3">
              <p className="text-white font-black text-xl">{n}</p>
              <p className="text-orange-100 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#f68b1e'}}>
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-xl font-black text-gray-900" style={{fontFamily:'Nunito,sans-serif'}}>Mkurugenzi</span>
            </Link>
            <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Email or Username</label>
              <input type="text" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}
                className="form-input" placeholder="your@email.com" required autoFocus/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input type={showPwd?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  className="form-input pr-10" placeholder="••••••••" required/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-50">
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-500 font-bold hover:underline">Create account</Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-bold mb-1">Demo Credentials</p>
            <p className="text-xs text-blue-600">Username: <code>demo</code> · Password: <code>demo123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}