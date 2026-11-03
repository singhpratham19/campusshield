import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import Banner from '../components/Banner'

const types = ['Phishing', 'Account compromise', 'Malware', 'Lost or stolen device', 'Data leak', 'Other']
const severities = ['Low', 'Medium', 'High', 'Critical']

function NewIncident() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', type: types[0], severity: 'Medium', description: '' })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const body = new FormData()
    Object.keys(form).forEach((key) => body.append(key, form[key]))
    if (file) body.append('evidence', file)

    try {
      const incident = await api('/incidents', { method: 'POST', body })
      navigate(`/incidents/${incident._id}`)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <>
      <Banner image="laptop-team.jpg" title="Report an incident" />
      <form className="panel" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" maxLength="120" value={form.title} onChange={handleChange} required />

        <label htmlFor="type">Type</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          {types.map((type) => <option key={type}>{type}</option>)}
        </select>

        <label htmlFor="severity">Severity</label>
        <select id="severity" name="severity" value={form.severity} onChange={handleChange}>
          {severities.map((severity) => <option key={severity}>{severity}</option>)}
        </select>

        <label htmlFor="description">What happened?</label>
        <textarea id="description" name="description" rows="6" maxLength="5000" value={form.description} onChange={handleChange} required />

        <label htmlFor="evidence">Evidence file (optional)</label>
        <input id="evidence" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,.eml" onChange={(event) => setFile(event.target.files[0])} />
        <p className="hint">PDF, image, text or email file, up to 5 MB.</p>

        {error && <p className="error">{error}</p>}

        <button type="submit">Submit report</button>
      </form>
    </>
  )
}

export default NewIncident
