# 🎓 UniCampus — Backend Development Prompt
**Stack:** Node.js + Express.js + MongoDB (Mongoose) + Socket.io + Python (FastAPI) for AI/Chatbot

---

## 📁 File Structure

```
unicampus-backend/
├── server.js                             # Entry point: Express + Socket.io init
│
├── config/
│   ├── db.js                             # MongoDB connection via Mongoose
│   ├── socket.js                         # Socket.io server setup and room management
│   └── constants.js                      # ATTENDANCE_THRESHOLD=75, roles, fine rates
│
├── models/
│   ├── User.js                           # Base user: { userId, role, branch, email, phone }
│   ├── Student.js                        # Extends User: cgpa, semester, parentEmail, resumeUrl, skills[]
│   ├── Faculty.js                        # Extends User: department, designation, payroll
│   ├── Admin.js                          # Extends User: accessLevel
│   ├── Timetable.js                      # { branch, semester, day, slots[{time, subject, room}] }
│   ├── Attendance.js                     # { studentId, subjectCode, date, status, markedBy }
│   ├── Subject.js                        # { code, name, branch, semester, facultyId }
│   ├── Assignment.js                     # { subjectCode, title, dueDate, branch, semester }
│   ├── Submission.js                     # { assignmentId, studentId, fileUrl, tags, timestamp, mismatch }
│   ├── PlacementDrive.js                 # { company, role, ctc, cgpaCutoff, deadline, applicants[] }
│   ├── Application.js                    # { driveId, studentId, appliedAt, status }
│   ├── Book.js                           # { isbn, title, author, publisher, totalCopies, availableCopies }
│   ├── BookIssue.js                      # { bookId, studentId, issueDate, dueDate, returnDate, fine }
│   ├── FeeRecord.js                      # { studentId, type, amount, paidAt, receiptId }
│   ├── MaintenanceTicket.js              # { studentId, category, description, photoUrl, room, stage, assignedTo }
│   ├── Feedback.js                       # { category, rating, comment, submittedAt (no studentId — anonymous) }
│   ├── Notification.js                   # { userId, message, type, read, createdAt }
│   └── Announcement.js                   # { title, body, targetRoles[], targetBranches[], createdBy }
│
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── facultyRoutes.js
│   ├── adminRoutes.js
│   ├── attendanceRoutes.js
│   ├── assignmentRoutes.js
│   ├── placementRoutes.js
│   ├── libraryRoutes.js
│   ├── financeRoutes.js
│   ├── maintenanceRoutes.js
│   ├── feedbackRoutes.js
│   ├── notificationRoutes.js
│   ├── searchRoutes.js                   # Global unified search
│   └── chatbotRoutes.js                  # Proxy to Python AI service
│
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── facultyController.js
│   ├── adminController.js
│   ├── attendanceController.js
│   ├── assignmentController.js
│   ├── placementController.js
│   ├── libraryController.js
│   ├── financeController.js
│   ├── maintenanceController.js
│   ├── feedbackController.js
│   ├── notificationController.js
│   ├── searchController.js
│   └── chatbotController.js
│
├── middleware/
│   ├── authMiddleware.js                 # JWT verify → attach req.user
│   ├── roleMiddleware.js                 # requireRole("admin") etc.
│   ├── branchMiddleware.js               # Auto-inject branch filter from req.user.branch
│   └── uploadMiddleware.js               # Multer config for file/photo uploads
│
├── services/
│   ├── emailService.js                   # Nodemailer: dual-channel emails to student + parent
│   ├── notificationService.js            # Create DB notification + emit Socket.io event
│   ├── attendanceAlertService.js         # Check threshold and trigger emails/alerts
│   ├── placementMatchService.js          # Filter eligible students by CGPA and branch
│   ├── isbnLookupService.js              # Fetch book details from Open Library ISBN API
│   ├── fineCalculatorService.js          # Calculate overdue fines per day
│   └── aiProxyService.js                 # HTTP calls from Node.js to Python FastAPI
│
├── sockets/
│   ├── placementSocket.js                # Emit placement:applied to drive room
│   ├── attendanceSocket.js               # Emit attendance:alert to student
│   ├── maintenanceSocket.js              # Emit maintenance:status on stage change
│   └── notificationSocket.js            # Emit notification:new to user room
│
├── utils/
│   ├── branchParser.js                   # "COMP_101" → { branch: "COMP", rollNum: "101" }
│   ├── generateReceipt.js                # Generate unique receipt ID for fee/assignment
│   ├── tagExtractor.js                   # Extract roll number and module from uploaded PDF filename
│   └── apiResponse.js                    # Standardized { success, data, message } response wrapper
│
├── python_ai/                            # 🐍 Python FastAPI AI Microservice
│   ├── main.py                           # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── routers/
│   │   ├── leave_advisor.py              # POST /leave-advice
│   │   ├── library_renewal.py            # POST /library/renewal-suggestion
│   │   ├── low_engagement.py             # POST /engagement/detect
│   │   └── assignment_mismatch.py        # POST /assignment/validate
│   │
│   ├── services/
│   │   ├── llm_service.py                # Calls OpenAI / local LLM (LangChain wrapper)
│   │   ├── attendance_analyzer.py        # Logic: check tomorrow's classes vs current %
│   │   ├── exam_calendar_checker.py      # Cross-check book due date vs exam date
│   │   └── engagement_detector.py        # Flag sessions with <40% class attendance
│   │
│   └── schemas/
│       ├── leave_request.py              # Pydantic: { studentId, targetDate }
│       ├── library_request.py            # Pydantic: { studentId, bookId, examDate }
│       └── engagement_report.py          # Pydantic: { facultyId, sessionData[] }
│
├── seed/
│   ├── seedStudents.js
│   ├── seedFaculty.js
│   ├── seedTimetable.js
│   └── seedBooks.js
│
├── .env
├── .gitignore
└── package.json
```

