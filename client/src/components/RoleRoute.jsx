import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'FARMER') return <Navigate to="/farmer/dashboard" replace />
    if (user.role === 'CONSUMER') return <Navigate to="/consumer/dashboard" replace />
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
