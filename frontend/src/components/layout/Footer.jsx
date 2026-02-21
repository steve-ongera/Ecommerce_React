import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{background:'#2d2d2d', color:'#bbb'}} className="mt-8">
      {/* App download banner */}
      <div style={{background:'#f68b1e'}} className="py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <Smartphone size={28}/>
            <div>
              <p className="font-black text-base">Get the Mkurugenzi App</p>
              <p className="text-orange-100 text-xs">Shop on the go – faster, easier, smarter</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-gray-900 flex items-center gap-1.5">
              🍎 App Store
            </button>
            <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-gray-900 flex items-center gap-1.5">
              🤖 Google Play
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'#f68b1e'}}>
                <span className="text-white font-black">M</span>
              </div>
              <span className="text-white font-black text-xl" style={{fontFamily:'Nunito,sans-serif'}}>Mkurugenzi</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Kenya's most trusted online marketplace. Shop with confidence using secure M-Pesa payments and enjoy fast nationwide delivery.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded flex items-center justify-center hover:text-white transition-colors"
                  style={{background:'rgba(255,255,255,0.1)'}}>
                  <Icon size={14}/>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              {[
                {to:'/products', label:'All Products'},
                {to:'/products?flash=true', label:'Flash Sales'},
                {to:'/products?ordering=-created_at', label:'New Arrivals'},
                {to:'/products?is_featured=true', label:'Featured Items'},
                {to:'/stores', label:'All Stores'},
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-orange-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wide">Customer Service</h4>
            <ul className="space-y-2">
              {[
                {to:'/help', label:'Help Center'},
                {to:'/track', label:'Track Order'},
                {to:'/returns', label:'Returns & Refunds'},
                {to:'/shipping', label:'Shipping Info'},
                {to:'/sell', label:'Sell on Mkurugenzi'},
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-orange-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black mb-4 text-sm uppercase tracking-wide">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 flex-shrink-0 text-orange-400"/>
                <div>
                  <p className="text-xs text-gray-400">Customer Support</p>
                  <p className="text-sm text-white">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 flex-shrink-0 text-orange-400"/>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-white">support@mkurugenzi.co.ke</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-orange-400"/>
                <div>
                  <p className="text-xs text-gray-400">Head Office</p>
                  <p className="text-sm text-white">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t mt-8 pt-6" style={{borderColor:'rgba(255,255,255,0.1)'}}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">We accept</p>
              <div className="flex items-center gap-2">
                {['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard'].map(p => (
                  <span key={p} className="text-xs font-bold px-2 py-1 rounded"
                    style={{background:'rgba(255,255,255,0.1)', color:'#fff'}}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center sm:text-right">
              <p>© 2025 Mkurugenzi. All rights reserved.</p>
              <p className="mt-1">
                <Link to="/privacy" className="hover:text-orange-400">Privacy Policy</Link>
                {' · '}
                <Link to="/terms" className="hover:text-orange-400">Terms of Service</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}