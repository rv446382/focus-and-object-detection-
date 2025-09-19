const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Interview = require('../models/Interview');

// Create a new event and attach to an interview
router.post('/:interviewId', async (req, res) => {
    try {
        const { interviewId } = req.params;
        const eventData = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        const event = await Event.create(eventData);
        interview.suspiciousEvents.push(event._id);
        await interview.save();
        console.log(`New suspicious event added to interview ${interview.candidateName}:`, event);
        res.status(201).json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(400).json({ error: error.message });
    }
});

// Get all events for an interview
router.get('/:interviewId', async (req, res) => {
    try {
        const events = await Event.find({ _id: { $in: (await Interview.findById(req.params.interviewId)).suspiciousEvents } });
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
