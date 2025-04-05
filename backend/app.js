const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
// Serve static files
app.use('/uploads', express.static('uploads'));
const uploadRoute = require('./routes/upload');
app.use('/upload', uploadRoute);

const authRoute = require('./routes/auth'); // ✅ Add this
app.use('/auth', authRoute);                // ✅ And this
