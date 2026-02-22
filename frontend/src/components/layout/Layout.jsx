import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { useCartStore } from '../../store/index.js'
import { useAuthStore } from '../../store/index.js'

export default function Layout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchCart       = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}