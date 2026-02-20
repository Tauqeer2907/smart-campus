const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'uploads.json';

// POST /api/upload - Upload single file (photo or PDF)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = req.body.folder || 'smart_campus/general';
    const result = await uploadToCloudinary(req.file.path, folder);

    const record = {
      id: uuidv4(),
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: result.url,
      publicId: result.publicId,
      provider: result.provider,
      uploadedBy: req.body.userId || 'unknown',
      folder,
      createdAt: new Date().toISOString(),
    };

    await store.appendData(FILE, record);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const folder = req.body.folder || 'smart_campus/general';
    const results = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, folder);
      const record = {
        id: uuidv4(),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: result.url,
        publicId: result.publicId,
        provider: result.provider,
        uploadedBy: req.body.userId || 'unknown',
        folder,
        createdAt: new Date().toISOString(),
      };
      await store.appendData(FILE, record);
      results.push(record);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/upload - List uploads
router.get('/', async (req, res) => {
  const { userId, folder } = req.query;
  let data = await store.readData(FILE, []);
  if (userId) data = data.filter((d) => d.uploadedBy === userId);
  if (folder) data = data.filter((d) => d.folder === folder);
  res.json(data);
});

module.exports = router;
