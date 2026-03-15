const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyName: { type: String },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  companyWebsite: { type: String },
  companySize: { type: String },
  industry: { type: String },
  companyDescription: { type: String },
  contactPhone: { type: String },
  jobTitle: { type: String },
  linkedInUrl: { type: String },
  verified: { type: Boolean, default: false },
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, {
  timestamps: true
});

// Indexes
// Note: email index is automatically created by unique: true
recruiterSchema.index({ verified: 1 });

module.exports = mongoose.model('Recruiter', recruiterSchema);
