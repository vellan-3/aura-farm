import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../../components/consumer/ProductCard'

export default function FarmProfile() {
  const { id } = useParams()
  const [farm, setFarm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/farms/${id}`)
      .then(res => res.json())
      .then(data => {
        setFarm(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [id])

  if (loading) return <div className="p-8 text-[var(--ink-muted)]">Loading farm profile...</div>
  if (!farm || farm.error) return <div className="p-8 text-[var(--error)]">Farm not found.</div>

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Farm profile</div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="farm-avatar" style={{ width: '40px', height: '40px', marginBottom: 0, fontSize: '18px' }}>🌱</div>
          {farm.farmName}
          {farm.kycStatus === 'VERIFIED' && (
            <span className="kyc-badge">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M8.6 14.6L4 10l1.4-1.4 3.2 3.2 6.8-6.8L16.8 6.4z"/></svg>
              KYC Verified
            </span>
          )}
        </h1>
        <div className="farm-location" style={{ marginTop: '12px' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>
          {farm.farmAddress || 'Location unverified'}
        </div>
        <p className="page-sub" style={{ marginTop: '12px', maxWidth: '800px', lineHeight: 1.6 }}>{farm.bio || 'This farm has not provided a bio yet. They are part of the Aura Farm network.'}</p>
      </div>

      <div className="section gap-top">
        <div className="section-header">
          <div className="section-title">Active Listings ({farm.products?.length || 0})</div>
        </div>
        
        {farm.products?.length > 0 ? (
          <div className="product-grid">
            {farm.products.map(p => (
              <ProductCard key={p.id} product={{ ...p, farmer: { farmName: farm.farmName, kycStatus: farm.kycStatus } }} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)', background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: '12px' }}>
            This farm currently has no active listings.
          </div>
        )}
      </div>
    </>
  )
}
