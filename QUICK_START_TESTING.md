# Smart Campus Production - Quick Start Guide

## 🚀 Getting Started with the New Production System

### Prerequisites
- All three services running (Backend 5000, AI 8000, Frontend 8080)
- MongoDB connection active
- Browser (Chrome, Firefox, Safari recommended)

---

## TEST FLOW 1: Student Registration & Login

### Step 1: Student Signs Up
1. Open browser → `http://localhost:8080`
2. Click "Student Portal" on landing page
3. Click "Sign up here" link
4. **Fill Signup Form**:
   - Full Name: `Rohan Kumar`
   - Email: `rohan@example.com`
   - Branch: `Computer Science` (from dropdown)
   - Roll Number: `2024CS001` (Format: YYYYBB###)
   - Year: `1st Year`
5. Click "Register as Student"
6. ✅ Should see: **"Signup awaiting admin approval"** message

### Step 2: Admin Approves Signup
1. Open new browser tab → `http://localhost:8080`
2. Login as Admin:
   - Go to `/login/admin`
   - Use any identifier (system will create admin if needed)
3. Navigate to **Admin Dashboard**
4. Click **"Student Signup Management"** (new link)
5. You should see **Rohan Kumar** in "Pending Applications"
6. Click **✅ Approve** button
7. Confirm in dialog
8. ✅ Status changes to Approved

### Step 3: Student Logs In
1. Go to `/login/student`
2. Enter: `2024CS001` (roll number) or `rohan@example.com` (email)
3. Click "Sign In"
4. ✅ Should redirect to **Student Dashboard**

### Step 4: Test Rejection
1. Have another student signup with: `2024CS999`
2. Admin goes to Management Dashboard
3. Click **❌ Reject**
4. Enter reason: `Invalid roll number for this semester`
5. Student tries to login
6. ✅ Should see: **"Account Rejected. Reason: Invalid roll..."**

---

## TEST FLOW 2: Notification System

### Step 1: View Notification Center
1. Login as student
2. **Top right corner**: Click **Bell icon** 🔔
3. ✅ Popover opens with notification list
4. Badge shows **unread count**

### Step 2: Mark as Read
1. In notification popover, click **"Mark all as read"**
2. All notifications turn from bold → normal
3. ✅ Unread count badge disappears

### Step 3: Click-Through Navigation
1. Click any notification (e.g., "Low Attendance Warning")
2. ✅ Should navigate to **Attendance page**
3. Notification automatically marked as read
4. Popover closes

### Step 4: Clear Notifications
1. Open notification popover again
2. Click **X button** (top right of popover)
3. ✅ All notifications cleared
4. "No notifications yet" message shown

---

## TEST FLOW 3: AI Chatbot Training

### Step 1: Ask for Help
1. Login as any role (student/faculty/admin)
2. Scroll down → **Chatbot** window (bottom right)
3. Type: `help` or `what can you do?`
4. ✅ Should get **role-specific response**:
   - **Student**: Attendance, Academics, Assignments, Library, Placements, etc.
   - **Faculty**: Grading, Attendance marking, Resources, Recommendations
   - **Admin**: Signup management, Placements, Library, Finance, Analytics

### Step 2: Ask Feature Question
1. Type: `Tell me about attendance`
2. ✅ Should get detailed response about Attendance module

### Step 3: Get Contextual Suggestions
1. Go to **Attendance page**
2. Chatbot should show **context-aware suggestions**:
   - "⚠️ Which subjects need attention?"
   - "📈 Calculate required classes"
   - "🔮 Attendance prediction"

### Step 4: Ask General Campus Question
1. Type: `What's the placement process?`
2. ✅ Should get explanation referencing Placements module

---

## TEST FLOW 4: Admin Signup Dashboard Features

### Step 1: View Statistics
1. Open `/admin/signup-management` page
2. ✅ Should see **3 cards**:
   - Pending: X applications
   - Approved: Y applications
   - Rejected: Z applications

### Step 2: Filter & Search
1. Application list shows all **pending** signups
2. Each row has: **Name, Email, Roll Number, Branch, Year, Date Applied**
3. ✅ Can see action buttons on each row

### Step 3: Bulk Actions
1. Click **"Refresh"** button
2. ✅ List updates with latest signups
3. Click **"Mark all as read"** (admin level)
4. ✅ Status updates reflected

---

## VALIDATION TESTS

### Roll Number Format Validation
```
✅ Valid: 2024CS001, 2024IT132, 2024ECE999
❌ Invalid: 2024C1, CS001, 202401, 2024CSA01
```
**Test**: Try invalid format in signup → Should show error

### Branch Dropdown
```
✅ Valid Options:
- Computer Science
- Information Technology
- Electronics & Communication
- Electrical Engineering
- Mechanical Engineering
- Civil Engineering
- Chemical Engineering
```

### Duplicate Detection
```
❌ Can't register same email twice
❌ Can't register same roll number twice
✅ Error message shown to user
```
**Test**: Try signup twice with same email → Should reject

---

## DATABASE VERIFICATION

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# Switch to database
use smart_campus  # or your DB name

# Check users collection
db.users.find().pretty()

# Should show:
# {
#   _id: ObjectId(...),
#   id: "uuid...",
#   name: "Rohan Kumar",
#   email: "rohan@example.com",
#   rollNumber: "2024CS001",
#   branch: "Computer Science",
#   role: "student",
#   status: "approved",
#   createdAt: "2026-02-20T...",
#   approvedAt: "2026-02-20T...",
#   approvedBy: "admin-id..."
# }

# Check for any seeded users
db.users.find({studentId: {$in: ["2024NITCS001", "STU001"]}})
# Should return EMPTY (demo data removed)
```

---

## PERFORMANCE CHECK

### Service Health
```bash
# Backend
curl http://localhost:5000/api/health
# Response: {"status":"ok","storage":"mongodb",...}

# AI Service  
curl http://localhost:8000/health
# Response: {"service":"Smart Campus AI Chatbot","status":"ok",...}

# Frontend
curl http://localhost:8080
# Response: HTTP 200 + HTML
```

### API Response Times
- `/api/auth/register` → < 500ms
- `/api/auth/pending-signups` → < 300ms
- `/api/auth/approve-signup/:id` → < 200ms
- `/api/notifications` → < 200ms

---

## COMMON TEST SCENARIOS

### Scenario 1: End-to-End Student Journey
1. ✅ Signup with branch + roll
2. ✅ Wait for approval
3. ✅ Login successfully
4. ✅ See dashboard & notifications
5. ✅ Click notification → navigate
6. ✅ Chat with AI about features

### Scenario 2: Admin Workflow
1. ✅ Login as admin
2. ✅ View pending signups
3. ✅ Approve/reject with reasons
4. ✅ Check statistics
5. ✅ See notification of action taken

### Scenario 3: Rejection Flow
1. ✅ Signup with suspicious data
2. ✅ Admin rejects with reason
3. ✅ Student tries to login
4. ✅ Sees rejection notice with reason
5. ✅ Can't login until approved

---

## TROUBLESHOOTING

### Problem: "User not found" on login
**Solution**: User hasn't been approved by admin yet. Check `/admin/signup-management`

### Problem: Can't see pending signups
**Solution**: Ensure user has **admin role**. Check user object in DB.

### Problem: Notification popover empty
**Solution**: Check MongoDB `notifications` collection. May need to seed data.

### Problem: Chatbot not responding
**Solution**: Verify `KNOWLEDGE_BASE.md` exists in ai-service folder. Restart Flask.

### Problem: Branch dropdown not showing
**Solution**: Check browser console for JS errors. Clear cache & reload.

---

## ROLLBACK INSTRUCTIONS

If you need to revert to demo mode:

1. **Restore demo users** in `auth.js`:
   ```javascript
   const defaultUsers = [
     { id: 'STU001', studentId: '2024NITCS001', ... }
   ];
   ```

2. **Re-enable auto-signup**:
   ```javascript
   if (!user) {
     // Create user on-the-fly
   }
   ```

3. **Restart backend**:
   ```bash
   npm restart
   ```

**Note**: This will revert to demo mode for entire system.

---

## SUCCESS CRITERIA

✅ Student can signup with branch + roll number  
✅ Admin can see and approve/reject signups  
✅ Only approved students can login  
✅ Notifications popover shows and routes correctly  
✅ AI chatbot responds with feature-aware answers  
✅ No demo/seeded users exist in database  
✅ All three services running and healthy  

---

## NEXT STEPS

1. **Test with real data** from your institution
2. **Email notifications** for signup status changes
3. **SMS alerts** for critical notifications
4. **Batch CSV import** for admin signup uploads
5. **Webhook integrations** for third-party systems
6. **Advanced AI** with recommended actions

---

**Last Updated**: 2026-02-20  
**Test Estimated Time**: 30 minutes  
**Status**: Ready for QA
