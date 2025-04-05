const express = require('express');
const router = express.Router();
const db = require('../server'); // Assuming you're using the same DB connection
const { compareDocuments } = require('../services/matchingService');

// Match documents API
router.post('/match', isAuthenticated, async (req, res) => {
  const { documentId } = req.body;

  // Get the uploaded document's path
  db.query('SELECT path FROM files WHERE id = ?', [documentId], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    
    if (result.length === 0) return res.status(404).json({ message: 'Document not found' });

    const documentPath = result[0].path;

    // Get paths of other uploaded documents
    db.query('SELECT path FROM files WHERE id != ?', [documentId], async (err, files) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const filePaths = files.map(file => file.path);

      // Compare the uploaded document with other documents
      const matches = await compareDocuments(documentPath, filePaths);

      res.json({ matches });
    });
  });
});

module.exports = router;
