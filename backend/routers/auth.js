const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const router = express.Router();

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'doc_system'
});

// Register User
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Error hashing password' });

      // Insert user into database
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error registering user' });

        res.status(200).json({ message: 'User registered successfully' });
      });
    });
  });
});

// Login User
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({
        message: 'Login successful',
        token
      });
    });
  });
});

// Admin Login (This can be similar to regular login but with admin verification)
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to access this page' });
    }

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token for admin
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({
        message: 'Admin login successful',
        token
      });
    });
  });
});

module.exports = router;
