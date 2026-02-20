const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createDrive,
  getAllDrives,
  getStudentDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  applyToDrive,
  getApplicants,
  getEligibleStudents,
} = require('../controllers/placementController');

router.get('/drives/student', protect, requireRole('student'), getStudentDrives);
router.post('/drives/:id/apply', protect, requireRole('student'), applyToDrive);

router.post('/drives', protect, requireRole('admin'), createDrive);
router.get('/drives', protect, requireRole('admin'), getAllDrives);
router.get('/drives/:id', protect, getDriveById);
router.patch('/drives/:id', protect, requireRole('admin'), updateDrive);
router.delete('/drives/:id', protect, requireRole('admin'), deleteDrive);
router.get('/drives/:id/applicants', protect, requireRole('admin'), getApplicants);
router.get('/drives/:id/eligible-students', protect, requireRole('faculty', 'admin'), getEligibleStudents);

module.exports = router;
