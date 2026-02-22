import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import MobileDrawer from './MobileDrawer.jsx'
import { useCartStore } from '../../store/index.js'
import { useAuthStore } from '../../store/index.js'

export default function Layout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchCart       = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <MobileDrawer />
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}