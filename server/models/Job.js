const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  requiredLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true 
  },
  weight: { type: Number, min: 0, max: 1, default: 1 }
});

const shortlistSettingsSchema = new mongoose.Schema({
  topN: { type: Number, default: 10 },
  weights: {
    domain: { type: Number, default: 0.30 },
    skill: { type: Number, default: 0.45 },
    expertise: { type: Number, default: 0.25 }
  }
});

const jobSchema = new mongoose.Schema({
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recruiter',
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  requiredSkills: [requiredSkillSchema],
  optionalSkills: [{ type: String }],
  minExperienceYears: { type: Number, default: 0 },
  locationType: { 
    type: String, 
    enum: ['remote', 'onsite', 'hybrid'],
    default: 'onsite'
  },
  batchTarget: [{ type: Number }], // graduation years
  shortlistSettings: shortlistSettingsSchema
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ 'requiredSkills.name': 1 });
jobSchema.index({ domain: 1 });
jobSchema.index({ batchTarget: 1 });

module.exports = mongoose.model('Job', jobSchema);
