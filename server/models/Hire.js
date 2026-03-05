const mongoose = require('mongoose');

const hireSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true 
  },
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recruiter',
    required: true 
  },
  company: { type: String, required: true },
  markedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

// Indexes
hireSchema.index({ studentId: 1, active: 1 });
hireSchema.index({ jobId: 1 });
hireSchema.index({ recruiterId: 1 });

module.exports = mongoose.model('Hire', hireSchema);
