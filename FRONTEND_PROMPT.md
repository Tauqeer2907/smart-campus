# 🎓 UniCampus — Frontend Development Prompt
**Stack:** React.js (Vite) + Tailwind CSS + Axios + Socket.io-client + React Query

---

## 📁 File Structure

```
unicampus-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   │
│   ├── assets/
│   │   └── logo.svg
│   │
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Sidebar.jsx               # Persistent sidebar nav (never disappears)
│   │   │   ├── BottomNav.jsx             # Mobile bottom navigation
│   │   │   ├── GlobalSearchBar.jsx       # Universal search across all modules
│   │   │   ├── RoleSwitcher.jsx          # Switch between Student/Faculty/Admin views
│   │   │   └── NotificationBell.jsx      # Real-time push notification icon
│   │   │
│   │   ├── common/
│   │   │   ├── HighAlertBanner.jsx       # Urgent in-app alert banner
│   │   │   ├── StatusTracker.jsx         # Order-style progress bar (maintenance, etc.)
│   │   │   ├── HealthCard.jsx            # Subject-wise attendance health card
│   │   │   ├── ConfirmModal.jsx          # Reusable confirmation modal
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── EmptyState.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── TimelineFeed.jsx          # Academic day-view timeline
│   │   │   ├── TimelineItem.jsx          # Single timeline event card
│   │   │   ├── AssignmentUpload.jsx      # Upload with smart tagging UI
│   │   │   ├── LeaveAdvisorChat.jsx      # AI chatbot: "Can I skip tomorrow?"
│   │   │   ├── PlacementCard.jsx         # Company drive card with One-Click Apply
│   │   │   ├── ResumeBuilder.jsx         # Multi-step resume form
│   │   │   ├── MaintenanceTicket.jsx     # Hostel issue form with photo upload
│   │   │   ├── LibrarySearch.jsx         # Book browse and reserve UI
│   │   │   └── FeePayment.jsx            # Fee breakdown and payment UI
│   │   │
│   │   ├── faculty/
│   │   │   ├── AttendanceGrid.jsx        # Session roster with Present/Absent/Late toggles
│   │   │   ├── DualNotifyButton.jsx      # Fire parent + student emails in one click
│   │   │   ├── GradingSheet.jsx          # Spreadsheet-style marks entry
│   │   │   ├── BellCurveChart.jsx        # Live grade distribution graph
│   │   │   ├── ResourcePost.jsx          # Post PDF/YouTube/notes to course feed
│   │   │   └── RecommendationLetter.jsx  # Write digital rec letter for placement
│   │   │
│   │   └── admin/
│   │       ├── PlacementDriveForm.jsx    # Upload company drive details
│   │       ├── LiveApplicantCounter.jsx  # Real-time applicant count widget
│   │       ├── LibraryIsbnLookup.jsx     # ISBN scan/type to auto-fill book details
│   │       ├── OverdueDashboard.jsx      # List of overdue books + bulk reminders
│   │       ├── SentimentDashboard.jsx    # Aggregated feedback charts
│   │       ├── FinanceLedger.jsx         # Full fee payment ledger view
│   │       └── LowEngagementReport.jsx   # AI-flagged low attendance faculty report
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx             # Smart login with branch detection (COMP_101)
│   │   │
│   │   ├── student/
│   │   │   ├── DashboardPage.jsx         # Timeline + health cards + quick links
│   │   │   ├── AcademicsPage.jsx         # Branch/semester/subject selector
│   │   │   ├── AttendancePage.jsx        # All subject health cards
│   │   │   ├── AssignmentsPage.jsx       # Upload and view submissions
│   │   │   ├── PlacementPage.jsx         # Drive list + one-click apply
│   │   │   ├── LibraryPage.jsx           # Book browsing + AI renewal suggestion
│   │   │   ├── HostelPage.jsx            # Maintenance ticket form + tracker
│   │   │   ├── FinancePage.jsx           # Fee payment and receipts
│   │   │   └── FeedbackPage.jsx          # Anonymous ratings
│   │   │
│   │   ├── faculty/
│   │   │   ├── FacultyDashboardPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── GradingPage.jsx
│   │   │   ├── ResourcesPage.jsx
│   │   │   └── PlacementPage.jsx         # Write recommendation letters
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboardPage.jsx
│   │       ├── PlacementManagePage.jsx
│   │       ├── LibraryManagePage.jsx
│   │       ├── FinancePage.jsx
│   │       ├── FeedbackAnalyticsPage.jsx
│   │       └── FacultyOversightPage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx               # User session, role, branch stored globally
│   │   ├── NotificationContext.jsx       # Real-time push notification state
│   │   └── SocketContext.jsx             # Socket.io connection provider
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js                  # Subscribe to real-time events
│   │   ├── useAttendance.js
│   │   ├── usePlacement.js
│   │   └── useSearch.js                  # Global search across all modules
│   │
│   ├── services/
│   │   ├── api.js                        # Axios base instance with auth headers
│   │   ├── authService.js
│   │   ├── attendanceService.js
│   │   ├── assignmentService.js
│   │   ├── placementService.js
│   │   ├── libraryService.js
│   │   ├── financeService.js
│   │   ├── maintenanceService.js
│   │   ├── feedbackService.js
│   │   └── chatbotService.js             # Leave advisor AI calls
│   │
│   ├── routes/
│   │   ├── StudentRoutes.jsx
│   │   ├── FacultyRoutes.jsx
│   │   ├── AdminRoutes.jsx
│   │   └── ProtectedRoute.jsx            # Role-based route guard
│   │
│   └── utils/
│       ├── branchParser.js               # Parse "COMP_101" → branch = "COMP"
│       ├── dateHelpers.js
│       ├── attendanceCalc.js             # Threshold calculation for leave advisor
│       └── constants.js                  # Attendance threshold = 75%, roles, etc.
│
├── .env
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧠 Core Implementation Instructions

### 1. Auth & Smart Login
- On login, parse the student ID: `COMP_101` → set `branch = "COMP"` in `AuthContext`
- Store `{ userId, role, branch, token }` in context + localStorage
- All module API calls must automatically pass `branch` as a query param
- `RoleSwitcher.jsx` in the navbar toggles between Student / Faculty / Admin for demo purposes — no re-login required

### 2. Unified Shell (Persistent Navigation)
- `Sidebar.jsx` must always be visible regardless of the active module page
- `GlobalSearchBar.jsx` queries `/api/search?q=&role=` and displays ranked results from all modules
- `NotificationBell.jsx` listens to a Socket.io event `notification:new` and shows a live badge count

### 3. Student — Timeline Dashboard
- `TimelineFeed.jsx` fetches from `/api/student/timeline?date=today`
- The backend aggregates: timetable slots + assignment deadlines + library due dates + registered events
- Render as a vertical chronological list sorted by time

### 4. Student — Attendance Health Cards
- `HealthCard.jsx` receives `{ subjectName, percentage, threshold: 75 }` as props
- If `percentage < 75`, render card in red with a `HighAlertBanner.jsx`
- If `percentage < 80`, render in amber as a warning

### 5. Student — Leave Advisor Chatbot
- `LeaveAdvisorChat.jsx` is a floating chat widget fixed to the bottom-right corner
- On message send, POST to `/api/chatbot/leave-advice` with `{ studentId, date }`
- The Python AI service returns a structured response: `{ recommendation, reason, subjectsAtRisk[] }`
- Display the recommendation prominently with subject-by-subject breakdown

### 6. Student — Assignment Upload
- `AssignmentUpload.jsx` sends a multipart form to `/api/assignments/submit`
- After upload, the backend returns auto-generated tags: `{ studentId, branch, module, timestamp }`
- If mismatch detected, backend returns `{ warning: true, message: "..." }` → show a modal before final confirm

### 7. Student — One-Click Placement Apply
- `PlacementCard.jsx` shows Apply button only if `student.cgpa >= drive.cgpaCutoff`
- On click, POST to `/api/placement/apply` — no form needed, backend pulls profile data
- After success, show a receipt modal and emit Socket.io event `placement:applied` to update Admin's counter live

### 8. Admin — Live Applicant Counter
- `LiveApplicantCounter.jsx` subscribes to Socket.io room `drive:{driveId}`
- On `placement:applied` event, increment count in local state without page refresh

### 9. Faculty — Grading with Bell Curve
- `GradingSheet.jsx` is a spreadsheet-style input table
- On every `onChange`, recalculate distribution and re-render `BellCurveChart.jsx` using Recharts
- Show: mean, median, grade brackets (A/B/C/D/F) as a live bar chart

### 10. Maintenance Ticket Tracker
- `StatusTracker.jsx` renders stages: `Requested → Assigned → In Progress → Fixed & Verified`
- Poll `/api/maintenance/status/:ticketId` every 30s or subscribe via Socket.io
- Final stage requires student to click "Confirm Resolved" before ticket closes

---

## 🔌 Socket.io Events to Handle (Client Side)

| Event Name | Payload | Action |
|---|---|---|
| `notification:new` | `{ message, type, userId }` | Show bell badge + toast |
| `placement:applied` | `{ driveId, count }` | Update Admin live counter |
| `attendance:alert` | `{ studentId, subject, percentage }` | Trigger HighAlertBanner |
| `maintenance:status` | `{ ticketId, stage }` | Update StatusTracker |
| `assignment:received` | `{ studentId, module }` | Show receipt confirmation |

---

## 🎨 UI/UX Rules
- Use **Tailwind CSS** for all styling — no inline styles
- Color system: Red = critical alert, Amber = warning, Green = healthy/success, Blue = info
- The sidebar and top search bar must use `z-50` and be sticky/fixed
- All data tables must be responsive (horizontal scroll on mobile)
- Use **React Query** for all data fetching — handle loading and error states uniformly
- Use **Recharts** for all graphs (bell curve, sentiment charts, attendance trends)
- Toast notifications via `react-hot-toast`

---

## 📦 Key Dependencies

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "axios": "^1",
  "socket.io-client": "^4",
  "@tanstack/react-query": "^5",
  "recharts": "^2",
  "react-hot-toast": "^2",
  "react-dropzone": "^14",
  "tailwindcss": "^3"
}
```

---

## 🔐 Environment Variables (.env)

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
