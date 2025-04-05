const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

// Initialize app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'doc_system'
});

// Connect to DB
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Set Storage Engine for Multer (File uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to 'uploads' folder
  },
  filename: function (req, file, cb) {
    const userId = req.session.user ? req.session.user.id : 1; // Get user ID from session
    const today = new Date().toISOString().slice(0, 10);
    const ext = path.extname(file.originalname);
    cb(null, `user${userId}_${today}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Routes Setup
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const matchRoutes = require('./routes/match');
const uploadRoutes = require('./routes/upload');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/match', matchRoutes);

// Upload File Route (Handles Uploads and Credit Deduction)
app.post('/upload', upload.single('document'), (req, res) => {
  const userId = req.session.user ? req.session.user.id : 1; // Get user ID from session
  const today = new Date().toISOString().slice(0, 10);

  db.query(
    'SELECT * FROM user_uploads WHERE user_id = ? AND upload_date = ?',
    [userId, today],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length > 0) {
        const uploadCount = results[0].upload_count;

        if (uploadCount >= 20) {
          return res.status(400).json({ message: 'Upload limit reached for today.' });
        }

        // Update upload count
        db.query(
          'UPDATE user_uploads SET upload_count = upload_count + 1 WHERE user_id = ? AND upload_date = ?',
          [userId, today],
          (err) => {
            if (err) return res.status(500).json({ error: err });

            const fileName = req.file.filename;
            const filePath = req.file.path;

            db.query(
              'INSERT INTO files (user_id, file_name, file_path, upload_date) VALUES (?, ?, ?, ?)',
              [userId, fileName, filePath, today],
              (err) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                  message: 'File uploaded successfully!',
                  file: req.file
                });
              }
            );
          }
        );
      } else {
        // First upload today
        db.query(
          'INSERT INTO user_uploads (user_id, upload_date, upload_count) VALUES (?, ?, 1)',
          [userId, today],
          (err) => {
            if (err) return res.status(500).json({ error: err });

            const fileName = req.file.filename;
            const filePath = req.file.path;

            db.query(
              'INSERT INTO files (user_id, file_name, file_path, upload_date) VALUES (?, ?, ?, ?)',
              [userId, fileName, filePath, today],
              (err) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                  message: 'File uploaded successfully!',
                  file: req.file
                });
              }
            );
          }
        );
      }
    }
  );
});

// Fetch all files uploaded by a user
app.get('/files', (req, res) => {
  const userId = req.session.user ? req.session.user.id : 1; // Get user ID from session

  db.query(
    'SELECT * FROM files WHERE user_id = ? ORDER BY upload_date DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        files: results
      });
    }
  );
});

// Download a file
app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  db.query(
    'SELECT * FROM files WHERE id = ?',
    [fileId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length === 0) {
        return res.status(404).json({ message: 'File not found.' });
      }

      const file = results[0];
      const filePath = path.join(__dirname, file.file_path);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(404).json({ message: 'File not found on server.' });
        }

        res.download(filePath, file.file_name, (err) => {
          if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file.');
          }
        });
      });
    }
  );
});

// Preview a file
app.get('/preview/:id', (req, res) => {
  const fileId = req.params.id;

  db.query(
    'SELECT * FROM files WHERE id = ?',
    [fileId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length === 0) {
        return res.status(404).json({ message: 'File not found.' });
      }

      const file = results[0];
      const filePath = path.join(__dirname, file.file_path);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(404).json({ message: 'File not found on server.' });
        }

        res.sendFile(filePath);  // Preview the file in browser
      });
    }
  );
});

// Start Server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
