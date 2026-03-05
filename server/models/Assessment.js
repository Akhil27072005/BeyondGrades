const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['mcq', 'text', 'coding'],
    required: true 
  },
  prompt: { type: String, required: true },
  options: [{ type: String }], // for MCQ
  answer: { type: String } // for MCQ
});

const resultSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  score: { type: Number, min: 0, max: 100 },
  submittedAt: { type: Date, default: Date.now }
});

const assessmentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  title: { type: String, required: true },
  questions: [questionSchema],
  results: [resultSchema],
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes
assessmentSchema.index({ jobId: 1 });
assessmentSchema.index({ startAt: 1, endAt: 1 });
assessmentSchema.index({ 'results.studentId': 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
