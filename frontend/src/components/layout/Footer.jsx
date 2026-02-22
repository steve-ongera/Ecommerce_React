import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Smartphone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">

      {/* ── App download banner ──────────────────────────── */}
      <div className="footer-app-banner">
        <div className="footer-app-inner">
          <div className="footer-app-info">
            <Smartphone size={28} />
            <div>
              <p className="footer-app-title">Get the Mkurugenzi App</p>
              <p className="footer-app-sub">Shop on the go – faster, easier, smarter</p>
            </div>
          </div>
          <div className="footer-app-btns">
            <button className="footer-app-btn">🍎 App Store</button>
            <button className="footer-app-btn">🤖 Google Play</button>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-brand-icon">M</div>
              <span className="footer-brand-name">Mkurugenzi</span>
            </div>
            <p className="footer-brand-desc">
              Kenya's most trusted online marketplace. Shop with confidence using secure
              M-Pesa payments and enjoy fast nationwide delivery.
            </p>
            <div className="footer-socials">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="footer-social-btn" aria-label="Social">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {[
                { to: '/products',                     label: 'All Products'   },
                { to: '/products?flash=true',          label: 'Flash Sales'    },
                { to: '/products?ordering=-created_at',label: 'New Arrivals'   },
                { to: '/products?is_featured=true',    label: 'Featured Items' },
                { to: '/stores',                       label: 'All Stores'     },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer-col-title">Customer Service</h4>
            <ul className="footer-links">
              {[
                { to: '/help',     label: 'Help Center'         },
                { to: '/track',    label: 'Track Order'         },
                { to: '/returns',  label: 'Returns & Refunds'   },
                { to: '/shipping', label: 'Shipping Info'       },
                { to: '/sell',     label: 'Sell on Mkurugenzi'  },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact-item">
              <Phone size={14} className="footer-contact-icon" />
              <div>
                <p className="footer-contact-label">Customer Support</p>
                <p className="footer-contact-value">+254 700 000 000</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <Mail size={14} className="footer-contact-icon" />
              <div>
                <p className="footer-contact-label">Email</p>
                <p className="footer-contact-value">support@mkurugenzi.co.ke</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <MapPin size={14} className="footer-contact-icon" />
              <div>
                <p className="footer-contact-label">Head Office</p>
                <p className="footer-contact-value">Nairobi, Kenya</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ───────────────────────────────────── */}
        <div className="footer-bottom">
          <div>
            <p className="footer-payments-label">We accept</p>
            <div className="footer-payments">
              {['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard'].map((p) => (
                <span key={p} className="footer-payment-badge">{p}</span>
              ))}
            </div>
          </div>
          <div className="footer-copy">
            <p>© 2025 Mkurugenzi. All rights reserved.</p>
            <p className="footer-policy-links">
              <Link to="/privacy" className="footer-policy-link">Privacy Policy</Link>
              <span className="footer-policy-sep">·</span>
              <Link to="/terms"   className="footer-policy-link">Terms of Service</Link>
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}