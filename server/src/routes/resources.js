const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');

const FILE = 'resources.json';

// Default faculty-uploaded resources
const defaultResources = [
  {
    id: uuidv4(),
    subjectCode: 'CS501',
    subject: 'Data Structures & Algorithms',
    title: 'Binary Trees - Lecture Notes',
    type: 'PDF',
    url: '/uploads/ds_trees_notes.pdf',
    description: 'Complete notes on binary tree traversals: inorder, preorder, postorder.',
    uploadedBy: 'Dr. Priya Verma',
    facultyId: 'FAC001',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS501',
    subject: 'Data Structures & Algorithms',
    title: 'Graph Algorithms Explained',
    type: 'YouTube',
    url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
    description: 'Video lecture covering BFS, DFS, and shortest path algorithms.',
    uploadedBy: 'Dr. Priya Verma',
    facultyId: 'FAC001',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS502',
    subject: 'Operating Systems',
    title: 'Process Scheduling Algorithms',
    type: 'PDF',
    url: '/uploads/os_scheduling.pdf',
    description: 'Notes covering FCFS, SJF, Round Robin, and Priority scheduling.',
    uploadedBy: 'Prof. Anil Kumar',
    facultyId: 'FAC002',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS502',
    subject: 'Operating Systems',
    title: 'Deadlock Prevention Strategies',
    type: 'Notes',
    url: '',
    content: 'Key strategies: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Use Banker\'s algorithm for safe state detection.',
    description: 'Quick reference notes on deadlock conditions and prevention.',
    uploadedBy: 'Prof. Anil Kumar',
    facultyId: 'FAC002',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS503',
    subject: 'Database Systems',
    title: 'ER Modeling Guide',
    type: 'PDF',
    url: '/uploads/db_er_modeling.pdf',
    description: 'Step-by-step guide to creating ER diagrams with examples.',
    uploadedBy: 'Dr. Meena Iyer',
    facultyId: 'FAC003',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS503',
    subject: 'Database Systems',
    title: 'SQL Tutorial - Advanced Queries',
    type: 'YouTube',
    url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    description: 'Advanced SQL: joins, subqueries, window functions, indexing.',
    uploadedBy: 'Dr. Meena Iyer',
    facultyId: 'FAC003',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    subjectCode: 'CS504',
    subject: 'Computer Networks',
    title: 'TCP/IP Protocol Suite',
    type: 'PDF',
    url: '/uploads/cn_tcpip.pdf',
    description: 'Detailed notes on TCP/IP layers, protocols, and packet structure.',
    uploadedBy: 'Prof. Raj Singh',
    facultyId: 'FAC004',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) {
    await store.writeData(FILE, defaultResources);
    return defaultResources;
  }
  return data;
}

// GET /api/resources?subjectCode=CS501
router.get('/', async (req, res) => {
  await seed();
  const { subjectCode, type, facultyId } = req.query;
  let data = await store.readData(FILE, []);
  if (subjectCode) data = data.filter((d) => d.subjectCode === subjectCode);
  if (type) data = data.filter((d) => d.type === type);
  if (facultyId) data = data.filter((d) => d.facultyId === facultyId);
  // Sort newest first
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(data);
});

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
  await seed();
  const resource = await store.findById(FILE, req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json(resource);
});

// POST /api/resources (faculty uploads resource)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let fileUrl = req.body.url || '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/resources');
      fileUrl = result.url;
    }

    const resource = {
      id: uuidv4(),
      subjectCode: req.body.subjectCode,
      subject: req.body.subject || '',
      title: req.body.title,
      type: req.body.type || 'PDF',
      url: fileUrl,
      description: req.body.description || '',
      content: req.body.content || '',
      uploadedBy: req.body.uploadedBy || 'Faculty',
      facultyId: req.body.facultyId || '',
      createdAt: new Date().toISOString(),
    };

    await store.appendData(FILE, resource);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Resource not found' });
  res.json({ message: 'Resource deleted' });
});

module.exports = router;
