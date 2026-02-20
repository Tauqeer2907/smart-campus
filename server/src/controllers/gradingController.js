const Grade = require('../models/Grade');
const mongoose = require('mongoose');
const { User } = require('../models');
const { success, error } = require('../utils/apiResponse');

function toLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
}

async function saveGrades(req, res) {
  try {
    const { subjectCode, grades = [] } = req.body;

    if (!subjectCode || !Array.isArray(grades)) {
      return error(res, 'subjectCode and grades are required', 400);
    }

    const invalid = grades.find((g) => Number(g.marks) > Number(g.maxMarks));
    if (invalid) {
      return error(res, `marks cannot exceed maxMarks for student ${invalid.studentId}`, 400);
    }

    await Promise.all(
      grades.map((grade) =>
        Grade.findOneAndUpdate(
          {
            studentId: grade.studentId,
            subjectCode,
            examType: grade.examType,
          },
          {
            $set: {
              studentId: grade.studentId,
              subjectCode,
              marks: Number(grade.marks),
              maxMarks: Number(grade.maxMarks),
              examType: grade.examType,
              updatedAt: new Date(),
            },
          },
          { new: true, upsert: true },
        ),
      ),
    );

    return success(res, { savedCount: grades.length }, 'Grades saved successfully');
  } catch (e) {
    return error(res, 'Failed to save grades', 500, e.message);
  }
}

async function exportGradesCSV(req, res) {
  try {
    const { subjectCode, examType } = req.query;
    if (!subjectCode || !examType) {
      return error(res, 'subjectCode and examType are required', 400);
    }

    const grades = await Grade.find({ subjectCode, examType }).lean();

    const rows = await Promise.all(
      grades.map(async (grade) => {
        const query = [{ id: grade.studentId }, { studentId: grade.studentId }];
        if (mongoose.Types.ObjectId.isValid(String(grade.studentId))) {
          query.push({ _id: grade.studentId });
        }
        const student = await User.findOne({ $or: query }).lean();

        const marks = Number(grade.marks || 0);
        const maxMarks = Number(grade.maxMarks || 0);
        const percentageValue = maxMarks > 0 ? Number(((marks / maxMarks) * 100).toFixed(1)) : 0;
        const letterGrade = toLetterGrade(percentageValue);

        return [
          student?.rollNumber || student?.studentId || grade.studentId,
          student?.name || 'Unknown Student',
          marks,
          maxMarks,
          `${percentageValue}%`,
          letterGrade,
        ];
      }),
    );

    const header = 'Roll Number,Student Name,Marks,Max Marks,Percentage,Grade';
    const csvBody = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
    const csv = `${header}\n${csvBody}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="grades_${subjectCode}_${examType}.csv"`);
    return res.status(200).send(csv);
  } catch (e) {
    return error(res, 'Failed to export grades CSV', 500, e.message);
  }
}

module.exports = {
  saveGrades,
  exportGradesCSV,
};
