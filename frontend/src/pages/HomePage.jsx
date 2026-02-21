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
    id:1,
    title:'Flash Sale – Up to 70% Off',
    subtitle:'Electronics, Fashion, Home & more. Limited time deals!',
    bg:'linear-gradient(135deg, #f68b1e 0%, #e6780a 50%, #c45e00 100%)',
    cta:'Shop Flash Sale',
    link:'/products?flash=true',
    badge:'⚡ ENDS TODAY',
    image: null,
  },
  {
    id:2,
    title:'New Season Fashion',
    subtitle:'Latest trends from Kenya\'s top brands. Free delivery over KES 2,000.',
    bg:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    cta:'Explore Fashion',
    link:'/category/fashion',
    badge:'✨ NEW ARRIVALS',
    image: null,
  },
  {
    id:3,
    title:'Smart Electronics',
    subtitle:'Phones, Laptops, TVs & Accessories at unbeatable prices.',
    bg:'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    cta:'Shop Electronics',
    link:'/category/electronics',
    badge:'🔥 BEST SELLERS',
    image: null,
  },
];

const CAT_ICONS = {
  electronics: <Laptop size={22}/>,
  fashion: <Shirt size={22}/>,
  'home-living': <Home size={22}/>,
  sports: <Dumbbell size={22}/>,
  beauty: <Sparkles size={22}/>,
  automotive: <Car size={22}/>,
  books: <BookOpen size={22}/>,
  gaming: <Gamepad2 size={22}/>,
  phones: <Phone size={22}/>,
  audio: <Headphones size={22}/>,
  watches: <Watch size={22}/>,
  cameras: <Camera size={22}/>,
  tablets: <Tablet size={22}/>,
};

const DEFAULT_CATS = [
  {id:1,name:'Phones',slug:'phones',icon:'phones'},
  {id:2,name:'Electronics',slug:'electronics',icon:'electronics'},
  {id:3,name:'Fashion',slug:'fashion',icon:'fashion'},
  {id:4,name:'Home & Living',slug:'home-living',icon:'home-living'},
  {id:5,name:'Sports',slug:'sports',icon:'sports'},
  {id:6,name:'Beauty',slug:'beauty',icon:'beauty'},
  {id:7,name:'Gaming',slug:'gaming',icon:'gaming'},
  {id:8,name:'Books',slug:'books',icon:'books'},
  {id:9,name:'Tablets',slug:'tablets',icon:'tablets'},
  {id:10,name:'Watches',slug:'watches',icon:'watches'},
];

function Skeleton({ className }) {
  return <div className={`skeleton ${className}`}/>;
}

function SectionHeader({ title, link, linkText='See All', color='#f68b1e' }) {
  return (
    <div className="section-header">
      <h2 className="section-title" style={{color}}>{title}</h2>
      <Link to={link} className="section-link flex items-center gap-1 hover:underline">
        {linkText} <ChevronRight size={14}/>
      </Link>
    </div>
  );
}

