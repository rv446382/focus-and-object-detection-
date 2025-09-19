import React from 'react';

const EventLog = ({ events }) => {
    const getEventLabel = (type) => {
        const labels = {
            'looking_away': 'Looking Away',
            'no_face': 'No Face Detected',
            'multiple_faces': 'Multiple Faces',
            'phone_detected': 'Phone Detected',
            'book_detected': 'Book/Notes Detected',
            'device_detected': 'Electronic Device Detected'
        };
        return labels[type] || type;
    };

    const getEventIcon = (type) => {
        const icons = {
            'looking_away': '👀',
            'no_face': '🙈',
            'multiple_faces': '👥',
            'phone_detected': '📱',
            'book_detected': '📖',
            'device_detected': '💻'
        };
        return icons[type] || '⚠️';
    };

    return (
        <div className="event-log">
            <h3>Detection Events</h3>
            {events.length === 0 ? (
                <p className="no-events">No events detected yet</p>
            ) : (
                <div className="events-list">
                    {events.map((event, index) => (
                        <div key={index} className="event-item">
                            <div className="event-icon">{getEventIcon(event.type)}</div>
                            <div className="event-details">
                                <div className="event-type">{getEventLabel(event.type)}</div>
                                <div className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</div>
                            </div>
                            <div className="event-confidence">{Math.round(event.confidence * 100)}%</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventLog;