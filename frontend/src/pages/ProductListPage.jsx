import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/products.css'; // Import the new CSS file

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
    <div className="products-skeleton-card">
      <div className="products-skeleton-image" />
      <div className="products-skeleton-content">
        <div className="products-skeleton-line" style={{ width: '80%' }} />
        <div className="products-skeleton-line" style={{ width: '60%' }} />
        <div className="products-skeleton-line" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="products-filter-section">
      <button
        onClick={() => setOpen(!open)}
        className="products-filter-section-header"
      >
        <span className="products-filter-section-title">{title}</span>
        {open ? (
          <i className="bi bi-chevron-up products-filter-section-icon"></i>
        ) : (
          <i className="bi bi-chevron-down products-filter-section-icon"></i>
        )}
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

  if (isMobile) return (
    <>
      <div className="products-drawer-overlay" onClick={onClose} />
      <div className="products-drawer">
        <div className="products-drawer-header">
          <span>Filters</span>
          <button onClick={onClose} className="products-drawer-close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="products-drawer-content">
          <FilterContent 
            filters={filters} 
            setFilters={setFilters} 
            localMin={localMin} 
            setLocalMin={setLocalMin}
            localMax={localMax} 
            setLocalMax={setLocalMax} 
            applyPrice={applyPrice}
          />
        </div>
        <div className="products-drawer-footer">
          <button onClick={onClose} className="btn-primary products-drawer-apply">
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="products-filter-card">
      <div className="products-filter-header">
        <span className="products-filter-title">FILTERS</span>
        <button
          onClick={() => setFilters({ordering: '-review_count', min_price: '', max_price: '', min_rating: '', in_stock: false})}
          className="products-filter-clear"
        >
          Clear all
        </button>
      </div>
      <FilterContent 
        filters={filters} 
        setFilters={setFilters} 
        localMin={localMin} 
        setLocalMin={setLocalMin}
        localMax={localMax} 
        setLocalMax={setLocalMax} 
        applyPrice={applyPrice}
      />
    </div>
  );
}

