import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setOrder)
      .catch(console.error)
  }, [id])

  const updateStatus = async (action) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!order) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id.split('-')[0]}</h1>
        <span className="px-3 py-1 bg-[var(--surface-2)] text-sm font-mono font-medium rounded">{order.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--hairline)]">
          <h2 className="font-bold mb-4">Items</h2>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between border-b py-2 text-sm last:border-0">
              <span>{item.quantity}x {item.product.name}</span>
              <span>₦{item.subtotal}</span>
            </div>
          ))}
          <div className="flex justify-between mt-4 font-bold">
            <span>Total</span>
            <span>₦{order.totalAmount}</span>
          </div>
        </div>

        <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--hairline)] flex flex-col gap-4">
          <div>
            <span className="font-mono text-xs text-[var(--ink-muted)] block">Delivery Address</span>
            <p>{order.deliveryAddress || 'Farm Pickup'}</p>
          </div>
          <div>
            <span className="font-mono text-xs text-[var(--ink-muted)] block">Escrow Status</span>
            <p className="font-medium text-[var(--accent)]">{order.escrowStatus}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {user?.role === 'FARMER' && order.status === 'PENDING' && (
          <>
            <button onClick={() => updateStatus('confirm')} className="px-4 py-2 bg-[var(--accent)] text-white rounded">Accept Order</button>
            <button onClick={() => updateStatus('decline')} className="px-4 py-2 bg-[var(--error)] text-white rounded">Decline</button>
          </>
        )}
        {user?.role === 'FARMER' && order.status === 'CONFIRMED' && (
          <button onClick={() => updateStatus('dispatch')} className="px-4 py-2 bg-[var(--accent)] text-white rounded">Mark as Dispatched</button>
        )}
        {user?.role === 'CONSUMER' && order.status === 'DISPATCHED' && (
          <button onClick={() => updateStatus('deliver')} className="px-4 py-2 bg-[var(--ink)] text-white rounded">Confirm Delivery & Release Funds</button>
        )}
      </div>
    </div>
  )
}
