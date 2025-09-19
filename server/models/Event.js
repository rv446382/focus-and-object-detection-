const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    type: { type: String, required: true },       // e.g., 'no_face', 'phone_detected'
    timestamp: { type: Date, default: Date.now }, // Event timestamp
    duration: { type: Number, default: 1000 },    // Duration in ms
    confidence: { type: Number, default: 0.8 },  // Confidence score
});

module.exports = mongoose.model('Event', EventSchema);
