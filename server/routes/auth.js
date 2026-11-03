import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../middleware.js'
import { logAction, User } from '../models.js'

const router = express.Router()

const MAX_FAILURES = 5
const LOCK_MINUTES = 1
const failures = new Map() // email -> { count, lockedUntil }

// Compared against for unknown emails, so they take as long as real ones
const decoyHash = bcrypt.hashSync('not a real password', 10)

// Create a login token and the user details sent to the browser
function loginResponse(user) {
  const details = { id: user.id, name: user.name, role: user.role }
  const token = jwt.sign(details, JWT_SECRET, { expiresIn: '1d' })
  return { token, user: details }
}

function recordFailure(email) {
  const entry = failures.get(email) || { count: 0, lockedUntil: 0 }
  entry.count += 1
  if (entry.count >= MAX_FAILURES) {
    entry.count = 0
    entry.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000
  }
  failures.set(email, entry)
}

// Register a new student
router.post('/register', async (req, res) => {
  const { name: rawName, email: rawEmail, password } = req.body

  if (typeof rawName !== 'string' || typeof rawEmail !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Enter your name, email and password.' })
  }

  const name = rawName.trim()
  const email = rawEmail.trim().toLowerCase()

  if (name === '' || name.length > 60 || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Enter your name and a valid email.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }
  // bcrypt ignores everything after 72 bytes
  if (Buffer.byteLength(password) > 72) {
    return res.status(400).json({ error: 'Password must be at most 72 characters.' })
  }
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'That email is already registered.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })

  await logAction(user, 'Registered an account')
  res.status(201).json(loginResponse(user))
})

// Log in
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if ((failures.get(email)?.lockedUntil || 0) > Date.now()) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in a minute.' })
  }

  const user = await User.findOne({ email })
  const correct = await bcrypt.compare(password, user ? user.passwordHash : decoyHash)

  if (!user || !correct) {
    recordFailure(email)
    return res.status(401).json({ error: 'Wrong email or password.' })
  }

  failures.delete(email)
  await logAction(user, 'Logged in')
  res.json(loginResponse(user))
})

export default router
