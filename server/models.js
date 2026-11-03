import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
  },
  { timestamps: true }
)

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: String, required: true },
  },
  { timestamps: true }
)

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    type: {
      type: String,
      required: true,
      enum: ['Phishing', 'Account compromise', 'Malware', 'Lost or stolen device', 'Data leak', 'Other'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
    },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      required: true,
      enum: ['New', 'In progress', 'Resolved', 'Closed'],
      default: 'New',
    },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: [noteSchema],
    evidence: {
      originalName: String,
      storedName: String,
      size: Number,
      sha256: String,
    },
  },
  { timestamps: true }
)

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    action: { type: String, required: true },
    incidentTitle: String,
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
export const Incident = mongoose.model('Incident', incidentSchema)
export const AuditLog = mongoose.model('AuditLog', auditLogSchema)

// Add one line to the audit log
export function logAction(user, action, incident) {
  return AuditLog.create({
    user: user.name,
    action: action,
    incidentTitle: incident ? incident.title : undefined,
  })
}
