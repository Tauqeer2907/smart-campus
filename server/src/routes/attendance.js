const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'attendance.json';

// Seed default data
const defaultData = [
  { id: uuidv4(), studentId: 'STU001', subject: 'Data Structures', subjectCode: 'CS501', branch: 'Computer Science', semester: 5, attended: 28, total: 32, percentage: 87.5, faculty: 'Dr. Priya Verma', credits: 4, lastUpdated: new Date().toISOString() },
  { id: uuidv4(), studentId: 'STU001', subject: 'Operating Systems', subjectCode: 'CS502', branch: 'Computer Science', semester: 5, attended: 30, total: 34, percentage: 88.2, faculty: 'Prof. Anil Kumar', credits: 4, lastUpdated: new Date().toISOString() },
  { id: uuidv4(), studentId: 'STU001', subject: 'Database Systems', subjectCode: 'CS503', branch: 'Computer Science', semester: 5, attended: 25, total: 30, percentage: 83.3, faculty: 'Dr. Meena Iyer', credits: 3, lastUpdated: new Date().toISOString() },
  { id: uuidv4(), studentId: 'STU001', subject: 'Computer Networks', subjectCode: 'CS504', branch: 'Computer Science', semester: 5, attended: 22, total: 28, percentage: 78.6, faculty: 'Prof. Raj Singh', credits: 3, lastUpdated: new Date().toISOString() },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) {
    await store.writeData(FILE, defaultData);
    return defaultData;
  }
  return data;
}

// GET /api/attendance?studentId=xxx
router.get('/', async (req, res) => {
  await seed();
  const { studentId, subject, branch, semester } = req.query;
  let data = await store.readData(FILE, []);
  if (studentId) data = data.filter((d) => d.studentId === studentId);
  if (subject) data = data.filter((d) => d.subject === subject);
  if (branch) data = data.filter((d) => d.branch === branch);
  if (semester) data = data.filter((d) => d.semester === parseInt(semester));
  res.json(data);
});

// GET /api/attendance/summary?branch=Computer Science&semester=5&studentId=STU001
router.get('/summary', async (req, res) => {
  await seed();
  const { studentId, branch, semester } = req.query;
  let data = await store.readData(FILE, []);
  if (studentId) data = data.filter((d) => d.studentId === studentId);
  if (branch) data = data.filter((d) => d.branch === branch);
  if (semester) data = data.filter((d) => d.semester === parseInt(semester));

  const totalSubjects = data.length;
  const avgPercentage = totalSubjects > 0
    ? (data.reduce((sum, d) => sum + parseFloat(d.percentage || 0), 0) / totalSubjects).toFixed(1)
    : 0;

  const lowAttendance = data.filter((d) => parseFloat(d.percentage || 0) < 75);
  const subjectWise = data.map((d) => ({
    subject: d.subject,
    percentage: parseFloat(d.percentage || 0),
    attended: d.attended,
    total: d.total,
    faculty: d.faculty,
    credits: d.credits,
    status: parseFloat(d.percentage || 0) >= 75 ? 'safe' : parseFloat(d.percentage || 0) >= 65 ? 'warning' : 'danger',
  }));

  res.json({
    overall: parseFloat(avgPercentage),
    totalSubjects,
    lowAttendanceCount: lowAttendance.length,
    subjectWise,
    indicator: avgPercentage >= 75 ? 'green' : avgPercentage >= 65 ? 'amber' : 'red',
  });
});

// POST /api/attendance (faculty marks attendance)
router.post('/', async (req, res) => {
  const { studentId, subject, attended, total, faculty, credits } = req.body;
  const record = {
    id: uuidv4(),
    studentId,
    subject,
    attended: attended || 0,
    total: total || 0,
    percentage: total > 0 ? ((attended / total) * 100).toFixed(1) : 0,
    faculty: faculty || 'Unknown',
    credits: credits || 3,
    lastUpdated: new Date().toISOString(),
  };
  await store.appendData(FILE, record);
  res.status(201).json(record);
});

// PUT /api/attendance/:id
router.put('/:id', async (req, res) => {
  const updates = { ...req.body, lastUpdated: new Date().toISOString() };
  if (updates.attended !== undefined && updates.total !== undefined) {
    updates.percentage = updates.total > 0 ? ((updates.attended / updates.total) * 100).toFixed(1) : 0;
  }
  const updated = await store.updateItem(FILE, req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Record not found' });
  res.json(updated);
});

module.exports = router;
