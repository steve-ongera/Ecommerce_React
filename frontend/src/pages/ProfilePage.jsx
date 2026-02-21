import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Package, MapPin, Heart, Bell, ChevronRight, Edit2, Check } from 'lucide-react';
import { useAuthStore } from '../store';
import { authAPI, addressAPI } from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  {id:'profile', label:'Profile', icon:<User size={16}/>},
  {id:'security', label:'Security', icon:<Lock size={16}/>},
  {id:'addresses', label:'Addresses', icon:<MapPin size={16}/>},
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });
  const [pwds, setPwds] = useState({old_password:'', new_password:'', confirm:''});
  const [addresses, setAddresses] = useState([]);
  const [loadedAddr, setLoadedAddr] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    if (loadedAddr) return;
    addressAPI.list().then(({data}) => { setAddresses(data); setLoadedAddr(true); });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const {data} = await authAPI.updateProfile(form);
      if (setUser) setUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwds.new_password !== pwds.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({old_password: pwds.old_password, new_password: pwds.new_password});
      toast.success('Password changed!');
      setPwds({old_password:'', new_password:'', confirm:''});
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteAddr = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressAPI.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        {/* Profile header */}
        <div className="bg-white rounded shadow-sm p-5 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{background:'#f68b1e'}}>
            {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-900">{user?.first_name} {user?.last_name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 capitalize">{user?.role}</span>
              {user?.phone_number && <span className="text-xs text-gray-400">{user.phone_number}</span>}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Link to="/orders" className="text-xs font-bold px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1">
              <Package size={13}/> Orders
            </Link>
            <Link to="/wishlist" className="text-xs font-bold px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1">
              <Heart size={13}/> Wishlist
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              {TABS.map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); if (t.id === 'addresses') loadAddresses(); }}
                  className="flex items-center gap-2.5 w-full px-4 py-3.5 text-sm font-semibold border-b border-gray-50 last:border-0 transition-colors"
                  style={{
                    background: tab===t.id ? '#fff3e0' : 'white',
                    color: tab===t.id ? '#f68b1e' : '#3d3d3d',
                    borderLeft: tab===t.id ? '3px solid #f68b1e' : '3px solid transparent'
                  }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded shadow-sm p-5">
              {tab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <h2 className="font-black text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[['first_name','First Name'],['last_name','Last Name']].map(([f,l]) => (
                      <div key={f}>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">{l}</label>
                        <input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="form-input"/>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Email Address</label>
                    <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="form-input"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Phone Number</label>
                    <input value={form.phone_number} onChange={e=>setForm({...form,phone_number:e.target.value})} className="form-input" placeholder="07XXXXXXXX"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Username</label>
                    <input value={user?.username || ''} className="form-input bg-gray-50 text-gray-400" disabled/>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {tab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h2 className="font-black text-gray-900 mb-4">Change Password</h2>
                  {[['old_password','Current Password'],['new_password','New Password'],['confirm','Confirm New Password']].map(([f,l]) => (
                    <div key={f}>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">{l}</label>
                      <input type="password" value={pwds[f]} onChange={e=>setPwds({...pwds,[f]:e.target.value})}
                        className="form-input" required minLength={f!=='old_password'?6:undefined}/>
                    </div>
                  ))}
                  <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-600">
                    Password must be at least 6 characters long
                  </div>
                  <button type="submit" disabled={saving}
                    className="px-8 py-3 rounded font-bold text-sm text-white"
                    style={{background:'#3d3d3d'}}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              {tab === 'addresses' && (
                <div>
                  <h2 className="font-black text-gray-900 mb-4">Saved Addresses</h2>
                  {addresses.length === 0 ? (
                    <div className="text-center py-10">
                      <MapPin size={40} className="mx-auto mb-2" style={{color:'#ddd'}}/>
                      <p className="text-gray-400 text-sm">No saved addresses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(a => (
                        <div key={a.id} className="border border-gray-200 rounded p-4 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-gray-900">{a.full_name}</p>
                              {a.is_default && <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded">DEFAULT</span>}
                            </div>
                            <p className="text-sm text-gray-600">{a.street}, {a.town}, {a.county}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{a.phone}</p>
                          </div>
                          <button onClick={() => handleDeleteAddr(a.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold ml-4 flex-shrink-0">
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/checkout" className="inline-flex items-center gap-2 mt-4 text-sm text-orange-500 font-bold hover:underline">
                    <MapPin size={14}/> Add New Address
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}