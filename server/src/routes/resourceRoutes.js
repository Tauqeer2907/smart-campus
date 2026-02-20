const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  postResource,
  getResources,
  pinResource,
  deleteResource,
} = require('../controllers/resourceController');

const router = express.Router();

const resourcesUploadDir = path.join(__dirname, '..', '..', 'uploads', 'resources');
if (!fs.existsSync(resourcesUploadDir)) fs.mkdirSync(resourcesUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resourcesUploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Only PDF files are allowed'));
  },
});

router.get('/', getResources);
router.post('/', protect, requireRole('faculty'), upload.single('file'), postResource);
router.patch('/:id/pin', protect, requireRole('faculty'), pinResource);
router.delete('/:id', protect, requireRole('faculty'), deleteResource);

module.exports = router;
