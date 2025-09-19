import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';

const CandidateVideoRecorder = () => {
    const webcamRef = useRef(null);
    const recorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);

    const startRecording = () => {
        const stream = webcamRef.current.srcObject;
        if (!stream) {
            alert('Camera not ready yet!');
            return;
        }
        recorderRef.current = new RecordRTC(stream, { type: 'video' });
        recorderRef.current.startRecording();
        setRecording(true);
    };

    const stopRecording = async () => {
        if (!recorderRef.current) return;
        recorderRef.current.stopRecording(() => {
            const blob = recorderRef.current.getBlob();
            setVideoBlob(blob);
            recorderRef.current = null;
            setRecording(false);
        });
    };

    const downloadRecording = () => {
        if (!videoBlob) return;
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'candidate_video.webm';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>Candidate Video Recorder</h2>
            <video
                ref={webcamRef}
                autoPlay
                playsInline
                muted
                style={{ width: '60%', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <div style={{ marginTop: '20px' }}>
                {!recording ? (
                    <button onClick={startRecording} style={buttonStyle}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} style={buttonStyle}>
                        Stop Recording
                    </button>
                )}
                {videoBlob && (
                    <button onClick={downloadRecording} style={{ ...buttonStyle, marginLeft: '10px' }}>
                        Download Video
                    </button>
                )}
            </div>
        </div>
    );
};

// Request webcam access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        const videoElement = document.querySelector('video');
        if (videoElement) videoElement.srcObject = stream;
    })
    .catch(err => console.error('Camera access denied:', err));

const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
};

export default CandidateVideoRecorder;
