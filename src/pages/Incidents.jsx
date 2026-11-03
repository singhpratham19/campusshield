import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate } from '../api'
import Banner from '../components/Banner'

function Incidents({ isAdmin }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/incidents')
      .then(setIncidents)
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Banner image="students.jpg" title={isAdmin ? 'All incidents' : 'My incidents'} />
      {error && <p className="error">{error}</p>}
      {!loading && !error && incidents.length === 0 && (
        <p>
          No incidents yet. <Link to="/report">Report one</Link>
        </p>
      )}

      {incidents.map((incident) => (
        <Link key={incident._id} to={`/incidents/${incident._id}`} className="incident-row">
          <div>
            <strong>{incident.title}</strong>
            <p className="meta">
              {incident.type}, {formatDate(incident.createdAt)}
              {isAdmin && `, by ${incident.reporter.name}`}
            </p>
          </div>
          <div className="badges">
            <span className={`badge severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
            <span className="badge">{incident.status}</span>
          </div>
        </Link>
      ))}
    </>
  )
}

export default Incidents
