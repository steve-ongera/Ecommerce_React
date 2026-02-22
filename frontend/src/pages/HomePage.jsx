import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Zap, ShieldCheck, Truck, RefreshCw,
  Star, Laptop, Shirt, Home, Dumbbell, Sparkles, Car, BookOpen,
  Gamepad2, Phone, Headphones, Watch, Camera, Tablet
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productsAPI, categoriesAPI, bannersAPI } from '../services/api';

// ── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_BANNERS = [
  {
    id: 1,
    title: 'Flash Sale – Up to 70% Off',
    subtitle: 'Electronics, Fashion, Home & more. Limited time deals!',
    bg: 'linear-gradient(135deg, #f68b1e 0%, #e6780a 50%, #c45e00 100%)',
    cta: 'Shop Flash Sale',
    link: '/products?flash=true',
    badge: '⚡ ENDS TODAY',
    image: null,
  },
  {
    id: 2,
    title: "New Season Fashion",
    subtitle: "Latest trends from Kenya's top brands. Free delivery over KES 2,000.",
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    cta: 'Explore Fashion',
    link: '/category/fashion',
    badge: '✨ NEW ARRIVALS',
    image: null,
  },
  {
    id: 3,
    title: 'Smart Electronics',
    subtitle: 'Phones, Laptops, TVs & Accessories at unbeatable prices.',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    cta: 'Shop Electronics',
    link: '/category/electronics',
    badge: '🔥 BEST SELLERS',
    image: null,
  },
];

const CAT_ICONS = {
  electronics:   <Laptop size={22} />,
  fashion:       <Shirt size={22} />,
  'home-living': <Home size={22} />,
  sports:        <Dumbbell size={22} />,
  beauty:        <Sparkles size={22} />,
  automotive:    <Car size={22} />,
  books:         <BookOpen size={22} />,
  gaming:        <Gamepad2 size={22} />,
  phones:        <Phone size={22} />,
  audio:         <Headphones size={22} />,
  watches:       <Watch size={22} />,
  cameras:       <Camera size={22} />,
  tablets:       <Tablet size={22} />,
};

