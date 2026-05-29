import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-logo">Aura<span>Farm</span></div>
      </div>
      <span className="nav-badge">beta</span>

      <div className="nav-right">
        {user ? (
          <>
            <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-secondary btn-sm">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{color: 'var(--error)'}}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-accent btn-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
