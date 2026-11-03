import express from 'express'
import { requireAdmin, requireLogin } from '../middleware.js'
import { AuditLog, Incident } from '../models.js'

const router = express.Router()

router.use(requireLogin, requireAdmin)

// Count incidents grouped by one field
async function countBy(field) {
  const rows = await Incident.aggregate([
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])
  return rows.map((row) => ({ label: row._id, count: row.count }))
}

// Numbers for the dashboard
router.get('/stats', async (req, res) => {
  res.json({
    total: await Incident.countDocuments(),
    byType: await countBy('type'),
    bySeverity: await countBy('severity'),
    byStatus: await countBy('status'),
  })
})

// Latest audit log entries
router.get('/audit', async (req, res) => {
  const entries = await AuditLog.find().sort({ createdAt: -1 }).limit(200)
  res.json(entries)
})

export default router
