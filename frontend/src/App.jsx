import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorePage from './pages/StorePage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<HomePage/>}/>
          <Route path="products" element={<ProductListPage/>}/>
          <Route path="products/:slug" element={<ProductDetailPage/>}/>
          <Route path="category/:slug" element={<ProductListPage/>}/>
          <Route path="search" element={<ProductListPage/>}/>
          <Route path="stores/:slug" element={<StorePage/>}/>
          <Route path="cart" element={<CartPage/>}/>
          <Route path="wishlist" element={<PrivateRoute><WishlistPage/></PrivateRoute>}/>
          <Route path="checkout" element={<PrivateRoute><CheckoutPage/></PrivateRoute>}/>
          <Route path="orders" element={<PrivateRoute><OrdersPage/></PrivateRoute>}/>
          <Route path="orders/:id" element={<PrivateRoute><OrderDetailPage/></PrivateRoute>}/>
          <Route path="profile" element={<PrivateRoute><ProfilePage/></PrivateRoute>}/>
        </Route>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius:'4px', fontSize:'13px', fontWeight:600, fontFamily:'Nunito Sans, sans-serif' },
          success: { style: { background:'#27ae60', color:'#fff' } },
          error: { style: { background:'#e74c3c', color:'#fff' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}