import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
      })
      .catch(console.error)
  }, [])

  const mockOrders = [
    { id: 'ORD-0041', farmer: { farmName: 'Adeyemi Farms' }, itemsDesc: 'Roma Tomatoes · 5kg', totalAmount: 1900, status: 'DISPATCHED', createdAt: new Date().toISOString() },
    { id: 'ORD-0038', farmer: { farmName: 'Musa Grain Co' }, itemsDesc: 'White Maize · 2 bags', totalAmount: 1300, status: 'DELIVERED', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ORD-0035', farmer: { farmName: 'Emeka Veggies' }, itemsDesc: 'Ugwu · 10 bunches', totalAmount: 1200, status: 'DELIVERED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'ORD-0031', farmer: { farmName: 'Nwachukwu Roots' }, itemsDesc: 'Yam Tubers · 3 crates', totalAmount: 3600, status: 'CONFIRMED', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]

  const displayOrders = orders.length > 0 ? orders : mockOrders

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending'
      case 'CONFIRMED': return 'status-confirmed'
      case 'PACKED': return 'status-packed'
      case 'DISPATCHED': return 'status-dispatched'
      case 'DELIVERED': return 'status-delivered'
      default: return 'status-pending'
    }
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">{user?.role === 'FARMER' ? 'Farmer view — sales' : 'Consumer view — history'}</div>
        <h1 className="page-title">My Orders</h1>
      </div>

      <div className="section gap-top">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                {user?.role === 'CONSUMER' && <th>Farm</th>}
                <th>Items</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map(order => (
                <tr key={order.id}>
                  <td><span className="order-id">#{order.id.split('-')[0]}</span></td>
                  
                  {user?.role === 'CONSUMER' && (
                    <td>{order.farmer?.farmName || 'Verified Farm'}</td>
                  )}
                  
                  <td>{order.itemsDesc || `${order.items?.length || 1} items`}</td>
                  
                  <td className="amount">₦{order.totalAmount}</td>
                  
                  <td style={{ color: 'var(--ink-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  
                  <td>
                    <span className={`status-pill ${getStatusClass(order.status)}`}>
                      <span className="status-dot"></span>
                      {capitalize(order.status)}
                    </span>
                  </td>
                  
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">View details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
