import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [fulfillment, setFulfillment] = useState('DELIVERY')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Create Order
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          farmerId: cartItems[0]?.farmerId || '', // Simplified: assumes all items from one farmer
          items: cartItems,
          fulfillmentType: fulfillment,
          deliveryAddress: address,
          totalAmount: cartTotal
        })
      })

      if (res.ok) {
        clearCart()
        navigate('/orders') // Redirect to order list
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="bg-[var(--surface-1)] border border-[var(--hairline)] p-6 rounded-xl flex flex-col gap-4">
        <div>
          <h2 className="font-medium mb-2">Order Summary</h2>
          <div className="flex justify-between text-[var(--ink-muted)]">
            <span>Items ({cartItems.length})</span>
            <span>₦{cartTotal}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Fulfillment Type</label>
          <select value={fulfillment} onChange={e => setFulfillment(e.target.value)} className="border p-2 rounded">
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP">Farm Pickup</option>
          </select>
        </div>

        {fulfillment === 'DELIVERY' && (
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-[var(--ink-muted)]">Delivery Address</label>
            <textarea required value={address} onChange={e => setAddress(e.target.value)} rows="3" className="border p-2 rounded"></textarea>
          </div>
        )}

        <button disabled={isProcessing} className="mt-4 bg-[var(--ink)] text-white py-3 rounded font-medium disabled:opacity-50">
          {isProcessing ? 'Processing...' : `Pay ₦${cartTotal} with Paystack`}
        </button>
      </form>
    </div>
  )
}
