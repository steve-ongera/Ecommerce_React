import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI, addressAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/profile.css'; // Import the new CSS file

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'bi-person' },
  { id: 'security', label: 'Security', icon: 'bi-lock' },
  { id: 'addresses', label: 'Addresses', icon: 'bi-geo-alt' },
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
  const [pwds, setPwds] = useState({ old_password: '', new_password: '', confirm: '' });
  const [addresses, setAddresses] = useState([]);
  const [loadedAddr, setLoadedAddr] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    if (loadedAddr) return;
    addressAPI.list().then(({ data }) => { 
      setAddresses(data); 
      setLoadedAddr(true); 
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      if (setUser) setUser(data);
      toast.success('Profile updated!');
    } catch { 
      toast.error('Update failed'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwds.new_password !== pwds.confirm) { 
      toast.error('Passwords do not match'); 
      return; 
    }
    setSaving(true);
    try {
      await authAPI.changePassword({ 
        old_password: pwds.old_password, 
        new_password: pwds.new_password 
      });
      toast.success('Password changed!');
      setPwds({ old_password: '', new_password: '', confirm: '' });
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Failed'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDeleteAddr = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressAPI.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch { 
      toast.error('Failed'); 
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {(user?.first_name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.first_name} {user?.last_name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="profile-role-badge">{user?.role}</span>
              {user?.phone_number && (
                <span className="profile-phone">{user.phone_number}</span>
              )}
            </div>
          </div>
          <div className="profile-actions">
            <Link to="/orders" className="profile-action-link">
              <i className="bi bi-box"></i> Orders
            </Link>
            <Link to="/wishlist" className="profile-action-link">
              <i className="bi bi-heart"></i> Wishlist
            </Link>
          </div>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="profile-sidebar">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { 
                  setTab(t.id); 
                  if (t.id === 'addresses') loadAddresses(); 
                }}
                className={`profile-tab ${tab === t.id ? 'profile-tab--active' : ''}`}
              >
                <i className={`bi ${t.icon}`}></i>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="profile-content">
            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="profile-form">
                <h2 className="profile-content-title">Personal Information</h2>
                <div className="profile-form-row">
                  <div className="profile-form-field">
                    <label className="profile-form-label">First Name</label>
                    <input 
                      value={form.first_name} 
                      onChange={e => setForm({ ...form, first_name: e.target.value })}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-field">
                    <label className="profile-form-label">Last Name</label>
                    <input 
                      value={form.last_name} 
                      onChange={e => setForm({ ...form, last_name: e.target.value })}
                      className="profile-form-input"
                    />
                  </div>
                </div>

                <div className="profile-form-field">
                  <label className="profile-form-label">Email Address</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="profile-form-input"
                  />
                </div>

                <div className="profile-form-field">
                  <label className="profile-form-label">Phone Number</label>
                  <input 
                    value={form.phone_number} 
                    onChange={e => setForm({ ...form, phone_number: e.target.value })}
                    className="profile-form-input" 
                    placeholder="07XXXXXXXX"
                  />
                </div>

                <div className="profile-form-field">
                  <label className="profile-form-label">Username</label>
                  <input 
                    value={user?.username || ''} 
                    className="profile-form-input" 
                    disabled
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary profile-submit-btn"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {tab === 'security' && (
              <form onSubmit={handleChangePassword} className="profile-form">
                <h2 className="profile-content-title">Change Password</h2>
                
                <div className="profile-form-field">
                  <label className="profile-form-label">Current Password</label>
                  <input 
                    type="password" 
                    value={pwds.old_password} 
                    onChange={e => setPwds({ ...pwds, old_password: e.target.value })}
                    className="profile-form-input" 
                    required
                  />
                </div>

                <div className="profile-form-field">
                  <label className="profile-form-label">New Password</label>
                  <input 
                    type="password" 
                    value={pwds.new_password} 
                    onChange={e => setPwds({ ...pwds, new_password: e.target.value })}
                    className="profile-form-input" 
                    required 
                    minLength={6}
                  />
                </div>

                <div className="profile-form-field">
                  <label className="profile-form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={pwds.confirm} 
                    onChange={e => setPwds({ ...pwds, confirm: e.target.value })}
                    className="profile-form-input" 
                    required
                  />
                </div>

                <div className="profile-password-hint">
                  <i className="bi bi-info-circle"></i> Password must be at least 6 characters long
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="profile-password-btn"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {tab === 'addresses' && (
              <div>
                <h2 className="profile-content-title">Saved Addresses</h2>
                {addresses.length === 0 ? (
                  <div className="profile-addresses-empty">
                    <div className="profile-addresses-empty-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <p className="profile-addresses-empty-text">No saved addresses yet</p>
                  </div>
                ) : (
                  <div className="profile-addresses-list">
                    {addresses.map(a => (
                      <div key={a.id} className="profile-address-card">
                        <div>
                          <div className="profile-address-header">
                            <p className="profile-address-name">{a.full_name}</p>
                            {a.is_default && (
                              <span className="profile-address-badge">DEFAULT</span>
                            )}
                          </div>
                          <p className="profile-address-details">
                            {a.street}, {a.town}, {a.county}
                          </p>
                          <p className="profile-address-phone">{a.phone}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAddr(a.id)} 
                          className="profile-address-delete"
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/checkout" className="profile-add-address-link">
                  <i className="bi bi-plus-circle"></i> Add New Address
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}