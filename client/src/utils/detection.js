import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';

let cocoModel = null;
let faceModel = null;
let detectionInterval = null;
let faceDetectionTimeouts = {};

// ---------------- Audio detection ----------------
let audioContext = null;
let microphone = null;
let analyser = null;
let audioDataArray = null;

// ---------------- Utility: show alert box ----------------
const showAlert = (message) => {
    let alertBox = document.createElement("div");
    alertBox.innerText = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.background = "red";
    alertBox.style.color = "white";
    alertBox.style.padding = "10px 15px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.zIndex = "9999";
    alertBox.style.fontFamily = "Arial";
    alertBox.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.3)";
    document.body.appendChild(alertBox);

    // Auto-remove after 3s
    setTimeout(() => alertBox.remove(), 3000);
};

// ---------------- Initialize models ----------------
export const initDetections = async () => {
    try {
        console.log('Initializing TensorFlow.js...');
        await tf.ready();
        console.log('TensorFlow.js ready');

        console.log('Loading COCO-SSD model...');
        cocoModel = await cocoSsd.load();
        console.log('COCO-SSD model loaded');

        console.log('Loading BlazeFace model...');
        faceModel = await blazeface.load();
        console.log('BlazeFace model loaded');

        return true;
    } catch (error) {
        console.error('Error loading models:', error);
        return false;
    }
};

// ---------------- Detect faces ----------------
const detectFaces = async (video) => {
    const now = Date.now();
    try {
        const faces = await faceModel.estimateFaces(video, false);

        if (faces.length > 0) {
            if (faceDetectionTimeouts.noFace) {
                clearTimeout(faceDetectionTimeouts.noFace);
                delete faceDetectionTimeouts.noFace;
            }
            faces.forEach(face => {
                const [x1, y1] = face.topLeft;
                const [x2, y2] = face.bottomRight;
                if (x2 - x1 > 10 && y2 - y1 > 10) face.detected = true;
            });
        } else {
            if (!faceDetectionTimeouts.noFace) {
                faceDetectionTimeouts.noFace = setTimeout(() => {
                    if (faces.length === 0) {
                        faces.push({
                            type: 'no_face',
                            timestamp: now,
                            duration: 10000,
                            confidence: 0.9
                        });
                    }
                    delete faceDetectionTimeouts.noFace;
                }, 10000);
            }
        }

        return faces;
    } catch (err) {
        console.error("Face detection error:", err);
        return [];
    }
};

// ---------------- Detect looking away ----------------
let lookingAwayStart = null; 

const detectLookingAway = (faces, videoWidth, videoHeight) => {
    const events = [];
    const now = Date.now();

    if (!faces || faces.length === 0) {
        lookingAwayStart = null; 
        return events;
    }

    faces.forEach(face => {
        const [x1, y1] = face.topLeft;
        const [x2, y2] = face.bottomRight;
        const faceCenterX = (x1 + x2) / 2;
        const faceCenterY = (y1 + y2) / 2;

        const centerThresholdX = videoWidth * 0.15;
        const centerThresholdY = videoHeight * 0.15;

        const videoCenterX = videoWidth / 2;
        const videoCenterY = videoHeight / 2;

        const isLookingAway =
            Math.abs(faceCenterX - videoCenterX) > centerThresholdX ||
            Math.abs(faceCenterY - videoCenterY) > centerThresholdY;

        if (isLookingAway) {
            if (!lookingAwayStart) {
                lookingAwayStart = now;
            } else if (now - lookingAwayStart >= 5000) {
                events.push({
                    type: 'looking_away',
                    timestamp: now,
                    duration: now - lookingAwayStart,
                    confidence: 0.9
                });
                lookingAwayStart = null; 
            }
        } else {
            lookingAwayStart = null; 
        }
    });

    return events;
};


// ---------------- Detect multiple faces ----------------
const detectMultipleFaces = (faces) => {
    const events = [];
    const now = Date.now();
    const faceCount = faces.filter(f => !f.type).length;
    if (faceCount > 1) {
        events.push({
            type: 'multiple_faces',
            timestamp: now,
            duration: 1000,
            confidence: 0.9
        });
    }
    return events;
};

