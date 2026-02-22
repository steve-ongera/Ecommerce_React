import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Zap, TrendingUp, ShieldCheck, Truck, RefreshCw,
  Star, Clock, Laptop, Shirt, Home, Dumbbell, Sparkles, Car, BookOpen, Gamepad2,
  Phone, Headphones, Watch, Camera, Tablet
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productsAPI, categoriesAPI, bannersAPI } from '../services/api';

// Fallback banners if API is empty
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
  electronics:  <Laptop size={22} />,
  fashion:      <Shirt size={22} />,
  'home-living':<Home size={22} />,
  sports:       <Dumbbell size={22} />,
  beauty:       <Sparkles size={22} />,
  automotive:   <Car size={22} />,
  books:        <BookOpen size={22} />,
  gaming:       <Gamepad2 size={22} />,
  phones:       <Phone size={22} />,
  audio:        <Headphones size={22} />,
  watches:      <Watch size={22} />,
  cameras:      <Camera size={22} />,
  tablets:      <Tablet size={22} />,
};

const DEFAULT_CATS = [
  { id: 1,  name: 'Phones',       slug: 'phones',       icon: 'phones' },
  { id: 2,  name: 'Electronics',  slug: 'electronics',  icon: 'electronics' },
  { id: 3,  name: 'Fashion',      slug: 'fashion',      icon: 'fashion' },
  { id: 4,  name: 'Home & Living',slug: 'home-living',  icon: 'home-living' },
  { id: 5,  name: 'Sports',       slug: 'sports',       icon: 'sports' },
  { id: 6,  name: 'Beauty',       slug: 'beauty',       icon: 'beauty' },
  { id: 7,  name: 'Gaming',       slug: 'gaming',       icon: 'gaming' },
  { id: 8,  name: 'Books',        slug: 'books',        icon: 'books' },
  { id: 9,  name: 'Tablets',      slug: 'tablets',      icon: 'tablets' },
  { id: 10, name: 'Watches',      slug: 'watches',      icon: 'watches' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ className, style }) {
  return <div className={`skeleton ${className || ''}`} style={style} />;
}

