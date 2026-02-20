const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  ctc: { type: String, required: true },
  cgpaCutoff: { type: Number, required: true },
  eligibleBranches: [{ type: String }],
  driveDate: { type: Date, required: true },
  lastDateToApply: { type: Date, required: true },
  description: { type: String },
  jobType: { type: String, enum: ['Full-Time', 'Internship', 'Contract'], default: 'Full-Time' },
  status: { type: String, enum: ['upcoming', 'active', 'closed'], default: 'active' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const placementApplicationSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'applied' },
}, { timestamps: true });

placementApplicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

const PlacementDrive = mongoose.models.PlacementDriveAdmin || mongoose.model('PlacementDriveAdmin', placementDriveSchema, 'placement_drives_admin');
const PlacementApplication = mongoose.models.PlacementApplicationAdmin || mongoose.model('PlacementApplicationAdmin', placementApplicationSchema, 'placement_applications_admin');

module.exports = {
  PlacementDrive,
  PlacementApplication,
};
