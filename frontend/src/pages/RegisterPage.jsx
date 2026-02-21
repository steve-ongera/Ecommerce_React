import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({
    username:'', email:'', first_name:'', last_name:'',
    phone_number:'', password:'', password2:'', role:'customer'
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
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

  const F = ({label, name, type='text', placeholder, required=true}) => (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">{label}{required&&<span className="text-red-400">*</span>}</label>
      <input type={type} value={form[name]} onChange={e=>setForm({...form,[name]:e.target.value})}
        className="form-input" placeholder={placeholder} required={required}/>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'#f5f5f5'}}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:'#f68b1e'}}>
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="text-xl font-black text-gray-900" style={{fontFamily:'Nunito,sans-serif'}}>Mkurugenzi</span>
          </Link>
          <h2 className="text-2xl font-black text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Join thousands of Kenyan shoppers</p>
        </div>

        <div className="bg-white rounded shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <F label="First Name" name="first_name" placeholder="John"/>
              <F label="Last Name" name="last_name" placeholder="Doe"/>
            </div>
            <F label="Username" name="username" placeholder="johndoe"/>
            <F label="Email Address" name="email" type="email" placeholder="john@email.com"/>
            <F label="Phone Number" name="phone_number" placeholder="07XXXXXXXX" required={false}/>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Account Type<span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {[{val:'customer',label:'🛒 Customer',sub:'Shop & buy'},
                  {val:'vendor',label:'🏪 Vendor',sub:'Sell products'}].map(r => (
                  <label key={r.val}
                    className={`flex items-start gap-2 p-3 border-2 rounded cursor-pointer transition-all ${form.role===r.val ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" name="role" value={r.val} checked={form.role===r.val}
                      onChange={() => setForm({...form,role:r.val})} className="mt-0.5 accent-orange-500"/>
                    <div>
                      <p className="text-sm font-bold">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Password<span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPwd?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  className="form-input pr-10" placeholder="Min 6 characters" required minLength={6}/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Confirm Password<span className="text-red-400">*</span></label>
              <input type="password" value={form.password2} onChange={e=>setForm({...form,password2:e.target.value})}
                className="form-input" placeholder="Repeat password" required/>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}