function SectionHeader({ title, link, linkText = 'See All', color = '#f68b1e' }) {
  return (
    <div className="section-header">
      <h2 className="section-title" style={{ color }}>{title}</h2>
      <Link to={link} className="section-link flex items-center gap-1 hover:underline"
        style={{ fontSize: 13, color, fontWeight: 600 }}>
        {linkText} <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function CountdownTimer({ endTime }) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTime({ h, m, s });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1">Ends in</span>
      {[time.h, time.m, time.s].map((v, i) => (
        <React.Fragment key={i}>
          <span className="countdown-box">{v}</span>
          {i < 2 && <span className="text-gray-700 font-bold text-sm">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────

function HeroBanner({ banners }) {
  const [idx, setIdx] = useState(0);
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
    <div className="relative overflow-hidden"
      style={{ background: b.bg || '#f68b1e', minHeight: '220px' }}>
      <div
        className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6"
        style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.3s ease' }}
      >
        <div className="flex-1 text-white">
          {b.badge && (
            <span className="inline-block text-xs font-black px-3 py-1 rounded-full mb-3"
              style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
              {b.badge}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-black leading-tight mb-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}>
            {b.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-5 max-w-md">{b.subtitle}</p>
          <Link
            to={b.link || '/products'}
            className="inline-flex items-center gap-2 font-black text-sm px-6 py-3 rounded shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ background: '#1a1a1a', color: '#fff' }}
          >
            {b.cta || 'Shop Now'} <ChevronRight size={16} />
          </Link>
        </div>
        {b.image && (
          <img src={b.image} alt={b.title}
            className="w-full md:w-80 h-48 md:h-56 object-cover rounded-lg shadow-2xl" />
        )}
      </div>

      {/* Arrow controls */}
      {banners.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors hidden md:flex"
            style={{ background: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          >
            <ChevronLeft size={18} />
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors hidden md:flex"
            style={{ background: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6, height: 6,
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Product grid row (fixed — no duplicate keys) ──────────────────────────────

const GRID_STYLE = {
  display: 'grid',
  gap: '1px',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

// Inject responsive overrides once
const RESPONSIVE_CSS = `
  @media (min-width: 640px)  { .prod-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; } }
  @media (min-width: 768px)  { .prod-grid { grid-template-columns: repeat(4, minmax(0,1fr)) !important; } }
  @media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(5, minmax(0,1fr)) !important; } }
`;

let styleInjected = false;
function injectGridStyle() {
  if (styleInjected) return;
  const tag = document.createElement('style');
  tag.textContent = RESPONSIVE_CSS;
  document.head.appendChild(tag);
  styleInjected = true;
}

function ProductGrid({ products, loading, cols = 5 }) {
  useEffect(() => { injectGridStyle(); }, []);

  const skeletonCount = cols;

  if (loading) {
    return (
      <div className="prod-grid bg-gray-100" style={{ ...GRID_STYLE, padding: '1px' }}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="bg-white p-3">
            <Skeleton style={{ width: '100%', height: 160, marginBottom: 10, borderRadius: 4 }} />
            <Skeleton style={{ height: 12, width: '100%', marginBottom: 6, borderRadius: 4 }} />
            <Skeleton style={{ height: 12, width: '60%', marginBottom: 8, borderRadius: 4 }} />
            <Skeleton style={{ height: 18, width: '45%', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="prod-grid bg-gray-100" style={{ ...GRID_STYLE, padding: '1px' }}>
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
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <HeroBanner banners={banners} />

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: <Truck size={20} />,     label: 'Fast Delivery', sub: '1-3 days nationwide' },
              { icon: <ShieldCheck size={20} />, label: '100% Genuine',  sub: 'Verified products only' },
              { icon: <RefreshCw size={20} />,  label: 'Easy Returns',  sub: '7-day return policy' },
              { icon: <Star size={20} style={{ fill: '#f1c40f', color: '#f1c40f' }} />,
                label: 'Top Rated', sub: '5M+ happy customers' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div style={{ color: '#f68b1e', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">

        {/* Categories */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <div className="section-header">
            <h2 className="section-title" style={{ color: '#3d3d3d' }}>SHOP BY CATEGORY</h2>
            <Link to="/products" className="flex items-center gap-1"
              style={{ fontSize: 13, color: '#f68b1e', fontWeight: 600 }}>
              All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {categories.slice(0, 10).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors text-center"
                  style={{ textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff3e0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: '#fff3e0', color: '#f68b1e' }}>
                    {CAT_ICONS[cat.icon || cat.slug] || <Laptop size={20} />}
                  </div>
                  <span className="text-xs font-semibold leading-tight"
                    style={{ color: '#555' }}>
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Flash Sale */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <div className="section-header" style={{ borderColor: '#e74c3c' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="section-title flex items-center gap-2" style={{ color: '#e74c3c' }}>
                <Zap size={18} style={{ fill: '#e74c3c' }} /> FLASH SALE
              </h2>
              <CountdownTimer endTime={flashEnd.current} />
            </div>
            <Link to="/products" className="flex items-center gap-1"
              style={{ fontSize: 13, color: '#e74c3c', fontWeight: 600 }}>
              See All <ChevronRight size={14} />
            </Link>
          </div>
          {flashSale.length > 0 ? (
            <ProductGrid products={flashSale.slice(0, 5)} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              Flash sales coming soon!
            </div>
          )}
        </div>

        {/* 2-col promo banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/category/electronics"
            className="rounded overflow-hidden flex items-center gap-4 p-5 shadow-sm transition-shadow"
            style={{ background: 'linear-gradient(135deg,#0f3460,#16213e)', minHeight: 100, textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
          >
            <div className="text-white">
              <p className="text-xs font-bold mb-1" style={{ opacity: 0.7 }}>ELECTRONICS</p>
              <h3 className="text-lg font-black leading-tight">Latest Gadgets<br />& Accessories</h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>From KES 500</p>
            </div>
            <div className="ml-auto" style={{ fontSize: 56, opacity: 0.18, flexShrink: 0, color: '#fff' }}>
              <Laptop size={56} />
            </div>
          </Link>
          <Link to="/category/fashion"
            className="rounded overflow-hidden flex items-center gap-4 p-5 shadow-sm transition-shadow"
            style={{ background: 'linear-gradient(135deg,#8e44ad,#6c3483)', minHeight: 100, textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
          >
            <div className="text-white">
              <p className="text-xs font-bold mb-1" style={{ opacity: 0.7 }}>FASHION</p>
              <h3 className="text-lg font-black leading-tight">New Season<br />Collection 2025</h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Up to 60% off</p>
            </div>
            <div className="ml-auto" style={{ fontSize: 56, opacity: 0.18, flexShrink: 0, color: '#fff' }}>
              <Shirt size={56} />
            </div>
          </Link>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <SectionHeader title="⭐ FEATURED PRODUCTS" link="/products?is_featured=true" />
          {featured.length > 0 ? (
            <ProductGrid products={featured.slice(0, 10)} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No featured products yet</div>
          )}
        </div>

        {/* New Arrivals */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <SectionHeader title="🆕 NEW ARRIVALS" link="/products?ordering=-created_at" />
          {newArrivals.length > 0 ? (
            <ProductGrid products={newArrivals} loading={prodsLoading} />
          ) : prodsLoading ? (
            <ProductGrid products={[]} loading={true} />
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm mb-1">No products loaded yet</p>
              <p className="text-gray-300 text-xs">Products will appear once your API is running</p>
            </div>
          )}
        </div>

        {/* 4-col perks grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Free Delivery', sub: 'Orders over KES 2,000', icon: '🚚', bg: '#e8f5e9' },
            { label: 'Secure Payment', sub: 'M-Pesa & Card',         icon: '🔒', bg: '#e3f2fd' },
            { label: 'Easy Returns',   sub: '7-day policy',           icon: '↩️', bg: '#fff3e0' },
            { label: '24/7 Support',   sub: 'Always here for you',    icon: '💬', bg: '#fce4ec' },
          ].map((item) => (
            <div key={item.label} className="rounded p-4 text-center shadow-sm"
              style={{ background: item.bg }}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="font-bold text-sm text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}