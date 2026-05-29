import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Sidebar() {
  const { user } = useAuth()
  const { cartItems } = useCart()
  const location = useLocation()
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <aside className="sidebar">
      {user?.role !== 'FARMER' && (
        <>
          {/* CONSUMER SECTION */}
          <div className="sidebar-section">
            <div className="sidebar-label">Consumer</div>
            
            <Link to="/browse" className={`sidebar-item ${isActive('/browse') || isActive('/')}`}>
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>
              Browse products
            </Link>
            
            <Link to="/farms" className={`sidebar-item ${isActive('/farms')}`}>
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M9 20V12h2v8"/></svg>
              Farms
            </Link>
            
            <Link to="/cart" className={`sidebar-item ${isActive('/cart')}`}>
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5m12-5l2 5"/><circle cx="9" cy="18.5" r="1"/><circle cx="17" cy="18.5" r="1"/></svg>
              My cart
              {cartCount > 0 ? <span className="badge">{cartCount}</span> : <span className="badge">3</span>}
            </Link>
            
            <Link to="/orders" className={`sidebar-item ${isActive('/orders')}`}>
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm0 8h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1z"/></svg>
              My orders
              <span className="badge-warn">1 active</span>
            </Link>
            
            <div className="sidebar-item">
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10a7 7 0 1014 0A7 7 0 003 10zm7-4v4l3 3"/></svg>
              Subscriptions
            </div>
          </div>

          <div className="sidebar-divider"></div>

          {/* DISCOVER SECTION */}
          <div className="sidebar-section">
            <div className="sidebar-label">Discover</div>
            <div className="sidebar-item">
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 2l1.5 5H17l-4.5 3.3 1.5 5L10 12.3 6 15.3l1.5-5L3 7h5.5z"/></svg>
              Top farms
            </div>
            <div className="sidebar-item">
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 10h16M10 2v16M5.5 4.5l9 11M14.5 4.5l-9 11"/></svg>
              Price tracker
            </div>
            <div className="sidebar-item">
              <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 4v4l2.5 2.5"/></svg>
              Seasonal alerts
            </div>
          </div>
        </>
      )}

      {user?.role === 'FARMER' && (
        <div className="sidebar-section">
          <div className="sidebar-label">Farmer</div>
          <Link to="/farmer/dashboard" className={`sidebar-item ${isActive('/farmer/dashboard')}`}>
            <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="14" height="10" rx="1.5"/><path d="M6 8V6a4 4 0 018 0v2"/></svg>
            Farmer dashboard
          </Link>
          <Link to="/farmer/products" className={`sidebar-item ${isActive('/farmer/products')}`}>
            <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 4v12M8 8v8M4 12v4M16 6v10"/></svg>
            My listings
          </Link>
          <Link to="/farmer/logistics" className={`sidebar-item ${isActive('/farmer/logistics')}`}>
            <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 2l1.5 5H17l-4.5 3.3 1.5 5L10 12.3 6 15.3l1.5-5L3 7h5.5z"/></svg>
            Logistics setup
          </Link>
          <Link to="/farmer/profile" className={`sidebar-item ${isActive('/farmer/profile')}`}>
            <svg className="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Farm Profile
          </Link>
        </div>
      )}

    </aside>
  )
}
