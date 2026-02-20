const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../utils/store');

const USERS_FILE = 'users.json';

const DEFAULT_USERS = [
  {
    id: uuidv4(),
    username: 'admin',
    name: 'System Admin',
    email: 'admin@nitcampus.edu',
    role: 'admin',
    adminId: 'ADM2024001',
    status: 'active',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    username: 'faculty2024001',
    name: 'Dr. Faculty Demo',
    email: 'fac2024001@nitcampus.edu',
    role: 'faculty',
    facultyId: 'FAC2024001',
    status: 'active',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    username: 'student2024nitcs001',
    name: 'Student Demo',
    email: '2024nitcs001@nitcampus.edu',
    role: 'student',
    branch: 'Computer Science',
    rollNumber: '2024NITCS001',
    studentId: '2024NITCS001',
    year: 2,
    semester: 4,
    cgpa: 8.1,
    status: 'approved',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
];

// Valid branches for student signup
const VALID_BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering'
];

async function getUsers() {
  const users = await store.readData(USERS_FILE, []);
  if (!Array.isArray(users) || users.length === 0) {
    await store.writeData(USERS_FILE, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  let needsUpdate = false;
  const updatedUsers = users.map((user) => {
    if (user.role === 'admin' && !user.adminId) {
      needsUpdate = true;
      return { ...user, adminId: 'ADM2024001' };
    }
    return user;
  });
  if (needsUpdate) {
    await store.writeData(USERS_FILE, updatedUsers);
    return updatedUsers;
  }
  return users;
}

// POST /api/auth/login - Login with studentId/email (existing users only)
router.post('/login', async (req, res) => {
  try {
    const { identifier, role } = req.body;
    
    if (!identifier || !role) {
      return res.status(400).json({ error: 'identifier (email/studentId) and role are required' });
    }

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const normalizedEmail = normalizedIdentifier.includes('@')
      ? normalizedIdentifier
      : `${normalizedIdentifier}@nitcampus.edu`;

    const users = await getUsers();
    
    // Find user by email, studentId, rollNumber, facultyId, or adminId
    let user = users.find(
      (u) =>
        u.role === role &&
        (
          String(u.email || '').toLowerCase() === normalizedEmail ||
          String(u.studentId || '').toLowerCase() === normalizedIdentifier ||
          String(u.rollNumber || '').toLowerCase() === normalizedIdentifier ||
          String(u.facultyId || '').toLowerCase() === normalizedIdentifier ||
          String(u.adminId || '').toLowerCase() === normalizedIdentifier ||
          String(u.username || '').toLowerCase() === normalizedIdentifier
        )
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (role === 'student' && user.status === 'pending_approval') {
      return res.status(403).json({
        error: 'Your account is awaiting admin approval.',
        code: 'ACCOUNT_PENDING_APPROVAL',
      });
    }

    if (role === 'student' && user.status === 'rejected') {
      return res.status(403).json({
        error: user.rejectionReason || 'Your signup request was rejected by admin.',
        code: 'ACCOUNT_REJECTED',
        rejectionReason: user.rejectionReason || null,
      });
    }

    res.json({ 
      user, 
      token: `local_token_${user.id}_${Date.now()}`,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - Real student signup (branch + rollNumber)
router.post('/register', async (req, res) => {
  try {
    const { name, email, role, branch, rollNumber, year, semester } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ 
        error: 'name, email, and role are required' 
      });
    }

    // For student signup, require branch and rollNumber
    if (role === 'student') {
      if (!branch || !rollNumber) {
        return res.status(400).json({ 
          error: 'For student signup, branch and rollNumber are required' 
        });
      }

      // Validate branch
      if (!VALID_BRANCHES.includes(branch)) {
        return res.status(400).json({ 
          error: 'Invalid branch. Valid branches: ' + VALID_BRANCHES.join(', ') 
        });
      }

      // Validate rollNumber format (e.g., 2024CS001, 2024IT002)
      if (!/^\d{4}[A-Z]{2,}\d{3,}$/.test(rollNumber.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Invalid roll number format. Expected: 2024CS001' 
        });
      }
    }

    // Check if user already exists
    const users = await getUsers();
    const normalized_email = email.toLowerCase();
    
    if (users.find((u) => u.email.toLowerCase() === normalized_email)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    if (role === 'student' && users.find((u) => u.rollNumber === rollNumber)) {
      return res.status(409).json({ error: 'User with this roll number already exists' });
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '_'),
      name,
      email: normalized_email,
      role,
      branch: role === 'student' ? branch : undefined,
      rollNumber: role === 'student' ? rollNumber.toUpperCase() : undefined,
      studentId: role === 'student' ? `2024${rollNumber.substring(0, 2).toUpperCase()}${rollNumber.slice(-3)}` : undefined,
      year: role === 'student' ? (year || 1) : undefined,
      semester: role === 'student' ? (semester || 1) : undefined,
      cgpa: role === 'student' ? 0 : undefined,
      status: 'pending_approval',  // Students need admin approval
      avatar: '',
      createdAt: new Date().toISOString(),
    };

    await store.appendData(USERS_FILE, newUser);

    res.status(201).json({ 
      user: newUser, 
      token: `local_token_${newUser.id}_${Date.now()}`,
      message: role === 'student' 
        ? 'Registration successful! Awaiting admin approval.'
        : 'Registration successful!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Extract user ID from token
    const parts = token.split('_');
    const userId = parts[2];
    const user = await store.findById(USERS_FILE, userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/auth/pending-signups - List pending student signups (admin only)
router.get('/pending-signups', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract user ID from token and verify admin role
    const parts = token.split('_');
    const userId = parts[2];
    const users = await getUsers();
    const admin = users.find(u => u.id === userId && u.role === 'admin');

    if (!admin) {
      return res.status(403).json({ error: 'Only admins can view pending signups' });
    }

    // Get all pending students
    const pendingStudents = users.filter(
      u => u.role === 'student' && u.status === 'pending_approval'
    );

    res.json({ 
      count: pendingStudents.length,
      students: pendingStudents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Pending signups error:', error);
    res.status(500).json({ error: 'Failed to fetch pending signups' });
  }
});

// POST /api/auth/approve-signup/:userId - Approve student signup (admin only)
router.post('/approve-signup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify admin
    const parts = token.split('_');
    const adminId = parts[2];
    const users = await getUsers();
    const admin = users.find(u => u.id === adminId && u.role === 'admin');

    if (!admin) {
      return res.status(403).json({ error: 'Only admins can approve signups' });
    }

    // Find and update student
    const studentIndex = users.findIndex(u => u.id === userId);
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    users[studentIndex].status = 'approved';
    users[studentIndex].approvedAt = new Date().toISOString();
    users[studentIndex].approvedBy = admin.id;

    await store.writeData(USERS_FILE, users);

    res.json({ 
      message: 'Student signup approved',
      user: users[studentIndex]
    });
  } catch (error) {
    console.error('Approve signup error:', error);
    res.status(500).json({ error: 'Failed to approve signup' });
  }
});

// POST /api/auth/reject-signup/:userId - Reject student signup (admin only)
router.post('/reject-signup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify admin
    const parts = token.split('_');
    const adminId = parts[2];
    const users = await getUsers();
    const admin = users.find(u => u.id === adminId && u.role === 'admin');

    if (!admin) {
      return res.status(403).json({ error: 'Only admins can reject signups' });
    }

    // Find and update student
    const studentIndex = users.findIndex(u => u.id === userId);
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    users[studentIndex].status = 'rejected';
    users[studentIndex].rejectionReason = reason || 'Not specified';
    users[studentIndex].rejectedAt = new Date().toISOString();
    users[studentIndex].rejectedBy = admin.id;

    await store.writeData(USERS_FILE, users);

    res.json({ 
      message: 'Student signup rejected',
      user: users[studentIndex]
    });
  } catch (error) {
    console.error('Reject signup error:', error);
    res.status(500).json({ error: 'Failed to reject signup' });
  }
});

module.exports = router;
