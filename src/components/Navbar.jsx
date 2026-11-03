import { NavLink, useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  function logout() {
    onLogout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <span className="brand">CampusShield</span>
      <div className="nav-links">
        {user.role === 'admin' && <NavLink to="/" end>Dashboard</NavLink>}
        <NavLink to="/incidents">Incidents</NavLink>
        <NavLink to="/report">Report</NavLink>
        {user.role === 'admin' && <NavLink to="/audit">Audit log</NavLink>}
        <button type="button" className="link-button" onClick={logout}>
          Log out ({user.name})
        </button>
      </div>
    </nav>
  )
}

export default Navbar
