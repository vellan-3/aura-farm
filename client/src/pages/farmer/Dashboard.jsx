import { Link } from 'react-router-dom'

export default function FarmerDashboard() {
  return (
    <div className="section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚜</div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, marginBottom: '12px', letterSpacing: '-0.5px' }}>Farmer Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '32px', maxWidth: '420px', lineHeight: 1.6 }}>
        Welcome to your farm management panel. Start by setting up your farm profile and listing your first fresh harvest!
      </p>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/farmer/products/new" className="btn btn-accent">Add new listing</Link>
        <Link to="/farmer/profile" className="btn btn-secondary">Complete profile</Link>
      </div>
    </div>
  )
}
