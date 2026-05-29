import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('farm_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('farm_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...prev, { ...product, productId: product.id, quantity }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId)
    setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item))
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId))
  }

  const clearCart = () => setCartItems([])

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