---

## 🧠 Core Implementation Instructions

### 1. Auth — Smart Login with Branch Detection
```
POST /api/auth/login
Body: { userId: "COMP_101", password: "..." }
```
- Use `branchParser.js` to extract `branch = "COMP"` from `userId`
- Store branch on the JWT payload: `{ userId, role, branch }`
- `branchMiddleware.js` auto-injects `req.branch` on every protected route
- All queries automatically filter by `branch` — the student never selects it again

### 2. Attendance Module
```
POST /api/attendance/mark           # Faculty marks session attendance
GET  /api/attendance/summary/:studentId  # Subject-wise % for student
POST /api/attendance/notify         # Trigger dual emails (student + parent)
```
- After marking, call `attendanceAlertService.js`:
  - Calculate `attendance%` per subject for each marked student
  - If `% < 75`, create a `Notification` record and emit `attendance:alert` via Socket.io
  - If "Notify" button clicked → call `emailService.js` to fire two separate emails simultaneously
- Email to student pulls: `name`, `subject`, `attendance%`, `date` from DB — no manual writing
- Email to parent pulls: `parentEmail`, `wardName`, `subject`, `attendance%`
- **Low Engagement Detection:** A cron job (node-cron) runs daily, queries sessions where `presentCount / totalStudents < 0.4` for 3+ consecutive sessions, triggers an admin report via `notificationService.js`

### 3. Assignment Submission
```
POST /api/assignments/submit        # Student uploads file (multipart)
GET  /api/assignments/:subjectCode  # Faculty views all submissions
```
- Multer saves file to `/uploads/assignments/`
- `tagExtractor.js` parses filename for roll number and module name
- If extracted roll number ≠ `req.user.userId`, return `{ mismatch: true, warning: "Roll number mismatch detected" }`
- On clean submission, save `Submission` with auto-tags and emit `assignment:received` to student via Socket.io
- Return a receipt object: `{ receiptId, studentId, branch, module, timestamp }`

### 4. Placement Drive — Full Real-Time Flow
```
POST /api/placement/drives          # Admin creates drive
GET  /api/placement/drives          # Student gets eligible drives (filtered by CGPA)
POST /api/placement/apply/:driveId  # Student applies (one-click)
GET  /api/placement/applicants/:driveId  # Admin views live applicant list
```
- On drive creation: call `placementMatchService.js` to find eligible students → batch-create Notifications → emit `notification:new` to each user's socket room
- On apply: pull `student.cgpa`, `student.resumeUrl`, `student.skills[]` automatically — no form data from frontend
- After insert: emit `placement:applied` to Socket.io room `drive:{driveId}` → Admin counter updates live
- Return confirmation receipt to student

### 5. Library Module — AI-Powered Renewal
```
POST /api/library/issue             # Admin issues book to student
POST /api/library/return/:issueId   # Admin marks returned, calculates fine
GET  /api/library/overdue           # Admin: all overdue records with fine amounts
POST /api/library/renew/:issueId    # Student renews book (triggered by AI suggestion)
POST /api/library/isbn-lookup       # Admin: type ISBN → returns title/author/publisher
```
- `fineCalculatorService.js`: `fine = (today - dueDate) * DAILY_FINE_RATE`
- `isbnLookupService.js`: calls `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json`
- AI renewal check is triggered by the Python service (see Python section below)