function CountdownTimer({ endTime }) {
  const [time, setTime] = useState({ h:'00', m:'00', s:'00' });
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = String(Math.floor(diff/3600000)).padStart(2,'0');
      const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
      setTime({h,m,s});
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1">Ends in</span>
      {[time.h, time.m, time.s].map((v,i) => (
        <React.Fragment key={i}>
          <span className="countdown-box">{v}</span>
          {i < 2 && <span className="text-gray-700 font-bold text-sm">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

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
    <div className="relative overflow-hidden" style={{background: b.bg || '#f68b1e', minHeight:'220px'}}>
      <div
        className="banner-slide max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6"
        style={{opacity: transitioning ? 0 : 1, transition: 'opacity 0.3s ease'}}
      >
        <div className="flex-1 text-white">
          {b.badge && (
            <span className="inline-block text-xs font-black px-3 py-1 rounded-full mb-3"
              style={{background:'rgba(255,255,255,0.25)', backdropFilter:'blur(4px)'}}>
              {b.badge}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-black leading-tight mb-2" style={{fontFamily:'Nunito, sans-serif'}}>
            {b.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-5 max-w-md">{b.subtitle}</p>
          <Link to={b.link || '/products'}
            className="inline-flex items-center gap-2 font-black text-sm px-6 py-3 rounded shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{background:'#1a1a1a', color:'#fff'}}>
            {b.cta || 'Shop Now'} <ChevronRight size={16}/>
          </Link>
        </div>
        {b.image && (
          <img src={b.image} alt={b.title} className="w-full md:w-80 h-48 md:h-56 object-cover rounded-lg shadow-2xl"/>
        )}
      </div>

      {/* Arrow controls */}
      {banners.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors hidden md:flex">
            <ChevronLeft size={18}/>
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors hidden md:flex">
            <ChevronRight size={18}/>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6, height: 6,
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)'
                }}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductRow({ products, loading, cols = 5 }) {
  if (loading) return (
    <div className={`grid gap-px`} style={{gridTemplateColumns:`repeat(${Math.min(cols, 3)}, 1fr)`, gridTemplateColumns:`repeat(${cols}, minmax(0, 1fr))`}}>
      {Array.from({length: cols}).map((_,i) => (
        <div key={i} className="bg-white p-3">
          <Skeleton className="w-full h-0 pb-[100%] mb-3 rounded"/>
          <Skeleton className="h-3 w-full mb-1 rounded"/>
          <Skeleton className="h-3 w-2/3 mb-2 rounded"/>
          <Skeleton className="h-5 w-1/2 rounded"/>
        </div>
      ))}
    </div>
  );
  return (
    <div className="grid gap-px" style={{
      gridTemplateColumns: `repeat(2, minmax(0,1fr))`,
    }}>
      <style>{`
        @media(min-width:640px){.prod-row{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
        @media(min-width:768px){.prod-row{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
        @media(min-width:1024px){.prod-row{grid-template-columns:repeat(${cols},minmax(0,1fr))!important}}
      `}</style>
      <div className="prod-row contents">
        {products.map(p => <ProductCard key={p.id} product={p}/>)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATS);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const flashEnd = useRef(Date.now() + 7*3600*1000);

  useEffect(() => {
    Promise.allSettled([
      productsAPI.featured(),
      productsAPI.list({ordering:'-created_at', page_size:10}),
      categoriesAPI.list(),
      bannersAPI.list(),
    ]).then(([featRes, newRes, catRes, banRes]) => {
      if (featRes.status==='fulfilled') setFeatured(featRes.value.data?.results || featRes.value.data || []);
      if (newRes.status==='fulfilled') {
        const d = newRes.value.data?.results || newRes.value.data || [];
        setFlashSale(d.slice(0,10));
        setNewArrivals(d.slice(0,10));
      }
      if (catRes.status==='fulfilled') {
        const d = catRes.value.data?.results || catRes.value.data;
        if (d?.length) setCategories(d);
      }
      if (banRes.status==='fulfilled') {
        const d = banRes.value.data?.results || banRes.value.data;
        if (d?.length) setBanners(d);
      }
    }).finally(() => setLoading(false));
  }, []);

  const prodsLoading = loading && featured.length === 0;

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      {/* Hero banner */}
      <HeroBanner banners={banners}/>

      {/* Trust bar */}
      <div style={{background:'#fff', borderBottom:'1px solid #e8e8e8'}} className="py-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              {icon:<Truck size={20}/>, label:'Fast Delivery', sub:'1-3 days nationwide'},
              {icon:<ShieldCheck size={20}/>, label:'100% Genuine', sub:'Verified products only'},
              {icon:<RefreshCw size={20}/>, label:'Easy Returns', sub:'7-day return policy'},
              {icon:<Star size={20} className="fill-yellow-400 text-yellow-400"/>, label:'Top Rated', sub:'5M+ happy customers'},
            ].map(({icon,label,sub}) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="text-orange-400 flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">

        {/* Categories */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <div className="section-header">
            <h2 className="section-title" style={{color:'#3d3d3d'}}>SHOP BY CATEGORY</h2>
            <Link to="/products" className="section-link flex items-center gap-1">All <ChevronRight size={14}/></Link>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {categories.slice(0,10).map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-orange-50 group transition-colors text-center">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{background:'#fff3e0', color:'#f68b1e'}}>
                    {CAT_ICONS[cat.icon || cat.slug] || <Laptop size={20}/>}
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-orange-500 font-semibold leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Flash Sale */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <div className="section-header" style={{borderColor:'#e74c3c'}}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="section-title flex items-center gap-2" style={{color:'#e74c3c'}}>
                <Zap size={18} fill="#e74c3c"/> FLASH SALE
              </h2>
              <CountdownTimer endTime={flashEnd.current}/>
            </div>
            <Link to="/products" className="section-link flex items-center gap-1" style={{color:'#e74c3c'}}>
              See All <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="border-b border-gray-100">
            {prodsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px">
                {Array.from({length:5}).map((_,i) => (
                  <div key={i} className="p-3">
                    <Skeleton className="w-full mb-3 rounded" style={{paddingTop:'100%'}}/>
                    <Skeleton className="h-3 w-full mb-1 rounded"/>
                    <Skeleton className="h-5 w-1/2 rounded"/>
                  </div>
                ))}
              </div>
            ) : flashSale.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100">
                {flashSale.slice(0,5).map(p => <ProductCard key={p.id} product={{...p, flash_sale:true}}/>)}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                Flash sales coming soon!
              </div>
            )}
          </div>
        </div>

        {/* 2-col promo banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/category/electronics"
            className="rounded overflow-hidden flex items-center gap-4 p-5 relative shadow-sm hover:shadow-md transition-shadow"
            style={{background:'linear-gradient(135deg,#0f3460,#16213e)', minHeight:'100px'}}>
            <div className="text-white">
              <p className="text-xs font-bold opacity-70 mb-1">ELECTRONICS</p>
              <h3 className="text-lg font-black leading-tight">Latest Gadgets<br/>& Accessories</h3>
              <p className="text-xs text-white/60 mt-1">From KES 500</p>
            </div>
            <div className="ml-auto text-5xl opacity-20 flex-shrink-0"><Laptop/></div>
          </Link>
          <Link to="/category/fashion"
            className="rounded overflow-hidden flex items-center gap-4 p-5 relative shadow-sm hover:shadow-md transition-shadow"
            style={{background:'linear-gradient(135deg,#8e44ad,#6c3483)', minHeight:'100px'}}>
            <div className="text-white">
              <p className="text-xs font-bold opacity-70 mb-1">FASHION</p>
              <h3 className="text-lg font-black leading-tight">New Season<br/>Collection 2025</h3>
              <p className="text-xs text-white/60 mt-1">Up to 60% off</p>
            </div>
            <div className="ml-auto text-5xl opacity-20 flex-shrink-0"><Shirt/></div>
          </Link>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <SectionHeader
            title="⭐ FEATURED PRODUCTS"
            link="/products?is_featured=true"
            linkText="See All"
          />
          {prodsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100 p-px">
              {Array.from({length:5}).map((_,i) => (
                <div key={i} className="bg-white p-3">
                  <Skeleton className="w-full mb-2 rounded" style={{height:'150px'}}/>
                  <Skeleton className="h-3 w-full mb-1 rounded"/>
                  <Skeleton className="h-5 w-2/3 rounded"/>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100 p-px">
              {featured.slice(0,10).map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No featured products yet</div>
          )}
        </div>

        {/* New arrivals */}
        <div className="bg-white rounded overflow-hidden shadow-sm">
          <SectionHeader
            title="🆕 NEW ARRIVALS"
            link="/products?ordering=-created_at"
            linkText="See All"
          />
          {prodsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100 p-px">
              {Array.from({length:5}).map((_,i) => (
                <div key={i} className="bg-white p-3">
                  <Skeleton className="w-full mb-2 rounded" style={{height:'150px'}}/>
                  <Skeleton className="h-3 w-full mb-1 rounded"/>
                  <Skeleton className="h-5 w-2/3 rounded"/>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-100 p-px">
              {newArrivals.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm mb-2">No products loaded yet</p>
              <p className="text-gray-300 text-xs">Products will appear once your API is running</p>
            </div>
          )}
        </div>

        {/* 4-col promo grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'Free Delivery', sub:'Orders over KES 2,000', icon:'🚚', bg:'#e8f5e9'},
            {label:'Secure Payment', sub:'M-Pesa & Card', icon:'🔒', bg:'#e3f2fd'},
            {label:'Easy Returns', sub:'7-day policy', icon:'↩️', bg:'#fff3e0'},
            {label:'24/7 Support', sub:'Always here for you', icon:'💬', bg:'#fce4ec'},
          ].map(item => (
            <div key={item.label} className="rounded p-4 text-center shadow-sm" style={{background:item.bg}}>
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