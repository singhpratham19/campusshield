// Sends a request to the server with the login token
export async function api(path, options = {}) {
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  // FormData sets its own content type for file uploads
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(`/api${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  // The login has expired: go back to the login page
  if (response.status === 401 && !path.startsWith('/auth/')) {
    localStorage.clear()
    window.location.reload()
  }

  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

// Downloads the evidence file for an incident
export async function downloadEvidence(incident) {
  const response = await fetch(`/api/incidents/${incident._id}/evidence`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  if (response.status === 401) {
    localStorage.clear()
    window.location.reload()
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'The evidence file could not be downloaded.')
  }

  const url = URL.createObjectURL(await response.blob())

  const link = document.createElement('a')
  link.href = url
  link.download = incident.evidence.originalName
  link.click()
  URL.revokeObjectURL(url)
}

export function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
