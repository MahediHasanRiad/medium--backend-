import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import multer from 'multer'

// Ensure the upload directory exists
const uploadDir = 'public/asset'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err, file.fieldname)
      
      const ext = path.extname(file.originalname)
      
      cb(null, `${file.fieldname}-${raw.toString('hex')}${ext}`)
    })
  }
})

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit file size to 5MB
  fileFilter: function (req, file, cb) {
    cb(null, true)
  }
})