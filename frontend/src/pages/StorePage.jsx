import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Store, Star, Package, CheckCircle, ChevronRight } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { storesAPI } from '../services/api'

export default function StorePage() {
  const { slug } = useParams()
  const [store, setStore]       = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      storesAPI.detail(slug),
      storesAPI.products(slug),
    ]).then(([storeRes, prodsRes]) => {
      if (storeRes.status === 'fulfilled') setStore(storeRes.value.data)
      if (prodsRes.status === 'fulfilled') {
        const d = prodsRes.value.data
        setProducts(d?.results || d || [])
      }
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 12, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 280, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  )

  if (!store) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <Store size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, marginBottom: 8 }}>Store Not Found</h2>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '60vh' }}>
      {/* Store banner */}
      <div style={{
        background: store.banner
          ? `url(${store.banner}) center/cover`
          : 'linear-gradient(135deg, #f68b1e, #e07a10)',
        minHeight: 180, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
        }} />
        <div style={{
          position: 'relative', maxWidth: 1280, margin: '0 auto',
          padding: '32px 16px', display: 'flex', alignItems: 'flex-end', gap: 20,
          minHeight: 180,
        }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
            background: '#fff', flexShrink: 0, border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {store.logo
              ? <img src={store.logo} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Store size={36} style={{ color: 'var(--jumia-orange)' }} />
            }
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: '#fff' }}>
                {store.name}
              </h1>
              {store.is_verified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--jumia-green)', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                }}>
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{store.description}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18 }}>
            Products ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No products listed yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}