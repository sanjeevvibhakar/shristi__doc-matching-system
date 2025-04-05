const express = require('express');
const router = express.Router();
const db = require('../server');

// Admin Route to get all users and their credits
router.get('/users', (req, res) => {
    db.query('SELECT id, username, credits, last_scan_date FROM users', (err, users) => {
        if (err) return res.status(500).json({ message: 'Error retrieving users data' });

        res.json(users);
    });
});

// Admin Route to refill credits for a user
router.post('/refill', (req, res) => {
    const { userId, creditsToAdd } = req.body;

    if (!creditsToAdd || creditsToAdd <= 0) {
        return res.status(400).json({ message: 'Invalid credit amount' });
    }

    db.query('UPDATE users SET credits = credits + ? WHERE id = ?', [creditsToAdd, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error refilling credits' });

        res.json({ message: `Credits refilled for user ${userId}` });
    });
});

module.exports = router;
