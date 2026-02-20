const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { Attendance, Subject, User, Notification } = require('../models');
const { sendDualNotification } = require('../services/emailService');
const attendanceAlertService = require('../services/attendanceAlertService');
const { success, error } = require('../utils/apiResponse');

async function markAttendance(req, res) {
  try {
    const { subjectCode, facultyId, sessionStudents = [] } = req.body;

    if (!subjectCode || !Array.isArray(sessionStudents) || sessionStudents.length === 0) {
      return error(res, 'subjectCode and sessionStudents are required', 400);
    }

    const subject = await Subject.findOne({ code: subjectCode }).lean();
    const subjectName = subject?.name || subjectCode;

    await Promise.all(
      sessionStudents.map(async (student) => {
        const studentId = student.studentId;
        const present = Boolean(student.present);

        const existing = await Attendance.findOne({ studentId, subjectCode }).lean();

        if (!existing) {
          const attended = present ? 1 : 0;
          const total = 1;
          const percentage = Number(((attended / total) * 100).toFixed(1));

          await Attendance.create({
            id: uuidv4(),
            studentId,
            subject: subjectName,
            subjectCode,
            branch: student.branch,
            semester: student.semester,
            attended,
            total,
            percentage,
            faculty: facultyId || req.user?.facultyId || '',
            credits: student.credits || subject?.credits || 3,
            lastUpdated: new Date().toISOString(),
            present,
          });
        } else {
          const attended = Number(existing.attended || 0) + (present ? 1 : 0);
          const total = Number(existing.total || 0) + 1;
          const percentage = Number(((attended / total) * 100).toFixed(1));

          await Attendance.findOneAndUpdate(
            { id: existing.id },
            {
              $set: {
                attended,
                total,
                percentage,
                lastUpdated: new Date().toISOString(),
                faculty: facultyId || req.user?.facultyId || existing.faculty,
                branch: student.branch || existing.branch,
                semester: student.semester || existing.semester,
              },
            },
            { new: true },
          );
        }
      }),
    );

    await attendanceAlertService.checkAndAlert(sessionStudents, subjectCode);

    return success(res, { subjectCode, count: sessionStudents.length }, 'Attendance marked and alerts checked');
  } catch (e) {
    return error(res, 'Failed to mark attendance', 500, e.message);
  }
}

async function notifyAtRiskStudent(req, res) {
  try {
    const { studentId, subjectCode, facultyId } = req.body;

    if (!studentId || !subjectCode) {
      return error(res, 'studentId and subjectCode are required', 400);
    }

    const studentQuery = [{ id: studentId }, { studentId }];
    if (mongoose.Types.ObjectId.isValid(String(studentId))) {
      studentQuery.push({ _id: studentId });
    }

    const student = await User.findOne({
      $or: studentQuery,
      role: 'student',
    }).lean();

    if (!student) return error(res, 'Student not found', 404);
    if (!student.email || !student.parentEmail) {
      return error(res, 'Student email or parent email missing', 400);
    }

    const attendanceRecord = await Attendance.findOne({
      studentId: student.id || student.studentId,
      subjectCode,
    }).lean();

    const attendancePercentage = Number(attendanceRecord?.percentage || 0);
    const subject = await Subject.findOne({ code: subjectCode }).lean();
    const subjectName = subject?.name || subjectCode;
    const date = new Date().toLocaleDateString();

    await sendDualNotification(student, subjectName, attendancePercentage, date);

    await Notification.create({
      id: uuidv4(),
      userId: student.id || student.studentId,
      type: 'attendance_alert',
      title: `Attendance Alert — ${subjectName}`,
      message: `Alert sent to you and your parent for ${subjectName}. Current attendance: ${attendancePercentage}%`,
      read: false,
      createdAt: new Date().toISOString(),
      facultyId: facultyId || req.user?.facultyId,
    });

    return success(res, null, 'Emails sent to student and parent');
  } catch (e) {
    return error(res, 'Failed to send dual notification', 500, e.message);
  }
}

module.exports = {
  markAttendance,
  notifyAtRiskStudent,
};
