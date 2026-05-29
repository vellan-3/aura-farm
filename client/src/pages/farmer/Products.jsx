import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function FarmerProducts() {
  const [products, setProducts] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/farmer/products`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
      })
      .catch(console.error)
  }, [])

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmer/products/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmer/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-eyebrow">Farmer view — inventory</div>
          <h1 className="page-title">My Listings</h1>
          <p className="page-sub">Manage your products, pricing, and stock levels.</p>
        </div>
        <button onClick={() => navigate('/farmer/products/new')} className="btn btn-accent">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M10 4v12M4 10h12"/></svg>
          New Listing
        </button>
      </div>

      <div className="section gap-top">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>No products listed yet.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontWeight: 500 }}>{p.name}</span></td>
                    <td className="amount">₦{p.pricePerUnit} <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>/ {p.unit.toLowerCase()}</span></td>
                    <td>
                      <span className={p.stockQty < 10 ? 'product-stock low' : ''} style={{ margin: 0 }}>
                        {p.stockQty} {p.stockQty < 10 && '⚠'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(p.id)} 
                        className={`status-pill ${p.isAvailable ? 'status-confirmed' : 'status-pending'}`} 
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <span className="status-dot"></span>
                        {p.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/farmer/products/${p.id}/edit`)} className="btn btn-secondary btn-sm">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
