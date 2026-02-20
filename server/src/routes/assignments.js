const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');

const FILE = 'assignments.json';

const defaultData = [
  { id: 'ASG001', title: 'Binary Tree Traversal Implementation', subject: 'Data Structures', subjectCode: 'CS501', dueDate: '2026-03-15T23:59:00', status: 'pending', branch: 'Computer Science', semester: 5, module: 'Trees', description: 'Implement inorder, preorder, and postorder traversal for a binary tree. Write test cases for each traversal method. Submit as a single PDF with code and output screenshots.', totalMarks: 50, guidelines: 'PDF only, max 5MB. Include code, output screenshots, and a brief explanation.', timestamp: new Date().toISOString(), assignedBy: 'Dr. Priya Verma', facultyId: 'FAC001', referenceFile: null },
  { id: 'ASG002', title: 'Process Scheduling Simulation', subject: 'Operating Systems', subjectCode: 'CS502', dueDate: '2026-03-10T23:59:00', status: 'pending', branch: 'Computer Science', semester: 5, module: 'Scheduling', description: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms. Compare turnaround time and waiting time for a given set of processes. Provide detailed analysis with graphs.', totalMarks: 40, guidelines: 'PDF or DOCX, max 5MB. Include simulation code and comparison charts.', timestamp: new Date().toISOString(), assignedBy: 'Prof. Anil Kumar', facultyId: 'FAC002', referenceFile: null },
  { id: 'ASG003', title: 'ER Diagram for Library System', subject: 'Database Systems', subjectCode: 'CS503', dueDate: '2026-03-08T23:59:00', status: 'submitted', grade: 'A', branch: 'Computer Science', semester: 5, module: 'ER Modeling', description: 'Design a complete ER diagram for a library management system with entities: Book, Member, Transaction, Author, Category. Include all relationships and cardinalities.', totalMarks: 30, guidelines: 'PDF only. Use standard ER notation.', timestamp: new Date().toISOString(), assignedBy: 'Dr. Meena Iyer', facultyId: 'FAC003', referenceFile: null, submittedAt: '2026-03-05T14:30:00', submissionFile: null },
  { id: 'ASG004', title: 'TCP Chat Application', subject: 'Computer Networks', subjectCode: 'CS504', dueDate: '2026-03-20T23:59:00', status: 'pending', branch: 'Computer Science', semester: 5, module: 'Transport Layer', description: 'Build a multi-client chat application using TCP sockets. The server should handle multiple clients simultaneously. Implement message broadcasting and private messaging.', totalMarks: 60, guidelines: 'Submit ZIP with source code and README. Include instructions to run.', timestamp: new Date().toISOString(), assignedBy: 'Prof. Raj Singh', facultyId: 'FAC004', referenceFile: null },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) { await store.writeData(FILE, defaultData); return defaultData; }
  return data;
}

// GET /api/assignments
router.get('/', async (req, res) => {
  await seed();
  const { branch, status, subject, subjectCode, semester } = req.query;
  let data = await store.readData(FILE, []);
  if (branch) data = data.filter((d) => d.branch === branch);
  if (status) data = data.filter((d) => d.status === status);
  if (subject) data = data.filter((d) => d.subject === subject);
  if (subjectCode) data = data.filter((d) => d.subjectCode === subjectCode);
  if (semester) data = data.filter((d) => d.semester === parseInt(semester));
  res.json(data);
});

// GET /api/assignments/:assignmentId (full detail for one assignment)
router.get('/:id', async (req, res) => {
  await seed();
  const assignment = await store.findById(FILE, req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json(assignment);
});

// POST /api/assignments (faculty creates assignment)
router.post('/', async (req, res) => {
  const assignment = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };
  await store.appendData(FILE, assignment);
  res.status(201).json(assignment);
});

// PUT /api/assignments/:id (update / grade)
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, {
    ...req.body,
    lastUpdated: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Assignment not found' });
  res.json(updated);
});

// POST /api/assignments/submit (student submits assignment with file - unified endpoint)
router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;
    if (!assignmentId) return res.status(400).json({ error: 'assignmentId is required' });
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    let fileUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/assignments');
      fileUrl = result.url;
    }

    const updated = await store.updateItem(FILE, assignmentId, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submissionFile: fileUrl,
      submittedBy: studentId,
    });

    if (!updated) return res.status(404).json({ error: 'Assignment not found' });

    // Create notification for submission
    await store.appendData('notifications.json', {
      id: uuidv4(),
      userId: studentId,
      type: 'assignment',
      title: 'Assignment Submitted',
      message: `Your assignment "${updated.title}" has been submitted successfully.`,
      icon: 'check-circle',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Assignment submitted successfully', assignment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assignments/:id/submit (student submits with file - per assignment)
router.post('/:id/submit', upload.single('file'), async (req, res) => {
  try {
    let fileUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'smart_campus/assignments');
      fileUrl = result.url;
    }

    const updated = await store.updateItem(FILE, req.params.id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submissionFile: fileUrl,
      studentId: req.body.studentId,
    });

    if (!updated) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
  const deleted = await store.deleteItem(FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ message: 'Assignment deleted' });
});

module.exports = router;
