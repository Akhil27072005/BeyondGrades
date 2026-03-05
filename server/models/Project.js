const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domainTags: [{ type: String }],
  skillTags: [{ type: String }],
  repoUrl: { type: String },
  demoUrl: { type: String },
  media: [{ type: String }],
  role: { type: String },
  contributions: [{ type: String }],
  evidenceScore: { type: Number, min: 0, max: 1, default: 0 }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ studentId: 1 });
projectSchema.index({ skillTags: 1 });
projectSchema.index({ domainTags: 1 });

module.exports = mongoose.model('Project', projectSchema);
