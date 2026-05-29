import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import FarmerDashboard from './pages/farmer/Dashboard'
import FarmerProducts from './pages/farmer/Products'
import FarmerProductForm from './pages/farmer/ProductForm'
import FarmerProfile from './pages/farmer/Profile'
import DeliveryZones from './pages/farmer/DeliveryZones'
import AdminDashboard from './pages/admin/Dashboard'
import Browse from './pages/consumer/Browse'
import ConsumerDashboard from './pages/consumer/Dashboard'
import ProductDetail from './pages/consumer/ProductDetail'
import FarmProfile from './pages/consumer/FarmProfile'
import FarmList from './pages/consumer/FarmList'
import Cart from './pages/consumer/Cart'
import Checkout from './pages/consumer/Checkout'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <div className="app-shell">
            <Sidebar />
            <main className="main">
              <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/farms" element={<FarmList />} />
          <Route path="/farms/:id" element={<FarmProfile />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            <Route element={<RoleRoute allowedRoles={['FARMER']} />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/products" element={<FarmerProducts />} />
              <Route path="/farmer/products/new" element={<FarmerProductForm />} />
              <Route path="/farmer/products/:id/edit" element={<FarmerProductForm />} />
              <Route path="/farmer/profile" element={<FarmerProfile />} />
              <Route path="/farmer/logistics" element={<DeliveryZones />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['CONSUMER']} />}>
              <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
