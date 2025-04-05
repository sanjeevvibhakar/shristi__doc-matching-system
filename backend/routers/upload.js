const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../server');

// Multer config for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload endpoint with credit deduction
router.post('/', upload.single('document'), (req, res) => {
    const userId = req.session.user.id;

    // Deduct credit for the upload
    db.query('SELECT credits, last_scan_date FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error retrieving user data' });
        
        const user = result[0];
        let currentCredits = user.credits;
        const lastScanDate = user.last_scan_date;

        // Check if credits need to be reset (daily reset)
        const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        if (lastScanDate !== currentDate) {
            // Reset daily credits if it’s a new day
            currentCredits = 20;  // Reset credits to default 20 per day
        }

        // Deduct credit if there are enough
        if (currentCredits > 0) {
            db.query('UPDATE users SET credits = credits - 1, last_scan_date = ? WHERE id = ?', [currentDate, userId], (err, updateResult) => {
                if (err) return res.status(500).json({ message: 'Error updating user credits' });
                
                res.json({
                    message: 'File uploaded successfully!',
                    file: req.file,
                    remainingCredits: currentCredits - 1
                });
            });
        } else {
            res.status(400).json({ message: 'Not enough credits. Please refill your credits.' });
        }
    });
});

module.exports = router;
