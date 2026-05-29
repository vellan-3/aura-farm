import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({ phone: '', email: '', password: '', role: 'CONSUMER' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Registration failed')
      
      login(data.user, data.token)
      if (data.user.role === 'FARMER') navigate('/farmer/dashboard')
      else navigate('/browse')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <form onSubmit={handleSubmit} className="form-card" style={{ width: '100%', maxWidth: '400px', margin: '40px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '24px', textAlign: 'center' }}>Create an account</h2>
        {error && <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        
        <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="form-field">
            <label className="form-label">Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="form-input">
              <option value="CONSUMER">Consumer — Buy fresh food</option>
              <option value="FARMER">Farmer — Sell my produce</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" required />
          </div>
          <div className="form-field">
            <label className="form-label">Email (Optional)</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="form-input" required />
          </div>
        </div>

        <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>Sign Up</button>
        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 500 }}>Log in</Link>
        </div>
      </form>
    </div>
  )
}
