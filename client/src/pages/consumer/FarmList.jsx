import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function FarmList() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/farms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFarms(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const mockFarms = [
    { id: 'f1', farmName: 'Adeyemi Farms', farmAddress: 'Ikorodu, Lagos State', kycStatus: 'VERIFIED', bio: 'Family-run tomato and pepper farm operating since 2011. We grow without chemical pesticides and harvest twice per season.', rating: '4.8 ★', products: 8 },
    { id: 'f2', farmName: 'Musa Grain Co', farmAddress: 'Dala, Kano State', kycStatus: 'VERIFIED', bio: 'Large-scale grain producers specializing in white and yellow maize.', rating: '4.9 ★', products: 3 },
    { id: 'f3', farmName: 'Emeka Veggies', farmAddress: 'Awka, Anambra State', kycStatus: 'VERIFIED', bio: 'Fresh leafy greens and seasonal vegetables harvested daily.', rating: '4.7 ★', products: 12 },
  ]

  const displayFarms = farms.length > 0 ? farms : mockFarms

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Consumer view — directory</div>
        <h1 className="page-title">Verified Farms</h1>
        <p className="page-sub">Browse top-rated producers in the Aura Farm network</p>
      </div>

      <div className="section gap-top">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>Loading farms...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {displayFarms.map(farm => (
              <div key={farm.id} className="farm-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="farm-avatar">🌱</div>
                <div className="farm-name">{farm.farmName}</div>
                <div className="farm-location">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>
                  {farm.farmAddress || 'Location unverified'}
                </div>
                
                <div className="farm-meta-row">
                  <div className="farm-meta-item">
                    <span className="farm-meta-label">Rating</span>
                    <span className="farm-meta-value">{farm.rating || 'New ★'}</span>
                  </div>
                  <div className="farm-meta-item">
                    <span className="farm-meta-label">Listings</span>
                    <span className="farm-meta-value">{farm.products || '-'}</span>
                  </div>
                </div>

                <div className="farm-bio" style={{ flex: 1 }}>
                  {farm.bio || 'This farm has not provided a bio yet.'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  {farm.kycStatus === 'VERIFIED' ? (
                    <span className="kyc-badge">
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M8.6 14.6L4 10l1.4-1.4 3.2 3.2 6.8-6.8L16.8 6.4z"/></svg>
                      KYC Verified
                    </span>
                  ) : <span></span>}
                  
                  <Link to={`/farms/${farm.id}`} className="btn btn-secondary btn-sm">Visit Profile</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
