import { useState } from 'react'
import { api } from '../api'

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const path = isRegister ? '/auth/register' : '/auth/login'
      onLogin(await api(path, { method: 'POST', body: form }))
    } catch (error) {
      setError(error.message)
    }
  }

  function switchMode() {
    setIsRegister(!isRegister)
    setError('')
  }

  return (
    <main className="login-page">
      <div className="login-intro">
        <h1>CampusShield</h1>
        <p>Report cyber incidents on campus and track them until they are closed.</p>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Create an account' : 'Log in'}</h2>

        {isRegister && (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" maxLength="60" value={form.name} onChange={handleChange} required />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        {isRegister && <p className="hint">Use 8 to 72 characters.</p>}

        {error && <p className="error">{error}</p>}

        <button type="submit">{isRegister ? 'Create account' : 'Log in'}</button>
        <button type="button" className="link-text" onClick={switchMode}>
          {isRegister ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </form>
    </main>
  )
}

export default Login
