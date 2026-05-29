import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, unverifiedFarmers: 0 })
  const [applications, setApplications] = useState([])

  const fetchDashboardData = () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    
    fetch(`${import.meta.env.VITE_API_URL}/admin/metrics`, { headers })
      .then(res => res.json())
      .then(setMetrics)
      .catch(console.error)

    fetch(`${import.meta.env.VITE_API_URL}/admin/kyc-applications`, { headers })
      .then(res => res.json())
      .then(setApplications)
      .catch(console.error)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const updateKycStatus = async (farmerId, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/kyc/${farmerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) fetchDashboardData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--surface-1)] border border-[var(--hairline)] p-6 rounded-xl">
          <div className="text-[var(--ink-muted)] text-sm mb-1">Total Platform Users</div>
          <div className="text-3xl font-bold">{metrics.totalUsers}</div>
        </div>
        <div className="bg-[var(--surface-1)] border border-[var(--hairline)] p-6 rounded-xl">
          <div className="text-[var(--ink-muted)] text-sm mb-1">Total Orders Fulfilled</div>
          <div className="text-3xl font-bold">{metrics.totalOrders}</div>
        </div>
        <div className="bg-[var(--surface-1)] border border-[var(--hairline)] p-6 rounded-xl">
          <div className="text-[var(--ink-muted)] text-sm mb-1">Total Transaction Value (₦)</div>
          <div className="text-3xl font-bold">₦{metrics.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--surface-1)] border border-[var(--hairline)] p-6 rounded-xl">
          <div className="text-[var(--ink-muted)] text-sm mb-1">Pending KYC Applications</div>
          <div className="text-3xl font-bold text-[var(--warning)]">{metrics.unverifiedFarmers}</div>
        </div>
      </div>

      {/* KYC Applications */}
      <div className="bg-[var(--surface-1)] border border-[var(--hairline)] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[var(--hairline-soft)]">
          <h2 className="text-xl font-bold">Pending Farmer Verifications</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--canvas)] border-b text-[var(--ink-muted)]">
            <tr>
              <th className="p-4 font-normal">Farm Name</th>
              <th className="p-4 font-normal">Contact</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Date Applied</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-[var(--ink-muted)]">No pending KYC applications.</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-[#faf9f7]">
                  <td className="p-4 font-medium">{app.farmName}</td>
                  <td className="p-4 text-[var(--ink-muted)]">{app.user?.phone}</td>
                  <td className="p-4">
                    <span className="bg-[var(--warning-light)] text-[var(--warning)] px-2 py-1 text-xs rounded-full font-mono">{app.kycStatus}</span>
                  </td>
                  <td className="p-4 text-[var(--ink-muted)]">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => updateKycStatus(app.id, 'VERIFIED')} className="text-xs bg-[var(--accent)] text-white px-3 py-1.5 rounded font-medium">Approve</button>
                    <button onClick={() => updateKycStatus(app.id, 'REJECTED')} className="text-xs bg-[var(--error-light)] text-[var(--error)] px-3 py-1.5 rounded font-medium">Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
