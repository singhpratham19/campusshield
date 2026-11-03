import { useEffect, useState } from 'react'
import { api, formatDate } from '../api'
import Banner from '../components/Banner'

function AuditLog() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/audit')
      .then(setEntries)
      .catch((error) => setError(error.message))
  }, [])

  return (
    <>
      <Banner image="padlock.jpg" title="Audit log" />
      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Incident</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td>{formatDate(entry.createdAt)}</td>
                <td>{entry.user}</td>
                <td>{entry.action}</td>
                <td>{entry.incidentTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AuditLog
