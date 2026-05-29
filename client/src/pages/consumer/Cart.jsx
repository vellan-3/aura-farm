import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="section" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Looks like you haven't added any fresh produce yet.</p>
        <button onClick={() => navigate('/browse')} className="btn btn-primary">Browse the market</button>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Consumer view — checkout</div>
        <h1 className="page-title">My Cart</h1>
      </div>

      <div className="section gap-top">
        <div className="two-col">
          <div className="two-col-main">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.productId}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                      </td>
                      <td>₦{item.pricePerUnit}</td>
                      <td>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          min="1" 
                          onChange={(e) => updateQuantity(item.productId, Number(e.target.value))} 
                          className="form-input" 
                          style={{ width: '80px', padding: '6px 10px', height: 'auto' }}
                        />
                      </td>
                      <td className="amount">₦{item.pricePerUnit * item.quantity}</td>
                      <td>
                        <button onClick={() => removeFromCart(item.productId)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="two-col-aside">
            <div className="form-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
                <span className="text-muted">Subtotal</span>
                <span>₦{cartTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
                <span className="text-muted">Estimated Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ height: '1px', background: 'var(--hairline-soft)', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 500 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>₦{cartTotal}</span>
              </div>
              
              <button onClick={() => navigate('/checkout')} className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Proceed to Checkout</button>
              <Link to="/browse" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>Continue shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
