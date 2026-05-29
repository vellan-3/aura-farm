import { useState, useEffect } from 'react'

export default function DeliveryZones() {
  const [zones, setZones] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    maxRadiusKm: '',
    baseFee: '',
    feePerKm: '',
    minOrderVal: '0'
  })

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = () => {
    fetch(`${import.meta.env.VITE_API_URL}/logistics/zones`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setZones(data)
      })
      .catch(console.error)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/logistics/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setFormData({ name: '', maxRadiusKm: '', baseFee: '', feePerKm: '', minOrderVal: '0' })
        fetchZones()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteZone = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logistics/zones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      fetchZones()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Farmer view — logistics</div>
        <h1 className="page-title">Delivery Zones</h1>
        <p className="page-sub">Configure where you deliver and how much you charge.</p>
      </div>

      <div className="section gap-top">
        <div className="two-col">
          <div className="two-col-main">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Zone Name</th>
                    <th>Coverage</th>
                    <th>Base Fee</th>
                    <th>Fee/Km</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map(zone => (
                    <tr key={zone.id}>
                      <td style={{ fontWeight: 500 }}>{zone.name}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>Up to {zone.maxRadiusKm}km</td>
                      <td className="amount">₦{zone.baseFee}</td>
                      <td className="amount">₦{zone.feePerKm}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => deleteZone(zone.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {zones.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>No delivery zones configured yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="two-col-aside">
            <div className="form-card">
              <h2 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Add New Zone</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Zone Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="e.g. Lagos Island" />
                </div>
                <div className="form-field">
                  <label className="form-label">Max Radius (km)</label>
                  <input required type="number" step="0.1" value={formData.maxRadiusKm} onChange={e => setFormData({...formData, maxRadiusKm: e.target.value})} className="form-input" placeholder="e.g. 20" />
                </div>
                <div className="form-field">
                  <label className="form-label">Base Fee (₦)</label>
                  <input required type="number" value={formData.baseFee} onChange={e => setFormData({...formData, baseFee: e.target.value})} className="form-input" placeholder="1500" />
                </div>
                <div className="form-field">
                  <label className="form-label">Fee per km (₦)</label>
                  <input required type="number" value={formData.feePerKm} onChange={e => setFormData({...formData, feePerKm: e.target.value})} className="form-input" placeholder="50" />
                </div>
                <div className="form-field">
                  <label className="form-label">Min. Order Value (₦)</label>
                  <input required type="number" value={formData.minOrderVal} onChange={e => setFormData({...formData, minOrderVal: e.target.value})} className="form-input" placeholder="0" />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Save Zone</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
