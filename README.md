online Interview Proctoring System (MERN Stack)

A MERN stack web application that monitors candidates during online interviews in real-time, detects suspicious activities, and generates detailed reports. Reports can be exported in CSV/PDF format for evaluation.

Project Summary

This system allows candidates to start an interview by entering their name. During the interview, it monitors suspicious activities like phone usage, books/notes, background noise, and looking away from the screen. At the end, a report is automatically generated, showing interview duration, detected suspicious activities, and deduction percentage.

Key Features

Candidate login and interview start.

Real-time detection of:

Phone usage

Books/notes

Background noise

Looking away from screen

Automatic interview report generation.

Exportable reports in CSV/PDF format.

Deduction percentage calculated based on suspicious activity.

Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB Atlas

Detection: TensorFlow.js / ML models

Deployment: Render (frontend + backend)

Reporting: json2csv / jsPDF

Installation & Running Locally
Backend
cd backend
npm install
npm run dev


Runs the Express server on http://localhost:5000 (or configured port).

Frontend
cd frontend
npm install
npm start


Runs the React frontend on http://localhost:3000
