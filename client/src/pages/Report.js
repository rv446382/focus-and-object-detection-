import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInterviewReport } from '../services/api';
import Papa from 'papaparse';

const Report = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const reportData = await getInterviewReport(id);
                setReport(reportData);
            } catch (error) {
                console.error('Error fetching report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return hours > 0
            ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getEventTypeLabel = (type) => {
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

    // CSV export function
    const exportCSV = (report) => {
        const csvData = report.suspiciousEvents.map(event => ({
            Time: new Date(event.timestamp).toLocaleTimeString(),
            "Event Type": getEventTypeLabel(event.type),
            Duration: formatDuration(event.duration),
            Confidence: `${Math.round(event.confidence * 100)}%`
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `proctoring_report_${report.candidateName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="report-page">
                <div className="container">
                    <div className="loading">Loading report...</div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="report-page">
                <div className="container">
                    <div className="error">Report not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="report-page">
            <div className="container">
                {/* Header with CSV button on right */}
                <div className="page-header flex justify-between items-center mb-4">
                    <div>
                        <h2>Interview Proctoring Report</h2>
                        <p>Detailed analysis of candidate behavior during the interview</p>
                    </div>
                    <button
                        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                        onClick={() => exportCSV(report)}
                    >
                        Export CSV
                    </button>
                </div>

                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <h3>Candidate Information</h3>
                            <div className="summary-details">
                                <div className="detail-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{report.candidateName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Interview Duration:</span>
                                    <span className="value">{formatDuration(report.interviewDuration)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <h3>Integrity Score</h3>
                            <div className="score-display">
                                <div className="score-circle">
                                    <span className="score-value">{report.integrityScore}%</span>
                                </div>
                                <div className="score-label">Overall Integrity</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <h3>Focus Metrics</h3>
                            <div className="metrics">
                                <div className="metric">
                                    <span className="metric-value">{report.focusScore}%</span>
                                    <span className="metric-label">Focus Score</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{report.suspiciousEvents.length}</span>
                                    <span className="metric-label">Suspicious Events</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="events-detail">
                        <h3>Suspicious Events ({report.suspiciousEvents.length})</h3>
                        {report.suspiciousEvents.length === 0 ? (
                            <p className="no-events">No suspicious events detected during this interview</p>
                        ) : (
                            <table className="events-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Event Type</th>
                                        <th>Duration</th>
                                        <th>Confidence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.suspiciousEvents.map((event, index) => (
                                        <tr key={index}>
                                            <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                                            <td>{getEventTypeLabel(event.type)}</td>
                                            <td>{formatDuration(event.duration)}</td>
                                            <td>{Math.round(event.confidence * 100)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;
