import { useEffect, useState } from 'react'
import { api } from '../api'
import Banner from '../components/Banner'

function BarList({ title, rows, total }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length === 0 && <p>No incidents yet.</p>}
      {rows.map((row) => (
        <div key={row.label} className="bar-row">
          <div className="bar-label">
            <span>{row.label}</span>
            <strong>{row.count}</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(row.count / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </section>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/stats')
      .then(setStats)
      .catch((error) => setError(error.message))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!stats) return <p>Loading...</p>

  const open = stats.byStatus
    .filter((row) => row.label === 'New' || row.label === 'In progress')
    .reduce((sum, row) => sum + row.count, 0)

  return (
    <>
      <Banner image="code.jpg" title="Dashboard" />
      <div className="stat-row">
        <div className="panel stat">
          <strong>{stats.total}</strong>
          <span>Total incidents</span>
        </div>
        <div className="panel stat">
          <strong>{open}</strong>
          <span>Open incidents</span>
        </div>
      </div>
      <div className="grid">
        <BarList title="By type" rows={stats.byType} total={stats.total} />
        <BarList title="By severity" rows={stats.bySeverity} total={stats.total} />
        <BarList title="By status" rows={stats.byStatus} total={stats.total} />
      </div>
    </>
  )
}

export default Dashboard
