const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectWithRetry = () => {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/video-interview', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('MongoDB connected');
    }).catch(err => {
        console.error('MongoDB connection error:', err);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
};

connectWithRetry();

// Routes
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/events', require('./routes/events'));
app.use('/api/candidates', require('./routes/candidates'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Video Interview Proctoring API' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});