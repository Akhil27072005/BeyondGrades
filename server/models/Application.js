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
  notes: { type: String }
});

// Indexes
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