function FilterContent({ filters, setFilters, localMin, setLocalMin, localMax, setLocalMax, applyPrice }) {
  return (
    <div>
      <FilterSection title="Price Range">
        <div className="products-filter-options">
          {PRICE_RANGES.map(r => {
            const active = filters.min_price == r.min && filters.max_price == r.max;
            return (
              <label key={r.label} className="products-filter-option">
                <input 
                  type="radio" 
                  name="price_range" 
                  checked={active}
                  onChange={() => setFilters(f => ({...f, min_price: r.min, max_price: r.max}))}
                />
                <span className={active ? 'products-filter-option--active' : ''}>{r.label}</span>
              </label>
            );
          })}
        </div>
        <div className="products-filter-price-inputs">
          <input 
            type="number" 
            value={localMin} 
            onChange={e => setLocalMin(e.target.value)}
            placeholder="Min" 
            className="form-input products-filter-price-input"
          />
          <span className="products-filter-price-sep">–</span>
          <input 
            type="number" 
            value={localMax} 
            onChange={e => setLocalMax(e.target.value)}
            placeholder="Max" 
            className="form-input products-filter-price-input"
          />
        </div>
        <button onClick={applyPrice} className="products-filter-price-apply">
          Apply Price
        </button>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="products-filter-options">
          {RATINGS.map(r => {
            const active = filters.min_rating == r;
            return (
              <label key={r} className="products-filter-option">
                <input 
                  type="radio" 
                  name="rating" 
                  checked={active}
                  onChange={() => setFilters(f => ({...f, min_rating: active ? '' : r}))}
                />
                <span className={`products-filter-stars ${active ? 'products-filter-option--active' : ''}`}>
                  {'★'.repeat(r)}{'☆'.repeat(5-r)} & above
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <label className="products-filter-option">
          <input 
            type="checkbox" 
            checked={!!filters.in_stock}
            onChange={e => setFilters(f => ({...f, in_stock: e.target.checked}))}
          />
          <span>In Stock Only</span>
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
      const params = { 
        ordering: filters.ordering, 
        page, 
        search: searchQ,
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
        ...(filters.min_rating && { min_rating: filters.min_rating }),
        ...(filters.in_stock && { in_stock: true }),
      };
      const res = slug
        ? await productsAPI.byCategory(slug, params)
        : await productsAPI.list(params);
      const data = res.data;
      setProducts(data.results || data);
      const count = data.count || 0;
      const pageSize = 20;
      setPagination({ count, next: data.next, previous: data.previous, totalPages: Math.ceil(count/pageSize) });
    } catch { 
      toast.error('Failed to load products'); 
    } finally { 
      setLoading(false); 
    }
  }, [slug, filters, page, searchQ]);

  useEffect(() => { 
    fetchProducts(); 
  }, [fetchProducts]);
  
  useEffect(() => { 
    setPage(1); 
  }, [slug, searchQ]);

  const pageTitle = slug ? slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    : searchQ ? `Results for "${searchQ}"` : 'All Products';

  const sortedLabel = SORT_OPTIONS.find(o => o.value === filters.ordering)?.label || 'Sort';

  const handleSort = (opt) => {
    setFilters(f => ({...f, ordering: opt.value}));
    setActiveSortLabel(opt.label);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ordering: '-review_count', min_price: '', max_price: '', min_rating: '', in_stock: false});
    setPage(1);
  };

  const hasActiveFilters = filters.min_price || filters.max_price || filters.min_rating || filters.in_stock;

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="products-breadcrumb">
        <div className="products-breadcrumb-inner">
          <Link to="/" className="products-breadcrumb-link">Home</Link>
          <i className="bi bi-chevron-right"></i>
          {slug ? (
            <span className="products-breadcrumb-current">{slug.replace(/-/g,' ')}</span>
          ) : (
            <span className="products-breadcrumb-current">
              {searchQ ? 'Search Results' : 'All Products'}
            </span>
          )}
        </div>
      </div>

      <div className="products-container">
        {/* Top controls */}
        <div className="products-controls">
          <div className="products-controls-info">
            <h1 className="products-title">{pageTitle}</h1>
            <p className="products-count">{pagination.count.toLocaleString()} products</p>
          </div>

          <div className="products-actions">
            {/* Mobile filter btn */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className={`products-filter-mobile ${hasActiveFilters ? 'products-filter-mobile--active' : ''}`}
            >
              <i className="bi bi-funnel"></i> Filter
              {hasActiveFilters && <span className="products-filter-badge">!</span>}
            </button>

            {/* Sort dropdown */}
            <div className="products-sort">
              <button className="products-sort-btn">
                <i className="bi bi-sliders2"></i>
                <span className="products-sort-label">{sortedLabel}</span>
                <span className="sm:hidden">Sort</span>
                <i className="bi bi-chevron-down"></i>
              </button>
              <div className="products-sort-dropdown">
                {SORT_OPTIONS.map(opt => (
                  <button 
                    key={opt.value} 
                    onClick={() => handleSort(opt)}
                    className={`products-sort-option ${filters.ordering === opt.value ? 'products-sort-option--active' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View toggle */}
            <div className="products-view-toggle">
              <button 
                onClick={() => setViewMode('grid')}
                className={`products-view-btn ${viewMode === 'grid' ? 'products-view-btn--active' : ''}`}
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`products-view-btn ${viewMode === 'list' ? 'products-view-btn--active' : ''}`}
              >
                <i className="bi bi-list-ul"></i>
              </button>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="products-clear-btn">
                <i className="bi bi-x"></i> Clear
              </button>
            )}
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar filter - desktop */}
          <div className="products-filter-sidebar">
            <FilterPanel 
              filters={filters} 
              setFilters={(updater) => { 
                setFilters(updater); 
                setPage(1); 
              }} 
              isMobile={false}
            />
          </div>

          {/* Products */}
          <div className="products-grid-section">
            {loading ? (
              <div className="products-skeleton-grid">
                {Array.from({length: 12}).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty">
                <div className="products-empty-icon">
                  <i className="bi bi-search"></i>
                </div>
                <h3 className="products-empty-title">No products found</h3>
                <p className="products-empty-text">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-outline products-empty-btn">
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="products-list">
                {products.map(p => (
                  <div key={p.id} className="products-list-item">
                    <Link to={`/products/${p.slug || p.id}`} className="products-list-image-link">
                      <div className="products-list-image">
                        {p.primary_image ? (
                          <img src={p.primary_image} alt={p.name} />
                        ) : (
                          <div className="products-list-image-placeholder">
                            <i className="bi bi-box"></i>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="products-list-content">
                      <Link to={`/products/${p.slug || p.id}`}>
                        <h3 className="products-list-name">{p.name}</h3>
                      </Link>
                      <p className="products-list-store">{p.store_name}</p>
                      <div className="products-list-price-row">
                        <span className="products-list-price">
                          KES {Number(p.effective_price || p.price).toLocaleString()}
                        </span>
                        {p.discount_percent > 0 && (
                          <span className="products-list-original-price">
                            KES {Number(p.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="products-pagination">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(1)}
                  className="products-pagination-btn"
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button 
                  disabled={!pagination.previous} 
                  onClick={() => setPage(p => p - 1)}
                  className="products-pagination-btn"
                >
                  <i className="bi bi-chevron-left"></i> Prev
                </button>
                
                {Array.from({length: Math.min(5, pagination.totalPages)}, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
                  const p = start + i;
                  return (
                    <button 
                      key={p} 
                      onClick={() => setPage(p)}
                      className={`products-pagination-btn ${p === page ? 'products-pagination-btn--active' : ''}`}
                    >
                      {p}
                    </button>
                  );
                })}
                
                <button 
                  disabled={!pagination.next} 
                  onClick={() => setPage(p => p + 1)}
                  className="products-pagination-btn"
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
                <button 
                  disabled={page === pagination.totalPages} 
                  onClick={() => setPage(pagination.totalPages)}
                  className="products-pagination-btn"
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      {showMobileFilter && (
        <FilterPanel 
          filters={filters} 
          setFilters={(updater) => { 
            setFilters(updater); 
            setPage(1); 
          }}
          isMobile={true} 
          onClose={() => setShowMobileFilter(false)}
        />
      )}
    </div>
  );
}