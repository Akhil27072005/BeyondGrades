const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true 
  },
  years: { type: Number, default: 0 },
  confidence: { type: Number, min: 0, max: 1, default: 0.5 }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College',
    required: true 
  },
  yearOfGraduation: { type: Number, required: true },
  phone: { type: String },
  degree: { type: String }, // e.g. "B.Tech", "B.E.", "M.Tech"
  branch: { type: String }, // e.g. "Computer Science", "ECE"
  dateOfBirth: { type: Date },
  cgpa: { type: Number, min: 0, max: 10 },
  linkedInUrl: { type: String },
  collegeEmailVerified: { type: Boolean, default: false },
  roleTags: [{ type: String }], // e.g., ["SDE", "Data Scientist"]
  skills: [skillSchema],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  githubUrl: { type: String },
  portfolioUrl: { type: String },
  visibility: {
    public: { type: Boolean, default: true },
    contactAllowed: { type: Boolean, default: true }
  },
  alumniConnections: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  calendarPreferences: {
    preferredDays: [{ type: Number }], // 0-6 (Sun-Sat)
    preferredTimeRanges: [{
      start: { type: String }, // e.g. "09:00"
      end: { type: String }    // e.g. "17:00"
    }],
    blockedPeriods: [{
      title: { type: String },
      start: { type: Date },
      end: { type: Date }
    }]
  }
}, {
  timestamps: true
});

// Indexes
// Note: email index is automatically created by unique: true
studentSchema.index({ 'skills.name': 1 });
studentSchema.index({ collegeId: 1, yearOfGraduation: 1 });

module.exports = mongoose.model('Student', studentSchema);
