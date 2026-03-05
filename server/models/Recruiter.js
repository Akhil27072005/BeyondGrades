const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
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
  companySize: { type: String }, // e.g. "1-10", "11-50", "51-200"
  industry: { type: String }, // e.g. "Technology", "Finance"
  companyDescription: { type: String },
  contactPhone: { type: String },
  jobTitle: { type: String }, // recruiter's role, e.g. "HR Manager"
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