// ---------------- Detect objects ----------------
const processObjectDetection = (predictions) => {
    const events = [];
    const now = Date.now();
    const suspiciousObjects = {
        'cell phone': 'phone_detected',
        'book': 'book_detected',
        'laptop': 'device_detected',
        'tv': 'device_detected',
        'clock': 'device_detected',
    };

    predictions.forEach(prediction => {
        const objectType = suspiciousObjects[prediction.class];
        if (objectType && prediction.score > 0.2) {
            events.push({
                type: objectType,
                timestamp: now,
                duration: 1000,
                confidence: prediction.score
            });
        }
    });

    return events;
};

// ---------------- Draw detections ----------------
const drawDetections = (ctx, objectPredictions, faces, videoWidth, videoHeight) => {
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    objectPredictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 5 : 10
        );
    });

    faces.forEach(face => {
        if (face.type === 'no_face') return;
        const [x1, y1] = face.topLeft;
        const [x2, y2] = face.bottomRight;
        const size = [x2 - x1, y2 - y1];

        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, size[0], size[1]);

        ctx.fillStyle = '#00FF00';
        ctx.fillText("Face", x1, y1 > 10 ? y1 - 5 : 10);
    });
};

// ---------------- Start detection ----------------
export const startDetection = async (webcamRef, onEventsDetected) => {
    // --- Initialize audio detection ---
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        audioDataArray = new Uint8Array(analyser.fftSize);
        microphone.connect(analyser);
        console.log("Audio detection initialized");
    } catch (err) {
        console.error("Audio detection error:", err);
    }

    const canvas = document.getElementById('detectionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    detectionInterval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            canvas.width = videoWidth;
            canvas.height = videoHeight;

            try {
                const objectPredictions = await cocoModel.detect(video);
                const faces = await detectFaces(video);

                const lookingAwayEvents = detectLookingAway(faces, videoWidth, videoHeight);
                const multipleFacesEvents = detectMultipleFaces(faces);
                const objectEvents = processObjectDetection(objectPredictions);

                // --- Audio detection inside main loop ---
                const audioEvents = [];
                if (analyser) {
                    analyser.getByteTimeDomainData(audioDataArray);
                    let sum = 0;
                    for (let i = 0; i < audioDataArray.length; i++) {
                        const sample = (audioDataArray[i] - 128) / 128;
                        sum += sample * sample;
                    }
                    const rms = Math.sqrt(sum / audioDataArray.length);
                    if (rms > 0.05) {
                        audioEvents.push({
                            type: 'background_noise',
                            timestamp: Date.now(),
                            duration: 1000,
                            confidence: rms
                        });
                    }
                }

                const allEvents = [
                    ...lookingAwayEvents,
                    ...multipleFacesEvents,
                    ...objectEvents,
                    ...audioEvents
                ];

                drawDetections(ctx, objectPredictions, faces, videoWidth, videoHeight);

                // ---------------- Trigger alerts directly here ----------------
                if (allEvents.length > 0) {
                    allEvents.forEach(e => {
                        showAlert(`⚠️ ${e.type.replace("_", " ")} detected`);
                    });

                    if (onEventsDetected) onEventsDetected(allEvents);
                }
            } catch (error) {
                console.error('Error during detection:', error);
            }
        }
    }, 500); // 0.5 sec interval
};

// ---------------- Stop detection ----------------
export const stopDetection = () => {
    if (detectionInterval) clearInterval(detectionInterval);
    detectionInterval = null;

    Object.keys(faceDetectionTimeouts).forEach(key => {
        clearTimeout(faceDetectionTimeouts[key]);
    });
    faceDetectionTimeouts = {};

    const canvas = document.getElementById('detectionCanvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    // --- Stop audio detection ---
    if (audioContext) {
        audioContext.close();
        audioContext = null;
        analyser = null;
        microphone = null;
    }
};
