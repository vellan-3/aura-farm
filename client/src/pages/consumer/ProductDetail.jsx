import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [id])

  if (loading) return <div className="p-8 text-[var(--ink-muted)]">Loading product...</div>
  if (!product || product.error) return <div className="p-8 text-[var(--error)]">Product not found.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images Side */}
      <div className="bg-[var(--surface-1)] border border-[var(--hairline)] rounded-xl aspect-square flex items-center justify-center text-6xl text-[var(--ink-muted)] overflow-hidden">
        {product.photos && product.photos.length > 0 ? (
          <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          product.name.charAt(0)
        )}
      </div>

      {/* Details Side */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="font-mono text-xs text-[var(--ink-muted)] mb-2">
            <Link to={`/farms/${product.farmerId}`} className="hover:underline flex items-center gap-1">
              {product.farmer.kycStatus === 'VERIFIED' && <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></span>}
              {product.farmer.farmName}
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] mb-2">{product.name}</h1>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium">₦{product.pricePerUnit}</span>
            <span className="text-[var(--ink-muted)]">/ {product.unit.toLowerCase()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--ink-muted)] font-mono text-[11px] rounded uppercase">{product.qualityGrade}</span>
          {product.isColdChain && <span className="px-3 py-1 bg-blue-100 text-blue-700 font-mono text-[11px] rounded uppercase">Cold Chain</span>}
        </div>

        <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap">{product.description || 'No description provided.'}</p>

        <div className="bg-[var(--canvas)] border border-[var(--hairline)] p-4 rounded-lg flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ink-muted)]">Available Stock</span>
            <span>{product.stockQty} {product.unit.toLowerCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink-muted)]">Minimum Order</span>
            <span>{product.minOrderQty} {product.unit.toLowerCase()}</span>
          </div>
        </div>

        <button onClick={() => alert('Cart functionality coming in Phase 4')} className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
          Add to Cart
        </button>
      </div>
    </div>
  )
}
