/**
 * All Mongoose models for Smart Campus.
 * Each model maps to a former JSON data file.
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── 1. User (users.json) ──────────────────────────────────────────────
const userSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  username:  { type: String, required: true },
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  adminId:   String,
  parentEmail: String,
  rollNumber: String,
  role:      { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  studentId: String,
  facultyId: String,
  branch:    { type: String, default: 'Computer Science' },
  year:      Number,
  semester:  Number,
  cgpa:      Number,
  avatar:    { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});
const User = mongoose.model('User', userSchema);

// ── 2. Attendance (attendance.json) ────────────────────────────────────
const attendanceSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  studentId:   String,
  subject:     String,
  subjectCode: String,
  branch:      String,
  semester:    Number,
  attended:    { type: Number, default: 0 },
  total:       { type: Number, default: 0 },
  percentage:  Number,
  faculty:     String,
  credits:     Number,
  lastUpdated: String,
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// ── 3. Assignment (assignments.json) ───────────────────────────────────
const assignmentSchema = new Schema({
  id:             { type: String, required: true, unique: true },
  title:          String,
  subject:        String,
  subjectCode:    String,
  dueDate:        String,
  status:         { type: String, default: 'pending' },
  branch:         String,
  semester:       Number,
  module:         String,
  description:    String,
  totalMarks:     Number,
  guidelines:     String,
  timestamp:      String,
  assignedBy:     String,
  facultyId:      String,
  referenceFile:  String,
  grade:          String,
  submittedAt:    String,
  submissionFile: String,
  submittedBy:    String,
  lastUpdated:    String,
  studentId:      String,
});
const Assignment = mongoose.model('Assignment', assignmentSchema);

// ── 4. Book (library.json) ─────────────────────────────────────────────
const bookSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  title:     String,
  author:    String,
  isbn:      String,
  category:  String,
  available: { type: Number, default: 0 },
  total:     { type: Number, default: 0 },
  location:  String,
  createdAt: String,
});
const Book = mongoose.model('Book', bookSchema);

// ── 5. Borrow (borrows.json) ──────────────────────────────────────────
const borrowSchema = new Schema({
  id:            { type: String, required: true, unique: true },
  bookId:        String,
  bookTitle:     String,
  author:        String,
  studentId:     String,
  studentName:   String,
  borrowedAt:    String,
  reservedAt:    String,
  dueDate:       String,
  status:        { type: String, default: 'borrowed' },
  returnedAt:    String,
  renewCount:    { type: Number, default: 0 },
  lastRenewedAt: String,
});
const Borrow = mongoose.model('Borrow', borrowSchema);

// ── 6. PlacementDrive (placements.json) ────────────────────────────────
const placementSchema = new Schema({
  id:         { type: String, required: true, unique: true },
  company:    String,
  role:       String,
  ctc:        String,
  cutoffCgpa: Number,
  deadline:   String,
  applicants: { type: Number, default: 0 },
  status:     { type: String, default: 'open' },
  logo:       String,
  createdAt:  String,
});
const PlacementDrive = mongoose.model('PlacementDrive', placementSchema);

// ── 7. Application (applications.json) ─────────────────────────────────
const applicationSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  driveId:   String,
  company:   String,
  studentId: String,
  appliedAt: String,
  status:    { type: String, default: 'applied' },
});
const Application = mongoose.model('Application', applicationSchema);

// ── 8. Feedback (feedback.json) ────────────────────────────────────────
const feedbackSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  type:        String,
  studentId:   String,
  rating:      Number,
  status:      { type: String, default: 'pending' },
  createdAt:   String,
  respondedAt: String,
}, { strict: false }); // allow extra fields from req.body
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ── 9. HostelRoom (hostel.json) ────────────────────────────────────────
const hostelRoomSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  roomNumber: String,
  block:     String,
  floor:     Number,
  capacity:  Number,
  occupants: [String],
  type:      String,
  amenities: [String],
  status:    String,
  createdAt: String,
});
const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);

// ── 10. HostelComplaint (hostel_complaints.json) ───────────────────────
const hostelComplaintSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  status:    { type: String, default: 'open' },
  createdAt: String,
}, { strict: false });
const HostelComplaint = mongoose.model('HostelComplaint', hostelComplaintSchema);

// ── 11. FinanceRecord (finance.json) ───────────────────────────────────
const financeSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  studentId:   String,
  type:        String,
  description: String,
  amount:      Number,
  status:      { type: String, default: 'pending' },
  paidAt:      String,
  dueDate:     String,
  semester:    Number,
  createdAt:   String,
});
const FinanceRecord = mongoose.model('FinanceRecord', financeSchema);

// ── 12. Upload (uploads.json) ──────────────────────────────────────────
const uploadSchema = new Schema({
  id:           { type: String, required: true, unique: true },
  originalName: String,
  mimeType:     String,
  size:         Number,
  url:          String,
  publicId:     String,
  provider:     String,
  uploadedBy:   String,
  folder:       String,
  createdAt:    String,
});
const Upload = mongoose.model('Upload', uploadSchema);

// ── 13. ChatMessage (chat_history.json) ────────────────────────────────
const chatMessageSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  userId:      String,
  role:        String,
  sender:      String,
  message:     String,
  context:     Schema.Types.Mixed,
  suggestions: [String],
  timestamp:   String,
  fallback:    Boolean,
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// ── 14. Notification (notifications.json) ──────────────────────────────
const notificationSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  userId:    String,
  type:      String,
  title:     String,
  message:   String,
  icon:      String,
  read:      { type: Boolean, default: false },
  createdAt: String,
});
const Notification = mongoose.model('Notification', notificationSchema);

// ── 15. Subject (subjects.json) ────────────────────────────────────────
const subjectSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  code:      String,
  name:      String,
  branch:    String,
  semester:  Number,
  credits:   Number,
  faculty:   String,
  facultyId: String,
  type:      String,
  createdAt: String,
});
const Subject = mongoose.model('Subject', subjectSchema);

// ── 16. Resource (resources.json) ──────────────────────────────────────
const resourceSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  subjectCode: String,
  subject:     String,
  title:       String,
  type:        String,
  url:         String,
  fileUrl:     String,
  description: String,
  content:     String,
  branch:      String,
  semester:    Number,
  postedBy:    { type: Schema.Types.ObjectId, ref: 'User' },
  isPinned:    { type: Boolean, default: false },
  uploadedBy:  String,
  facultyId:   String,
  createdAt:   String,
});
const Resource = mongoose.model('Resource', resourceSchema);

const gradeSchema = new Schema({
  studentId: { type: String, required: true },
  subjectCode: { type: String, required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  examType: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
gradeSchema.index({ studentId: 1, subjectCode: 1, examType: 1 }, { unique: true });
const Grade = mongoose.model('Grade', gradeSchema);

const recommendationLetterSchema = new Schema({
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  letterContent: { type: String, required: true },
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
  submittedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
recommendationLetterSchema.index({ facultyId: 1, studentId: 1, driveId: 1 }, { unique: true });
const RecommendationLetter = mongoose.model('RecommendationLetter', recommendationLetterSchema);

// ── 17. MaintenanceTicket (maintenance_tickets.json) ───────────────────
const maintenanceTicketSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  studentId:   String,
  roomNumber:  String,
  category:    String,
  description: String,
  photo:       String,
  status:      { type: String, default: 'requested' },
  stages:      Schema.Types.Mixed,
  createdAt:   String,
  updatedAt:   String,
  resolvedAt:  String,
});
const MaintenanceTicket = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);

// ── File → Model mapping (used by mongoStore) ──────────────────────────
const modelMap = {
  'users.json':               User,
  'attendance.json':          Attendance,
  'assignments.json':         Assignment,
  'library.json':             Book,
  'borrows.json':             Borrow,
  'placements.json':          PlacementDrive,
  'applications.json':        Application,
  'feedback.json':            Feedback,
  'hostel.json':              HostelRoom,
  'hostel_complaints.json':   HostelComplaint,
  'finance.json':             FinanceRecord,
  'uploads.json':             Upload,
  'chat_history.json':        ChatMessage,
  'notifications.json':       Notification,
  'subjects.json':            Subject,
  'resources.json':           Resource,
  'maintenance_tickets.json': MaintenanceTicket,
};

function getModel(filename) {
  const model = modelMap[filename];
  if (!model) throw new Error(`No Mongoose model mapped for file: ${filename}`);
  return model;
}

module.exports = {
  User,
  Attendance,
  Assignment,
  Book,
  Borrow,
  PlacementDrive,
  Application,
  Feedback,
  HostelRoom,
  HostelComplaint,
  FinanceRecord,
  Upload,
  ChatMessage,
  Notification,
  Subject,
  Resource,
  Grade,
  RecommendationLetter,
  MaintenanceTicket,
  modelMap,
  getModel,
};
