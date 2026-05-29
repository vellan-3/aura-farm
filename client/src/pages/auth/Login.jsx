import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      
      login(data.user, data.token)
      if (data.user.role === 'FARMER') navigate('/farmer/dashboard')
      else if (data.user.role === 'CONSUMER') navigate('/browse')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <form onSubmit={handleSubmit} className="form-card" style={{ width: '100%', maxWidth: '400px', margin: '40px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '24px', textAlign: 'center' }}>Welcome back</h2>
        {error && <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        
        <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="form-field">
            <label className="form-label">Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="e.g. 080..." required />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>Log In</button>
        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--ink)', fontWeight: 500 }}>Sign up</Link>
        </div>
      </form>
    </div>
  )
}
