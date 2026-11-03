// Creates the admin account and sets the demo password on every account: npm run seed
// Set ADMIN_PASSWORD to use a different password
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { User } from './models.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusshield'
const email = 'admin@123'
const password = process.env.ADMIN_PASSWORD || 'admin1234'

if (password.length < 8 || Buffer.byteLength(password) > 72) {
  console.error('ADMIN_PASSWORD must be 8 to 72 characters.')
  process.exit(1)
}

await mongoose.connect(MONGODB_URI)

const passwordHash = await bcrypt.hash(password, 10)
const admin = await User.findOne({ role: 'admin' })

if (admin) {
  admin.email = email
  await admin.save()
  console.log(`Admin login: ${email}`)
} else {
  await User.create({ name: 'Admin', email, passwordHash, role: 'admin' })
  console.log(`Admin created: ${email}`)
}

const result = await User.updateMany({}, { passwordHash })
console.log(`Password set on ${result.matchedCount} account(s).`)

await mongoose.disconnect()
