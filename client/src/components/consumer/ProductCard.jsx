import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  let emoji = '📦'
  const name = product.name.toLowerCase()
  if (name.includes('tomato')) emoji = '🍅'
  else if (name.includes('yam') || name.includes('tuber')) emoji = '🍠'
  else if (name.includes('onion')) emoji = '🧅'
  else if (name.includes('pepper') || name.includes('tatashe')) emoji = '🌶️'
  else if (name.includes('maize') || name.includes('corn')) emoji = '🌽'
  else if (name.includes('ugwu') || name.includes('veg')) emoji = '🫛'

  return (
    <div className="product-card">
      <div className="product-img" style={{ background: '#f0f7f0' }}>
        <div className="product-img-placeholder">{emoji}</div>
        <div className="product-badges">
          {product.qualityGrade === 'PREMIUM' && <span className="badge badge-grade-premium">Premium</span>}
          {product.qualityGrade === 'STANDARD' && <span className="badge badge-grade-standard">Standard</span>}
          {product.qualityGrade === 'BUDGET' && <span className="badge badge-grade-budget">Budget</span>}
          {product.trend && <span className={`badge ${product.trendClass || 'badge-trend-neutral'}`}>{product.trend}</span>}
        </div>
      </div>
      <div className="product-body">
        <div className="product-farm">
          <span className="verified-dot"></span> {product.farmer?.farmName || 'Verified Farm'} 
          {product.region && <span className="text-muted"> · {product.region}</span>}
        </div>
        <div className="product-name">{product.name}</div>
        <div className="product-price-row">
          <span className="product-price">₦{product.pricePerUnit}</span>
          <span className="product-unit">/ {product.unit}</span>
        </div>
        <div className={`product-stock ${product.stockQuantity < 10 ? 'low' : ''}`}>
          {product.stockQuantity < 10 ? (
            <>⚠ {product.stockQuantity} {product.unit} remaining {product.harvestDate ? <span className="text-muted">· {product.harvestDate}</span> : ''}</>
          ) : (
            <>In stock · {product.stockQuantity} {product.unit}s {product.harvestDate ? <span className="text-muted">· {product.harvestDate}</span> : ''}</>
          )}
        </div>
        <div className="product-card-footer">
          {product.stockQuantity < 10 && product.name.includes('Tatashe') ? (
            <button className="btn btn-accent btn-sm" style={{ flex: 1 }}>Pre-order</button>
          ) : (
            <button onClick={() => addToCart(product, 1)} className="btn btn-accent btn-sm" style={{ flex: 1 }}>Add to cart</button>
          )}
          <Link to={`/products/${product.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', justifyContent: 'center' }}>View</Link>
        </div>
      </div>
    </div>
  )
}
