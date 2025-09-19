const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Event = require('../models/Event');

// Create a new interview with suspicious events
router.post('/', async (req, res) => {
    try {
        const { candidateName, suspiciousEvents, videoUrl } = req.body;
        console.log("Creating interview for candidate:", candidateName);
        console.log("Suspicious events data received:", suspiciousEvents);

        // 1. Create Event documents if any
        let eventIds = [];
        if (suspiciousEvents && suspiciousEvents.length > 0) {
            const events = await Event.insertMany(suspiciousEvents);
            eventIds = events.map(e => e._id);
            console.log("Created Events IDs:", eventIds);
        }

        // 2. Create Interview with event references
        const interview = await Interview.create({
            candidateName,
            videoUrl,
            suspiciousEvents: eventIds
        });

        console.log("Interview created successfully:", interview);
        res.status(201).json(interview);
    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(400).json({ error: error.message });
    }
});

// End an interview and calculate duration
router.post('/:id/end', async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            console.log("Interview not found for ID:", req.params.id);
            return res.status(404).json({ error: 'Interview not found' });
        }

        interview.endTime = new Date();
        interview.duration = Math.floor((interview.endTime - interview.startTime) / 1000); // seconds
        await interview.save();

        console.log(`Interview Ended: ${interview.candidateName}`);
        console.log("Interview duration (seconds):", interview.duration);
        console.log("Suspicious events stored:", interview.suspiciousEvents);
        res.json(interview);
    } catch (error) {
        console.error("Error ending interview:", error);
        res.status(400).json({ error: error.message });
    }
});

// Add a suspicious event to an ongoing interview
router.post('/:id/event', async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            console.log("Interview not found for adding event, ID:", req.params.id);
            return res.status(404).json({ error: 'Interview not found' });
        }

        console.log("Adding new suspicious event:", req.body);

        // Create the event
        const event = await Event.create(req.body);
        console.log("Created event with ID:", event._id);

        // Push event ID to interview
        interview.suspiciousEvents.push(event._id);
        await interview.save();

        console.log("Updated interview with new event:", interview.suspiciousEvents);
        res.status(201).json({ interview, event });
    } catch (error) {
        console.error("Error adding suspicious event:", error);
        res.status(400).json({ error: error.message });
    }
});

// Get interview report with populated events
router.get('/:id/report', async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id).populate('suspiciousEvents');
        if (!interview) {
            console.log("Interview not found for report, ID:", req.params.id);
            return res.status(404).json({ error: 'Interview not found' });
        }

        console.log("Generating report for interview:", interview.candidateName);

        // Calculate integrity score
        let deductions = 0;
        interview.suspiciousEvents.forEach(event => {
            console.log("Event in report:", event.type, event._id);
            switch(event.type) {
                case 'looking_away': deductions += 2; break;
                case 'no_face': deductions += 5; break;
                case 'multiple_faces': deductions += 10; break;
                case 'phone_detected': deductions += 15; break;
                case 'book_detected': deductions += 10; break;
                case 'device_detected': deductions += 10; break;
            }
        });

        const integrityScore = Math.max(0, 100 - deductions);
        console.log("Calculated integrity score:", integrityScore);

        res.json({
            candidateName: interview.candidateName,
            interviewDuration: interview.duration,
            focusScore: interview.focusScore,
            suspiciousEvents: interview.suspiciousEvents,
            integrityScore,
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
