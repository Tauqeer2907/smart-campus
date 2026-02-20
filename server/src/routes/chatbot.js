const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const store = require('../utils/store');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/chatbot/leave-advice
 * AI-powered attendance optimization advice.
 * Body: { studentId, targetDate }
 */
router.post('/leave-advice', async (req, res) => {
  const { studentId, targetDate } = req.body;

  if (!studentId) return res.status(400).json({ error: 'studentId is required' });

  // Fetch student's attendance data
  const attendanceData = (await store.readData('attendance.json', []))
    .filter((d) => d.studentId === studentId);

  if (attendanceData.length === 0) {
    return res.json({
      recommendation: 'attend',
      message: 'No attendance records found. We recommend attending all classes.',
      subjects: [],
    });
  }

  // Try Python AI service first
  try {
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat/leave-advice`, {
      studentId,
      targetDate,
      attendanceData,
    }, { timeout: 10000 });

    return res.json(aiResponse.data);
  } catch (error) {
    // Fallback: compute locally
  }

  // Local computation fallback
  const subjects = attendanceData.map((sub) => {
    const currentPct = parseFloat(sub.percentage) || 0;
    const newAttended = sub.attended;
    const newTotal = sub.total + 1;
    const projectedPct = ((newAttended / newTotal) * 100).toFixed(1);
    const risk = projectedPct < 65 ? 'high' : projectedPct < 75 ? 'medium' : 'low';

    return {
      subject: sub.subject,
      faculty: sub.faculty,
      currentPercentage: currentPct,
      projectedIfSkipped: parseFloat(projectedPct),
      attended: sub.attended,
      total: sub.total,
      risk,
      riskColor: risk === 'high' ? 'red' : risk === 'medium' ? 'amber' : 'green',
    };
  });

  const riskySubjects = subjects.filter((s) => s.risk !== 'low');
  const avgPct = subjects.reduce((sum, s) => sum + s.currentPercentage, 0) / subjects.length;

  let recommendation, message;
  if (riskySubjects.length > 0) {
    recommendation = 'attend';
    message = `⚠️ Skipping classes on ${targetDate || 'the target date'} would put ${riskySubjects.length} subject(s) at risk. We recommend attending all classes.`;
  } else if (avgPct > 85) {
    recommendation = 'safe_to_skip';
    message = `✅ Your overall attendance is strong at ${avgPct.toFixed(1)}%. You can safely skip one day without falling below the required threshold.`;
  } else {
    recommendation = 'caution';
    message = `⚡ Your attendance is moderate. Skipping is possible but monitor closely. Subjects near 75% need attention.`;
  }

  res.json({
    recommendation,
    message,
    subjects,
    targetDate: targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
  });
});

/**
 * POST /api/chatbot/library-renewal
 * AI-powered library renewal suggestions.
 * Body: { studentId }
 */
router.post('/library-renewal', async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) return res.status(400).json({ error: 'studentId is required' });

  // Fetch student's borrowed books
  const borrows = (await store.readData('borrows.json', []))
    .filter((b) => b.studentId === studentId && b.status === 'borrowed');

  if (borrows.length === 0) {
    return res.json({
      suggest: false,
      message: 'You have no borrowed books.',
      books: [],
    });
  }

  // Try Python AI service
  try {
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat/library-renewal`, {
      studentId,
      borrows,
    }, { timeout: 10000 });

    return res.json(aiResponse.data);
  } catch (error) {
    // Fallback
  }

  // Local fallback
  const now = new Date();
  const booksNeedingRenewal = borrows
    .map((b) => {
      const dueDate = new Date(b.dueDate);
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return {
        ...b,
        daysLeft,
        urgent: daysLeft <= 3,
      };
    })
    .filter((b) => b.daysLeft <= 5);

  const shouldSuggest = booksNeedingRenewal.length > 0;

  res.json({
    suggest: shouldSuggest,
    message: shouldSuggest
      ? `📚 You have ${booksNeedingRenewal.length} book(s) due soon. Would you like to renew them?`
      : 'All your books are within their due dates. No action needed.',
    books: booksNeedingRenewal,
    generatedAt: new Date().toISOString(),
  });
});

/**
 * POST /api/chatbot/academic-insights
 * AI-powered academic performance insights.
 * Body: { studentId }
 */
router.post('/academic-insights', async (req, res) => {
  const { studentId } = req.body;

  const attendance = (await store.readData('attendance.json', []))
    .filter((d) => d.studentId === studentId);
  const assignments = await store.readData('assignments.json', []);

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted');

  const avgAttendance = attendance.length > 0
    ? (attendance.reduce((sum, d) => sum + parseFloat(d.percentage || 0), 0) / attendance.length).toFixed(1)
    : 0;

  const lowAttendanceSubjects = attendance.filter((d) => parseFloat(d.percentage || 0) < 75);

  res.json({
    summary: {
      averageAttendance: parseFloat(avgAttendance),
      totalSubjects: attendance.length,
      pendingAssignments: pendingAssignments.length,
      submittedAssignments: submittedAssignments.length,
      lowAttendanceSubjects: lowAttendanceSubjects.map((s) => s.subject),
    },
    insights: [
      avgAttendance < 75 ? '⚠️ Your overall attendance is below 75%. Risk of detention.' : '✅ Attendance is healthy.',
      pendingAssignments.length > 0 ? `📝 You have ${pendingAssignments.length} pending assignment(s). Check deadlines.` : '✅ All assignments submitted.',
      lowAttendanceSubjects.length > 0 ? `🔴 Low attendance in: ${lowAttendanceSubjects.map((s) => s.subject).join(', ')}` : '✅ All subjects above threshold.',
    ],
    generatedAt: new Date().toISOString(),
  });
});

module.exports = router;
