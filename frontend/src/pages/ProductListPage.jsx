import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal, ChevronDown, ChevronRight, X, Grid3X3,
  LayoutList, Search, Filter, ChevronUp
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Most Popular', value: '-review_count' },
  { label: 'Newest First', value: '-created_at' },
  { label: 'Price: Low → High', value: 'price' },
  { label: 'Price: High → Low', value: '-price' },
  { label: 'Best Rated', value: '-rating' },
  { label: 'Most Discounted', value: '-discount_percent' },
];

const PRICE_RANGES = [
  { label: 'Under KES 500', min: 0, max: 500 },
  { label: 'KES 500 – 1,000', min: 500, max: 1000 },
  { label: 'KES 1,000 – 5,000', min: 1000, max: 5000 },
  { label: 'KES 5,000 – 20,000', min: 5000, max: 20000 },
  { label: 'KES 20,000 – 50,000', min: 20000, max: 50000 },
  { label: 'Above KES 50,000', min: 50000, max: 9999999 },
];

const RATINGS = [4, 3, 2, 1];

function Skeleton() {
  return (
    <div className="bg-white rounded overflow-hidden border border-gray-100">
      <div className="skeleton w-full" style={{paddingTop:'100%'}}/>
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-full rounded"/>
        <div className="skeleton h-3 w-2/3 rounded"/>
        <div className="skeleton h-4 w-1/2 rounded"/>
      </div>
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-3 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
      </button>
      {open && children}
    </div>
  );
}

function FilterPanel({ filters, setFilters, onClose, isMobile }) {
  const [localMin, setLocalMin] = useState(filters.min_price);
  const [localMax, setLocalMax] = useState(filters.max_price);

  const applyPrice = () => {
    setFilters(f => ({...f, min_price: localMin, max_price: localMax}));
  };

  const panelClass = isMobile
    ? 'fixed inset-0 z-50 flex'
    : 'bg-white rounded shadow-sm p-4 w-56 flex-shrink-0 sticky top-24 self-start';

  if (isMobile) return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}/>
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl" style={{animation:'slideIn 0.25s ease'}}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{background:'#f68b1e'}}>
          <span className="text-white font-bold">Filters</span>
          <button onClick={onClose} className="text-white"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <FilterContent filters={filters} setFilters={setFilters} localMin={localMin} setLocalMin={setLocalMin}
            localMax={localMax} setLocalMax={setLocalMax} applyPrice={applyPrice}/>
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full btn-primary py-3">Apply Filters</button>
        </div>
      </div>
    </>
  );

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 text-sm">FILTERS</span>
        <button
          onClick={() => setFilters({ordering:'-review_count',min_price:'',max_price:'',min_rating:''})}
          className="text-xs text-orange-500 hover:underline"
        >Clear all</button>
      </div>
      <FilterContent filters={filters} setFilters={setFilters} localMin={localMin} setLocalMin={setLocalMin}
        localMax={localMax} setLocalMax={setLocalMax} applyPrice={applyPrice}/>
    </div>
  );
}

