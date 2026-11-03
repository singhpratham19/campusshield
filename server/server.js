import path from 'node:path'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import incidentRoutes from './routes/incidents.js'

const app = express()
const PORT = process.env.PORT || 4100
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusshield'

app.use(express.json())

// A request with no JSON body still gets an empty body, so routes can report what is missing
app.use((req, res, next) => {
  req.body ??= {}
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// Serve the React app
app.use(express.static('dist'))
app.use((req, res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

// Runs when a route fails
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const tooBig = error.code === 'LIMIT_FILE_SIZE'
    return res.status(400).json({
      error: tooBig ? 'Evidence file must be under 5 MB.' : 'Upload one file in the evidence field.',
    })
  }
  // Two registrations with the same email at the same moment
  if (error.code === 11000) {
    return res.status(409).json({ error: 'That email is already registered.' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: 'Please fill in every field correctly.' })
  }
  if (error.name === 'CastError') {
    return res.status(404).json({ error: 'Incident not found.' })
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message })
  }
  console.error(error.message)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message)
    process.exit(1)
  })
