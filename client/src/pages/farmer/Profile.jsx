import { useState, useEffect } from 'react'

export default function FarmerProfile() {
  const [profile, setProfile] = useState({
    farmName: '',
    farmAddress: '',
    bio: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/farmer/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile({
            farmName: data.farmName || '',
            farmAddress: data.farmAddress || '',
            bio: data.bio || ''
          })
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/farmer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      })
      if (res.ok) {
        setMessage('Profile updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Farmer view — settings</div>
        <h1 className="page-title">Farm Profile</h1>
        <p className="page-sub">Manage your public storefront details and bio.</p>
      </div>

      <div className="section gap-top">
        <div className="form-card" style={{ maxWidth: '600px' }}>
          {message && (
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-field">
              <label className="form-label">Farm Name</label>
              <input 
                type="text" 
                value={profile.farmName} 
                onChange={e => setProfile({...profile, farmName: e.target.value})} 
                className="form-input" 
                placeholder="e.g. Adeyemi Farms" 
                required 
              />
            </div>

            <div className="form-field">
              <label className="form-label">Headquarters Address</label>
              <input 
                type="text" 
                value={profile.farmAddress} 
                onChange={e => setProfile({...profile, farmAddress: e.target.value})} 
                className="form-input" 
                placeholder="e.g. 12 Farm Road, Ikorodu" 
                required 
              />
            </div>

            <div className="form-field">
              <label className="form-label">Farm Bio</label>
              <textarea 
                rows="4" 
                value={profile.bio} 
                onChange={e => setProfile({...profile, bio: e.target.value})} 
                className="form-input" 
                style={{ height: 'auto', padding: '12px 16px', resize: 'vertical' }}
                placeholder="Tell buyers about your farming practices, history, and what makes your produce special..."
              ></textarea>
            </div>

            <div className="form-actions" style={{ marginTop: '8px' }}>
              <button type="submit" className="btn btn-accent">Save Profile</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
