const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const FILE = 'subjects.json';

// Comprehensive subject data by branch and semester
const defaultSubjects = [
  // Computer Science - Semester 5
  { id: uuidv4(), code: 'CS501', name: 'Data Structures & Algorithms', branch: 'Computer Science', semester: 5, credits: 4, faculty: 'Dr. Priya Verma', facultyId: 'FAC001', type: 'core' },
  { id: uuidv4(), code: 'CS502', name: 'Operating Systems', branch: 'Computer Science', semester: 5, credits: 4, faculty: 'Prof. Anil Kumar', facultyId: 'FAC002', type: 'core' },
  { id: uuidv4(), code: 'CS503', name: 'Database Systems', branch: 'Computer Science', semester: 5, credits: 3, faculty: 'Dr. Meena Iyer', facultyId: 'FAC003', type: 'core' },
  { id: uuidv4(), code: 'CS504', name: 'Computer Networks', branch: 'Computer Science', semester: 5, credits: 3, faculty: 'Prof. Raj Singh', facultyId: 'FAC004', type: 'core' },
  { id: uuidv4(), code: 'CS505', name: 'Software Engineering', branch: 'Computer Science', semester: 5, credits: 3, faculty: 'Dr. Neha Gupta', facultyId: 'FAC005', type: 'elective' },

  // Computer Science - Semester 4
  { id: uuidv4(), code: 'CS401', name: 'Discrete Mathematics', branch: 'Computer Science', semester: 4, credits: 3, faculty: 'Prof. R.K. Sharma', facultyId: 'FAC006', type: 'core' },
  { id: uuidv4(), code: 'CS402', name: 'Object Oriented Programming', branch: 'Computer Science', semester: 4, credits: 4, faculty: 'Dr. Priya Verma', facultyId: 'FAC001', type: 'core' },
  { id: uuidv4(), code: 'CS403', name: 'Computer Architecture', branch: 'Computer Science', semester: 4, credits: 3, faculty: 'Prof. Anil Kumar', facultyId: 'FAC002', type: 'core' },
  { id: uuidv4(), code: 'CS404', name: 'Theory of Computation', branch: 'Computer Science', semester: 4, credits: 3, faculty: 'Dr. Meena Iyer', facultyId: 'FAC003', type: 'core' },

  // Computer Science - Semester 3
  { id: uuidv4(), code: 'CS301', name: 'Data Structures', branch: 'Computer Science', semester: 3, credits: 4, faculty: 'Dr. Priya Verma', facultyId: 'FAC001', type: 'core' },
  { id: uuidv4(), code: 'CS302', name: 'Digital Logic Design', branch: 'Computer Science', semester: 3, credits: 3, faculty: 'Prof. Raj Singh', facultyId: 'FAC004', type: 'core' },

  // Information Technology - Semester 5
  { id: uuidv4(), code: 'IT501', name: 'Web Technologies', branch: 'Information Technology', semester: 5, credits: 4, faculty: 'Dr. Neha Gupta', facultyId: 'FAC005', type: 'core' },
  { id: uuidv4(), code: 'IT502', name: 'Information Security', branch: 'Information Technology', semester: 5, credits: 3, faculty: 'Prof. Raj Singh', facultyId: 'FAC004', type: 'core' },

  // Mechanical - Semester 5
  { id: uuidv4(), code: 'ME501', name: 'Thermodynamics', branch: 'Mechanical', semester: 5, credits: 4, faculty: 'Prof. S.K. Jain', facultyId: 'FAC007', type: 'core' },
  { id: uuidv4(), code: 'ME502', name: 'Fluid Mechanics', branch: 'Mechanical', semester: 5, credits: 3, faculty: 'Dr. Amit Patel', facultyId: 'FAC008', type: 'core' },

  // Electronics - Semester 5
  { id: uuidv4(), code: 'EC501', name: 'Signal Processing', branch: 'Electronics', semester: 5, credits: 4, faculty: 'Dr. Kavita Roy', facultyId: 'FAC009', type: 'core' },
  { id: uuidv4(), code: 'EC502', name: 'VLSI Design', branch: 'Electronics', semester: 5, credits: 3, faculty: 'Prof. Suresh Nair', facultyId: 'FAC010', type: 'core' },

  // Civil - Semester 5
  { id: uuidv4(), code: 'CE501', name: 'Structural Analysis', branch: 'Civil', semester: 5, credits: 4, faculty: 'Dr. M.K. Das', facultyId: 'FAC011', type: 'core' },
  { id: uuidv4(), code: 'CE502', name: 'Geotechnical Engineering', branch: 'Civil', semester: 5, credits: 3, faculty: 'Prof. Leela Menon', facultyId: 'FAC012', type: 'core' },
];

async function seed() {
  const data = await store.readData(FILE, []);
  if (data.length === 0) {
    await store.writeData(FILE, defaultSubjects);
    return defaultSubjects;
  }
  return data;
}

// GET /api/subjects?branch=Computer Science&semester=5
router.get('/', async (req, res) => {
  await seed();
  const { branch, semester, facultyId } = req.query;
  let data = await store.readData(FILE, []);
  if (branch) data = data.filter((d) => d.branch === branch);
  if (semester) data = data.filter((d) => d.semester === parseInt(semester));
  if (facultyId) data = data.filter((d) => d.facultyId === facultyId);
  res.json(data);
});

// GET /api/subjects/:code
router.get('/:code', async (req, res) => {
  await seed();
  const data = await store.readData(FILE, []);
  const subject = data.find((d) => d.code === req.params.code || d.id === req.params.code);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
});

// POST /api/subjects (admin/faculty adds subject)
router.post('/', async (req, res) => {
  const subject = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  await store.appendData(FILE, subject);
  res.status(201).json(subject);
});

// PUT /api/subjects/:id
router.put('/:id', async (req, res) => {
  const updated = await store.updateItem(FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subject not found' });
  res.json(updated);
});

module.exports = router;
