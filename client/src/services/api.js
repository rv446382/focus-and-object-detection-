const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

// Generic helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response.json();
};


export const createInterview = async (interviewData) => {
    return apiRequest('/interviews', {
        method: 'POST',
        body: JSON.stringify(interviewData),
    });
};

// End an interview
export const endInterview = async (interviewId) => {
    return apiRequest(`/interviews/${interviewId}/end`, {
        method: 'POST',
    });
};

// Get interview report
export const getInterviewReport = async (interviewId) => {
    return apiRequest(`/interviews/${interviewId}/report`);
};



export const addEvent = async (interviewId, eventData) => {
    return apiRequest(`/events/${interviewId}`, {  
        method: 'POST',
        body: JSON.stringify(eventData),          
    });
};


// Get all events for an interview
export const getEventsByInterview = async (interviewId) => {
    return apiRequest(`/events/${interviewId}`);
};


export const getCandidates = async () => {
    return apiRequest('/candidates');
};

export const createCandidate = async (candidateData) => {
    return apiRequest('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateData),
    });
};