### 6. Maintenance Ticket — Stage Tracker
```
POST /api/maintenance/ticket        # Student raises ticket
PATCH /api/maintenance/ticket/:id/stage  # Admin updates stage
PATCH /api/maintenance/ticket/:id/confirm  # Student confirms resolved
```
- Stage enum: `["Requested", "Assigned", "In Progress", "Fixed & Verified"]`
- On every stage change, call `notificationService.js` → emit `maintenance:status` via Socket.io to student's room
- Final "Fixed & Verified" requires student confirmation — `confirmResolved` endpoint sets `closedAt` timestamp

### 7. Global Search
```
GET /api/search?q=&role=
```
- Runs parallel queries across: `Subject`, `PlacementDrive`, `Book`, `Announcement`, `Assignment`
- Filter each query by `role` and `branch` from JWT
- Return ranked merged results with source tags: `{ results: [{type: "book", ...}, {type: "drive", ...}] }`

### 8. Notifications
```
GET  /api/notifications             # Get all for req.user
PATCH /api/notifications/:id/read   # Mark as read
```
- Every notification saved to DB AND emitted via Socket.io
- Socket room per user: `user:{userId}` — join on connection with JWT auth

---

## 🐍 Python AI Service (FastAPI) — Implementation

### Run: `uvicorn main:app --port 8000`

### 1. Leave Advisor — `POST /leave-advice`
```python
# Input: { studentId, targetDate }
# Steps:
# 1. Fetch tomorrow's timetable from MongoDB (via HTTP to Node API or direct PyMongo)
# 2. Fetch current attendance% per subject for that student
# 3. For each subject scheduled tomorrow:
#    - Calculate new% if absent: (present) / (total+1) * 100
#    - Flag if new% < 75
# 4. Use LLM to generate natural language recommendation
# Output: { recommendation: "attend/leave", reason: str, subjectsAtRisk: [] }
```

### 2. Library Renewal Suggestion — `POST /library/renewal-suggestion`
```python
# Input: { studentId }
# Steps:
# 1. Fetch student's currently issued books with due dates
# 2. Fetch upcoming exams from academic calendar
# 3. If book's subject exam is within 3 days AND book is due today/tomorrow:
#    - Suggest renewal
# Output: { suggest: true, bookTitle: str, examDate: str, message: str }
```

### 3. Low Engagement Detection — `POST /engagement/detect`
```python
# Input: { facultyId, sessions: [{date, presentCount, totalStudents}] }
# Steps:
# 1. Calculate attendance rate per session
# 2. If 3+ consecutive sessions have rate < 0.40:
#    - Flag as outlier
# Output: { flagged: bool, report: str, affectedSlots: [] }
```

### 4. Assignment Mismatch Validation — `POST /assignment/validate`
```python
# Input: { filename, expectedStudentId, expectedModule }
# Steps:
# 1. Parse filename: "COMP_101_DS_HW1.pdf" → extract id and module
# 2. Compare with expected values
# Output: { mismatch: bool, extractedId: str, extractedModule: str, warning: str }
```

---

## 🔌 Socket.io Room Strategy

| Room Name | Who Joins | Events Emitted |
|---|---|---|
| `user:{userId}` | Every logged-in user | `notification:new`, `attendance:alert`, `assignment:received`, `maintenance:status` |
| `drive:{driveId}` | Admin viewing a drive | `placement:applied` |
| `branch:{branch}` | All students of a branch | `announcement:new` |
| `faculty:{facultyId}` | Faculty member | `low-engagement:report` |

---

## 📧 Email Templates (emailService.js)

### Student Absence Email
```
Subject: Attendance Alert — {subjectName}
Body: You were absent for {subjectName} on {date}. 
      Current attendance: {percentage}%.
      Please contact your HOD to avoid shortage.
```

### Parent Absence Email
```
Subject: Attendance Update — {wardName}
Body: Dear Parent, your ward {wardName} was absent for 
      {subjectName} on {date}. Current attendance: {percentage}%.
```
All values are pulled from DB — no manual input from faculty.

---

## 🔐 Environment Variables (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unicampus
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@unicampus.edu
EMAIL_PASS=your_app_password

PYTHON_AI_URL=http://localhost:8000

OPEN_LIBRARY_API=https://openlibrary.org/api/books
DAILY_FINE_RATE=5
ATTENDANCE_THRESHOLD=75
```

---

## 📦 Key Dependencies

```json
{
  "express": "^4",
  "mongoose": "^8",
  "socket.io": "^4",
  "jsonwebtoken": "^9",
  "bcryptjs": "^2",
  "multer": "^1",
  "nodemailer": "^6",
  "axios": "^1",
  "node-cron": "^3",
  "dotenv": "^16",
  "cors": "^2"
}
```

### Python (requirements.txt)
```
fastapi
uvicorn
pydantic
langchain
openai
pymongo
httpx
python-dotenv
```
