const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['offer', 'interview', 'deadline', 'networking', 'campus', 'block'],
    required: true
  },
  start: { type: Date, required: true },
  end: { type: Date },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  company: { type: String },
  location: { type: String },
  joinLink: { type: String },
  notes: { type: String },

  // Offer-specific
  offerStage: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  offerDeadline: { type: Date },
  compensationSummary: { type: String },
  recruiterContact: { type: String },

  // Interview-specific (multi-round)
  roundType: { type: String }, // e.g. 'HR', 'Tech', 'Final'
  roundIndex: { type: Number, default: 0 },
  durationMinutes: { type: Number },

  // Blocked time / availability
  isBlocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

calendarEventSchema.index({ studentId: 1, start: 1 });
calendarEventSchema.index({ studentId: 1, type: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