function FilterContent({ filters, setFilters, localMin, setLocalMin, localMax, setLocalMax, applyPrice }) {
  return (
    <div>
      <FilterSection title="Price Range">
        <div className="space-y-1.5 mb-3">
          {PRICE_RANGES.map(r => {
            const active = filters.min_price == r.min && filters.max_price == r.max;
            return (
              <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="price_range" checked={active}
                  onChange={() => setFilters(f => ({...f, min_price: r.min, max_price: r.max}))}
                  className="accent-orange-500"/>
                <span className={`text-xs ${active ? 'text-orange-600 font-semibold' : 'text-gray-600 group-hover:text-orange-500'}`}>{r.label}</span>
              </label>
            );
          })}
        </div>
        <div className="flex gap-2 items-center">
          <input type="number" value={localMin} onChange={e=>setLocalMin(e.target.value)}
            placeholder="Min" className="form-input py-1.5 text-xs w-full"/>
          <span className="text-gray-400 flex-shrink-0 text-xs">–</span>
          <input type="number" value={localMax} onChange={e=>setLocalMax(e.target.value)}
            placeholder="Max" className="form-input py-1.5 text-xs w-full"/>
        </div>
        <button onClick={applyPrice} className="w-full mt-2 text-xs font-bold py-1.5 rounded border border-orange-400 text-orange-500 hover:bg-orange-50">
          Apply Price
        </button>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="space-y-1.5">
          {RATINGS.map(r => {
            const active = filters.min_rating == r;
            return (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="rating" checked={active}
                  onChange={() => setFilters(f => ({...f, min_rating: active ? '' : r}))}
                  className="accent-orange-500"/>
                <span className={`text-xs flex items-center gap-1 ${active ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                  {'★'.repeat(r)}{'☆'.repeat(5-r)} & above
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!filters.in_stock}
            onChange={e => setFilters(f => ({...f, in_stock: e.target.checked}))}
            className="accent-orange-500"/>
          <span className="text-xs text-gray-600">In Stock Only</span>
        </label>
      </FilterSection>
    </div>
  );
}

export default function ProductListPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('search') || searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    ordering: '-review_count',
    min_price: '',
    max_price: '',
    min_rating: '',
    in_stock: false,
  });
  const [activeSortLabel, setActiveSortLabel] = useState('Most Popular');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ordering: filters.ordering, page, search: searchQ };
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      const res = slug
        ? await productsAPI.byCategory(slug, params)
        : await productsAPI.list(params);
      const data = res.data;
      setProducts(data.results || data);
      const count = data.count || 0;
      const pageSize = 20;
      setPagination({ count, next: data.next, previous: data.previous, totalPages: Math.ceil(count/pageSize) });
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [slug, filters, page, searchQ]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [slug, searchQ]);

  const pageTitle = slug ? slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    : searchQ ? `Results for "${searchQ}"` : 'All Products';

  const sortedLabel = SORT_OPTIONS.find(o => o.value === filters.ordering)?.label || 'Sort';

  const handleSort = (opt) => {
    setFilters(f => ({...f, ordering: opt.value}));
    setActiveSortLabel(opt.label);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ordering:'-review_count', min_price:'', max_price:'', min_rating:'', in_stock:false});
    setPage(1);
  };

  const hasActiveFilters = filters.min_price || filters.max_price || filters.min_rating || filters.in_stock;

  return (
    <div className="min-h-screen" style={{background:'#f5f5f5'}}>
      {/* Breadcrumb */}
      <div style={{background:'#fff', borderBottom:'1px solid #e8e8e8'}} className="py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 text-xs text-gray-500">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <ChevronRight size={12}/>
          {slug ? (
            <span className="text-gray-800 font-semibold capitalize">{slug.replace(/-/g,' ')}</span>
          ) : (
            <span className="text-gray-800 font-semibold">{searchQ ? 'Search Results' : 'All Products'}</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {/* Top controls */}
        <div className="bg-white rounded shadow-sm p-3 mb-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-base text-gray-900 truncate capitalize">{pageTitle}</h1>
            <p className="text-xs text-gray-400">{pagination.count.toLocaleString()} products</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile filter btn */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 border rounded text-sm font-semibold"
              style={{borderColor: hasActiveFilters ? '#f68b1e' : '#ddd', color: hasActiveFilters ? '#f68b1e' : '#3d3d3d'}}
            >
              <Filter size={14}/> Filter
              {hasActiveFilters && <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
            </button>

            {/* Sort dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 border rounded text-sm font-semibold text-gray-700 hover:border-orange-400 bg-white">
                <SlidersHorizontal size={14}/> <span className="hidden sm:inline">{sortedLabel}</span><span className="sm:hidden">Sort</span> <ChevronDown size={12}/>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white shadow-xl rounded border border-gray-100 w-52 z-20 hidden group-hover:block">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => handleSort(opt)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-600 ${filters.ordering === opt.value ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-700'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border rounded overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode==='grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                <Grid3X3 size={14}/>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode==='list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                <LayoutList size={14}/>
              </button>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline px-2">
                <X size={12}/> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Sidebar filter - desktop */}
          <div className="hidden lg:block">
            <FilterPanel filters={filters} setFilters={(updater) => { setFilters(updater); setPage(1); }} isMobile={false}/>
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-3 ${viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'}`}>
                {Array.from({length:12}).map((_,i) => <Skeleton key={i}/>)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded shadow-sm py-20 text-center">
                <Search size={48} className="mx-auto text-gray-200 mb-4"/>
                <h3 className="text-lg font-bold text-gray-600 mb-1">No products found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200 rounded overflow-hidden shadow-sm">
                {products.map(p => <ProductCard key={p.id} product={p}/>)}
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded shadow-sm flex gap-4 p-3 hover:shadow-md transition-shadow">
                    <Link to={`/products/${p.slug || p.id}`} className="flex-shrink-0">
                      <div className="w-28 h-28 bg-gray-50 rounded overflow-hidden">
                        {p.primary_image ? (
                          <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover"/>
                        ) : <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">📦</div>}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${p.slug || p.id}`}>
                        <h3 className="text-sm font-semibold text-gray-800 hover:text-orange-500 mb-1 line-clamp-2">{p.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mb-1">{p.store_name}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-base" style={{color:'#e74c3c'}}>KES {Number(p.effective_price || p.price).toLocaleString()}</span>
                        {p.discount_percent > 0 && (
                          <span className="text-xs text-gray-400 line-through">KES {Number(p.price).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1 flex-wrap">
                <button disabled={page === 1} onClick={() => setPage(1)}
                  className="px-3 py-2 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">«</button>
                <button disabled={!pagination.previous} onClick={() => setPage(p => p-1)}
                  className="px-3 py-2 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">‹ Prev</button>
                {Array.from({length: Math.min(5, pagination.totalPages)}, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="px-3 py-2 border rounded text-sm font-semibold"
                      style={{background: p===page ? '#f68b1e' : 'white', color: p===page ? '#fff' : '#3d3d3d', borderColor: p===page ? '#f68b1e' : '#ddd'}}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={!pagination.next} onClick={() => setPage(p => p+1)}
                  className="px-3 py-2 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">Next ›</button>
                <button disabled={page === pagination.totalPages} onClick={() => setPage(pagination.totalPages)}
                  className="px-3 py-2 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">»</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      {showMobileFilter && (
        <FilterPanel filters={filters} setFilters={(updater) => { setFilters(updater); setPage(1); }}
          isMobile={true} onClose={() => setShowMobileFilter(false)}/>
      )}
    </div>
  );
}