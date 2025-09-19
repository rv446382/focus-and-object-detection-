const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: String,
    resumeUrl: String,
    appliedPosition: String,
});

module.exports = mongoose.model('Candidate', CandidateSchema);