const DEFAULT_CATS = [
  { id: 1,  name: 'Phones',        slug: 'phones',      icon: 'phones' },
  { id: 2,  name: 'Electronics',   slug: 'electronics', icon: 'electronics' },
  { id: 3,  name: 'Fashion',       slug: 'fashion',     icon: 'fashion' },
  { id: 4,  name: 'Home & Living', slug: 'home-living', icon: 'home-living' },
  { id: 5,  name: 'Sports',        slug: 'sports',      icon: 'sports' },
  { id: 6,  name: 'Beauty',        slug: 'beauty',      icon: 'beauty' },
  { id: 7,  name: 'Gaming',        slug: 'gaming',      icon: 'gaming' },
  { id: 8,  name: 'Books',         slug: 'books',       icon: 'books' },
  { id: 9,  name: 'Tablets',       slug: 'tablets',     icon: 'tablets' },
  { id: 10, name: 'Watches',       slug: 'watches',     icon: 'watches' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ height, width, style }) {
  return (
    <div
      className="skeleton"
      style={{ height: height || 12, width: width || '100%', ...style }}
    />
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, link, linkText = 'See All', color }) {
  return (
    <div className="section-header" style={color ? { borderColor: color } : {}}>
      <h2 className="section-title" style={color ? { color } : {}}>{title}</h2>
      <Link to={link} className="section-link" style={color ? { color } : {}}>
        {linkText} <ChevronRight size={14} />
      </Link>
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────────────────────────

function CountdownTimer({ endTime }) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      setTime({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return (
    <div className="countdown-wrap">
      <span className="countdown-ends">Ends in</span>
      {[time.h, time.m, time.s].map((v, i) => (
        <React.Fragment key={i}>
          <span className="countdown-box">{v}</span>
          {i < 2 && <span className="countdown-sep">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────

function HeroBanner({ banners }) {
  const [idx, setIdx]                 = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setIdx(i); setTransitioning(false); }, 300);
  };

  const next = () => goTo((idx + 1) % banners.length);
  const prev = () => goTo((idx - 1 + banners.length) % banners.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const b = banners[idx];

  return (
    <div className="hero-wrap" style={{ background: b.bg || '#f68b1e' }}>
      <div
        className="hero-inner"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <div className="hero-content">
          {b.badge && <span className="hero-badge">{b.badge}</span>}
          <h1 className="hero-title">{b.title}</h1>
          <p className="hero-sub">{b.subtitle}</p>
          <Link to={b.link || '/products'} className="hero-cta">
            {b.cta || 'Shop Now'} <ChevronRight size={16} />
          </Link>
        </div>
        {b.image && (
          <img src={b.image} alt={b.title} className="hero-img" />
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hero-arrow hero-arrow-left"
            aria-label="Previous banner"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="hero-arrow hero-arrow-right"
            aria-label="Next banner"
          >
            <ChevronRight size={18} />
          </button>
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`hero-dot${i === idx ? ' active' : ''}`}
                style={{ width: i === idx ? 20 : 6 }}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Product Grid ──────────────────────────────────────────────────────────────

function ProductGrid({ products, loading, cols = 5 }) {
  if (loading) {
    return (
      <div className="prod-grid">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <Skeleton height={160} style={{ marginBottom: 10 }} />
            <Skeleton height={12} style={{ marginBottom: 6 }} />
            <Skeleton height={12} width="60%" style={{ marginBottom: 8 }} />
            <Skeleton height={18} width="45%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="prod-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [flashSale,   setFlashSale]   = useState([]);
  const [categories,  setCategories]  = useState(DEFAULT_CATS);
  const [banners,     setBanners]     = useState(FALLBACK_BANNERS);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const flashEnd = useRef(Date.now() + 7 * 3600 * 1000);

  useEffect(() => {
    Promise.allSettled([
      productsAPI.featured(),
      productsAPI.list({ ordering: '-created_at', page_size: 10 }),
      categoriesAPI.list(),
      bannersAPI.list(),
    ]).then(([featRes, newRes, catRes, banRes]) => {
      if (featRes.status === 'fulfilled') {
        setFeatured(featRes.value.data?.results || featRes.value.data || []);
      }
      if (newRes.status === 'fulfilled') {
        const d = newRes.value.data?.results || newRes.value.data || [];
        setFlashSale(d.slice(0, 10));
        setNewArrivals(d.slice(0, 10));
      }
      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data?.results || catRes.value.data;
        if (d?.length) setCategories(d);
      }
      if (banRes.status === 'fulfilled') {
        const d = banRes.value.data?.results || banRes.value.data;
        if (d?.length) setBanners(d);
      }
    }).finally(() => setLoading(false));
  }, []);

  const prodsLoading = loading && featured.length === 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <HeroBanner banners={banners} />

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div className="trust-bar">
        <div className="page-wrap">
          <div className="trust-grid">
            {[
              { icon: <Truck size={20} />,       label: 'Fast Delivery',  sub: '1-3 days nationwide' },
              { icon: <ShieldCheck size={20} />, label: '100% Genuine',   sub: 'Verified products only' },
              { icon: <RefreshCw size={20} />,   label: 'Easy Returns',   sub: '7-day return policy' },
              { icon: <Star size={20} style={{ fill: '#f4a100', color: '#f4a100' }} />,
                label: 'Top Rated', sub: '5M+ happy customers' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="trust-item">
                <span className="trust-icon">{icon}</span>
                <div>
                  <p className="trust-label">{label}</p>
                  <p className="trust-sub">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="page-content">

        {/* Categories */}
        <div className="surface">
          <SectionHeader title="Shop by Category" link="/products" />
          <div className="cat-grid">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="cat-item"
              >
                <div className="cat-icon-wrap">
                  {CAT_ICONS[cat.icon || cat.slug] || <Laptop size={20} />}
                </div>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Flash Sale */}
        <div className="surface">
          <div className="flash-header">
            <div className="flash-title-group">
              <span className="flash-title">
                <Zap size={18} style={{ fill: '#e74c3c' }} /> Flash Sale
              </span>
              <CountdownTimer endTime={flashEnd.current} />
            </div>
            <Link
              to="/products"
              className="section-link"
              style={{ color: '#e74c3c' }}
            >
              See All <ChevronRight size={14} />
            </Link>
          </div>
          {flashSale.length > 0 ? (
            <ProductGrid products={flashSale.slice(0, 5)} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <p className="empty-state-sm">Flash sales coming soon!</p>
          )}
        </div>

        {/* 2-col promo banners */}
        <div className="promo-grid">
          <Link
            to="/category/electronics"
            className="promo-card"
            style={{ background: 'linear-gradient(135deg,#0f3460,#16213e)' }}
          >
            <div>
              <p className="promo-label">Electronics</p>
              <h3 className="promo-title">Latest Gadgets<br />& Accessories</h3>
              <p className="promo-from">From KES 500</p>
            </div>
            <div className="promo-icon"><Laptop size={56} /></div>
          </Link>
          <Link
            to="/category/fashion"
            className="promo-card"
            style={{ background: 'linear-gradient(135deg,#8e44ad,#6c3483)' }}
          >
            <div>
              <p className="promo-label">Fashion</p>
              <h3 className="promo-title">New Season<br />Collection 2025</h3>
              <p className="promo-from">Up to 60% off</p>
            </div>
            <div className="promo-icon"><Shirt size={56} /></div>
          </Link>
        </div>

        {/* Featured Products */}
        <div className="surface">
          <SectionHeader title="⭐ Featured Products" link="/products?is_featured=true" />
          {featured.length > 0 ? (
            <ProductGrid products={featured.slice(0, 10)} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <p className="empty-state">No featured products yet</p>
          )}
        </div>

        {/* New Arrivals */}
        <div className="surface">
          <SectionHeader title="🆕 New Arrivals" link="/products?ordering=-created_at" />
          {newArrivals.length > 0 ? (
            <ProductGrid products={newArrivals} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <div className="empty-state">
              <p>No products loaded yet</p>
              <p style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                Products will appear once your API is running
              </p>
            </div>
          )}
        </div>

        {/* Perks */}
        <div className="perks-grid">
          {[
            { label: 'Free Delivery',  sub: 'Orders over KES 2,000', icon: '🚚', bg: '#e8f5e9' },
            { label: 'Secure Payment', sub: 'M-Pesa & Card',          icon: '🔒', bg: '#e3f2fd' },
            { label: 'Easy Returns',   sub: '7-day policy',            icon: '↩️', bg: '#fff3e0' },
            { label: '24/7 Support',   sub: 'Always here for you',     icon: '💬', bg: '#fce4ec' },
          ].map((item) => (
            <div key={item.label} className="perk-card" style={{ background: item.bg }}>
              <div className="perk-emoji">{item.icon}</div>
              <p className="perk-label">{item.label}</p>
              <p className="perk-sub">{item.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

