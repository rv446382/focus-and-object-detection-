import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import DetectionPanel from '../components/DetectionPanel';
import EventLog from '../components/EventLog';
import { initDetections, startDetection, stopDetection } from '../utils/detection';
import { createInterview, addEvent, endInterview } from '../services/api';

const Interview = () => {
    const [webcamRef, setWebcamRef] = useState(null);
    const [detectionActive, setDetectionActive] = useState(false);
    const [events, setEvents] = useState([]);
    const [interview, setInterview] = useState(null);
    const [candidateName, setCandidateName] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [loading, setLoading] = useState(true);
    const [interviewStartTime, setInterviewStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const navigate = useNavigate();
    const webcamRefInternal = useRef();

    useEffect(() => {
        const loadModels = async () => {
            setLoading(true);
            const success = await initDetections();
            setLoading(false);
            if (!success) {
                alert('Failed to load detection models. Please refresh the page and try again.');
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        let interval;
        if (detectionActive && interviewStartTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - interviewStartTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [detectionActive, interviewStartTime]);

    const handleVideoReady = useCallback((ref) => {
        setWebcamRef(ref);
        webcamRefInternal.current = ref;
    }, []);

    const handleCreateInterview = async () => {
        if (!candidateName.trim()) return;
        try {
            const newInterview = await createInterview({
                candidateName,
                suspiciousEvents: [] 
            });
            setInterview(newInterview);
            setShowForm(false);
            console.log('Interview created:', newInterview);
        } catch (error) {
            alert('Error creating interview: ' + error.message);
            console.error(error);
        }
    };

    const handleStartDetection = () => {
        if (!webcamRef || !interview) return;

        if (!interviewStartTime) {
            setInterviewStartTime(Date.now());
            setElapsedTime(0);
        }

        setDetectionActive(true);

        startDetection(webcamRef, async (newEvents) => {
            setEvents(prev => [...prev, ...newEvents]);

            for (const event of newEvents) {
                if (!event.type) continue; 
                try {
                    await addEvent(interview._id, event);
                    console.log('Event saved:', event);
                } catch (err) {
                    console.error('Error saving event:', err);
                }
            }
        });
    };

    const handleStopDetection = async () => {
        stopDetection();
        setDetectionActive(false);

        if (interview) {
            try {
                const endedInterview = await endInterview(interview._id);
                console.log('Interview ended:', endedInterview);
                navigate(`/report/${interview._id}`); // Redirect to report
            } catch (error) {
                console.error('Error ending interview:', error);
            }
        }

        setInterviewStartTime(null);
        setElapsedTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="loading">Loading detection models...</div>;
    }

    return (
        <div className="interview-page">
            <div className="container">
                <div className="page-header">
                    <h2>Video Interview Proctoring</h2>
                    <p>Monitor candidate focus and detect unauthorized items during interviews</p>
                </div>

                {showForm && (
                    <div className="candidate-form">
                        <h3>Enter Candidate Information</h3>
                        <div className="form-group">
                            <label>Candidate Name</label>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="Enter candidate name"
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateInterview}
                        >
                            Start Interview
                        </button>
                    </div>
                )}

                {/* Interview Content */}
                {!showForm && (
                    <div className="interview-content">
                        <div className="video-section">
                            <VideoPlayer
                                onVideoReady={handleVideoReady}
                                detectionActive={detectionActive}
                            />
                            <canvas id="detectionCanvas" style={{ position: 'absolute', top: 0, left: 0 }} />
                            <div className="interview-timer">
                                Interview Duration: {formatTime(elapsedTime)}
                            </div>
                        </div>

                        <div className="sidebar">
                            <DetectionPanel
                                detectionActive={detectionActive}
                                onStartDetection={handleStartDetection}
                                onStopDetection={handleStopDetection}
                                events={events}
                            />
                            <EventLog events={events} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Interview;
