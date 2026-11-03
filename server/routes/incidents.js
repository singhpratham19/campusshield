import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { requireAdmin, requireLogin } from '../middleware.js'
import { Incident, logAction } from '../models.js'

const router = express.Router()

// Evidence files: 5 MB limit and common file types only
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.eml']

    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      callback(null, true)
    } else {
      const error = new Error('Evidence must be a PDF, image, text or email file.')
      error.status = 400
      callback(error)
    }
  },
})

function fileHash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

// Find an incident the user is allowed to see
async function findIncident(req, res) {
  const incident = await Incident.findById(req.params.id).populate('reporter', 'name email')
  const allowed =
    incident && (req.user.role === 'admin' || incident.reporter.id === req.user.id)

  if (!allowed) {
    res.status(404).json({ error: 'Incident not found.' })
    return null
  }
  return incident
}

router.use(requireLogin)

// Students see their own incidents, admins see all
router.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { reporter: req.user.id }
  const incidents = await Incident.find(filter)
    .populate('reporter', 'name')
    .sort({ createdAt: -1 })
  res.json(incidents)
})

// Report an incident, with an optional evidence file
router.post('/', upload.single('evidence'), async (req, res) => {
  const { title, type, severity, description } = req.body
  const data = { title, type, severity, description, reporter: req.user.id }

  if (req.file && req.file.size === 0) {
    fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'The evidence file is empty.' })
  }

  if (req.file) {
    data.evidence = {
      // multer reads file names as latin1, which garbles non-English names
      originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      storedName: req.file.filename,
      size: req.file.size,
      sha256: fileHash(req.file.path),
    }
  }

  try {
    const incident = await Incident.create(data)
    await logAction(req.user, 'Reported an incident', incident)
    res.status(201).json(incident)
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path)
    throw error
  }
})

// View one incident
router.get('/:id', async (req, res) => {
  const incident = await findIncident(req, res)
  if (incident) res.json(incident)
})

// Admin: change the status
router.put('/:id/status', requireAdmin, async (req, res) => {
  const incident = await findIncident(req, res)
  if (!incident) return

  incident.status = req.body.status
  await incident.save()
  await logAction(req.user, `Changed status to ${incident.status}`, incident)
  res.json(incident)
})

// Admin: add an investigation note
router.post('/:id/notes', requireAdmin, async (req, res) => {
  const incident = await findIncident(req, res)
  if (!incident) return

  incident.notes.push({ text: req.body.text, author: req.user.name })
  await incident.save()
  await logAction(req.user, 'Added a note', incident)
  res.status(201).json(incident)
})

// Check that the evidence file has not changed since it was uploaded
router.get('/:id/verify', async (req, res) => {
  const incident = await findIncident(req, res)
  if (!incident) return

  if (!incident.evidence?.storedName) {
    return res.status(404).json({ error: 'This incident has no evidence file.' })
  }

  const filePath = path.join('uploads', incident.evidence.storedName)
  const currentHash = fs.existsSync(filePath) ? fileHash(filePath) : null
  const intact = currentHash === incident.evidence.sha256

  await logAction(
    req.user,
    `Verified evidence: ${intact ? 'intact' : 'TAMPERED'}`,
    incident
  )
  res.json({ intact, originalHash: incident.evidence.sha256, currentHash })
})

// Download the evidence file
router.get('/:id/evidence', async (req, res) => {
  const incident = await findIncident(req, res)
  if (!incident) return

  if (!incident.evidence?.storedName) {
    return res.status(404).json({ error: 'This incident has no evidence file.' })
  }

  await logAction(req.user, 'Downloaded evidence', incident)
  res.download(
    path.resolve('uploads', incident.evidence.storedName),
    incident.evidence.originalName
  )
})

export default router
