import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, downloadEvidence, formatDate } from '../api'

const statuses = ['New', 'In progress', 'Resolved', 'Closed']

function IncidentDetail({ isAdmin }) {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [note, setNote] = useState('')
  const [check, setCheck] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    api(`/incidents/${id}`)
      .then(setIncident)
      .catch((error) => setError(error.message))
  }, [id])

  // Runs a button's action and shows the error if it fails
  async function run(action) {
    setActionError('')
    try {
      await action()
    } catch (error) {
      setActionError(error.message)
    }
  }

  function changeStatus(event) {
    const body = { status: event.target.value }
    return run(async () => setIncident(await api(`/incidents/${id}/status`, { method: 'PUT', body })))
  }

  function addNote(event) {
    event.preventDefault()
    if (note.trim() === '') return

    return run(async () => {
      setIncident(await api(`/incidents/${id}/notes`, { method: 'POST', body: { text: note } }))
      setNote('')
    })
  }

  function verifyEvidence() {
    return run(async () => setCheck(await api(`/incidents/${id}/verify`)))
  }

  if (error) {
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/incidents">Back to incidents</Link>
      </>
    )
  }

  if (!incident) return <p>Loading...</p>

  return (
    <>
      <Link to="/incidents">Back to incidents</Link>
      <h1>{incident.title}</h1>
      <p className="meta">
        {incident.type}, reported by {incident.reporter.name} on {formatDate(incident.createdAt)}
      </p>
      <div className="badges">
        <span className={`badge severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
        <span className="badge">{incident.status}</span>
      </div>

      {actionError && <p className="error">{actionError}</p>}

      <section className="panel">
        <h2>What happened</h2>
        <p className="pre-wrap">{incident.description}</p>
      </section>

      {isAdmin && (
        <section className="panel">
          <h2>Status</h2>
          <label htmlFor="status">Change status</label>
          <select id="status" value={incident.status} onChange={changeStatus}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </section>
      )}

      {incident.evidence?.storedName && (
        <section className="panel">
          <h2>Evidence</h2>
          <p>{incident.evidence.originalName} ({Math.ceil(incident.evidence.size / 1024)} KB)</p>
          <p className="hash">SHA-256: {incident.evidence.sha256}</p>
          <button type="button" onClick={verifyEvidence}>Verify integrity</button>
          <button type="button" className="secondary" onClick={() => run(() => downloadEvidence(incident))}>
            Download
          </button>

          {check && (
            <p className={check.intact ? 'result-good' : 'result-bad'}>
              {check.intact
                ? 'Intact: the file matches its original hash.'
                : 'Tampered: the file no longer matches its original hash.'}
            </p>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Investigation notes</h2>
        {incident.notes.length === 0 && <p>No notes yet.</p>}
        {incident.notes.map((item) => (
          <div key={item._id} className="note">
            <p className="meta">{item.author}, {formatDate(item.createdAt)}</p>
            <p className="pre-wrap">{item.text}</p>
          </div>
        ))}

        {isAdmin && (
          <form onSubmit={addNote}>
            <label htmlFor="note">Add a note</label>
            <textarea id="note" rows="3" maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)} />
            <button type="submit">Add note</button>
          </form>
        )}
      </section>
    </>
  )
}

export default IncidentDetail
