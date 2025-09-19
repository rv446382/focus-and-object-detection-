const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number,  // Duration in seconds
  focusScore: { type: Number, default: 100 },
  suspiciousEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',   // Reference to Event model
  }],
  videoUrl: String,
});

module.exports = mongoose.model('Interview', InterviewSchema);
