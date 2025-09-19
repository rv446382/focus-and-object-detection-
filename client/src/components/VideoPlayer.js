import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const VideoPlayer = ({ onVideoReady, detectionActive }) => {
    const webcamRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => {
                    setHasPermission(true);
                    if (webcamRef.current && onVideoReady) {
                        onVideoReady(webcamRef);
                    }
                })
                .catch(err => {
                    console.error('Camera permission denied:', err);
                    setHasPermission(false);
                });
        }
    }, [onVideoReady]);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <div className="video-container">
            {hasPermission ? (
                <>
                    <Webcam
                        ref={webcamRef}
                        className="webcam"
                        audio={false}
                        mirrored={true}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        onUserMedia={() => console.log('Webcam access granted')}
                        onUserMediaError={() => console.log('Webcam access denied')}
                    />
                    <canvas className="detection-canvas" id="detectionCanvas" />
                    {!detectionActive && (
                        <div className="video-overlay">
                            <p>Click "Start Detection" to begin monitoring</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="camera-permission-denied">
                    <h3>Camera Access Required</h3>
                    <p>Please allow camera access to use this feature</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;