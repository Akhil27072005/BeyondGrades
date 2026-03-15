const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  resumeSnapshot: { type: String }, // fileId or URL
  status: { 
    type: String, 
    enum: ['applied', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'],
    default: 'applied'
  },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String },
  // Pipeline: which hiring stage this candidate is in
  pipelineStage: {
    type: String,
    enum: ['application', 'screening', 'assignment', 'technical_interview', 'hire'],
    default: 'application'
  },
  subStatus: { type: String }, // e.g. "Invitation pending", "Screening scheduled", "Contract sent"
  stageMovedAt: { type: Date },
  stageDeadline: { type: Date }
});

// Indexes
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ jobId: 1, pipelineStage: 1 });

module.exports = mongoose.model('Application', applicationSchema);
