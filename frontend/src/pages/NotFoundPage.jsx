import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 120, fontFamily: "'Nunito', sans-serif", fontWeight: 900,
        color: 'var(--jumia-orange)', lineHeight: 1, marginBottom: 8,
      }}>404</div>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 400, marginBottom: 32 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Home size={16} /> Back to Home
        </Link>
        <Link to="/products" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} /> Browse Products
        </Link>
      </div>
    </div>
  )
}