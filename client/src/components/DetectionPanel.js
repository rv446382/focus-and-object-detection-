import React from 'react';

const DetectionPanel = ({ detectionActive, onStartDetection, onStopDetection, events }) => {
    console.log("events", events);
    return (
        <div className="detection-panel">
            <h3>Detection Controls</h3>

            <div className="detection-buttons">
                {!detectionActive ? (
                    <button className="btn btn-start" onClick={onStartDetection}>
                        Start Detection
                    </button>
                ) : (
                    <button className="btn btn-stop" onClick={onStopDetection}>
                        Stop Detection
                    </button>
                )}
            </div>

            <div className="status-indicator">
                <div className={`status-light ${detectionActive ? 'active' : 'inactive'}`}></div>
                <span>Detection {detectionActive ? 'Active' : 'Inactive'}</span>
            </div>

            <div className="event-summary">
                <h4>Events Summary</h4>
                <div className="event-counters">
                    <div className="event-counter">
                        <span className="count">{events.filter(e => e.type === 'looking_away').length}</span>
                        <span className="label">Looking Away</span>
                    </div>
                    <div className="event-counter">
                        <span className="count">{events.filter(e => e.type === 'no_face').length}</span>
                        <span className="label">No Face</span>
                    </div>
                    <div className="event-counter">
                        <span className="count">{events.filter(e => e.type.includes('detected')).length}</span>
                        <span className="label">Objects</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetectionPanel;