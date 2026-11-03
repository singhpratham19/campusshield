import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'

// Use JWT_SECRET if it is set. Otherwise create a random secret once and keep it in a file
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET

  const file = path.join(import.meta.dirname, '.jwt-secret')
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'), { mode: 0o600 })
  }
  return fs.readFileSync(file, 'utf8')
}

export const JWT_SECRET = loadSecret()

// Only allow requests that have a valid login token
export function requireLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    next()
  } catch {
    res.status(401).json({ error: 'Please log in.' })
  }
}

// Only allow admins
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only.' })
  }
  next()
}
