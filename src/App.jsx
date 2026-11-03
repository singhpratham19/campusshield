import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuditLog from './pages/AuditLog'
import Dashboard from './pages/Dashboard'
import IncidentDetail from './pages/IncidentDetail'
import Incidents from './pages/Incidents'
import Login from './pages/Login'
import NewIncident from './pages/NewIncident'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  function handleLogin(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  function handleLogout() {
    localStorage.clear()
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const isAdmin = user.role === 'admin'

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="page">
        <Routes>
          <Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/incidents" />} />
          <Route path="/incidents" element={<Incidents isAdmin={isAdmin} />} />
          <Route path="/incidents/:id" element={<IncidentDetail isAdmin={isAdmin} />} />
          <Route path="/report" element={<NewIncident />} />
          <Route path="/audit" element={isAdmin ? <AuditLog /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer>Pratham Singh, PRN 1032211384. Photos from Unsplash.</footer>
    </>
  )
}

export default App
