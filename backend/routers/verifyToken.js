const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    req.user = decoded;  // Store user info from the token
    next();
  });
};

module.exports = verifyToken;


const verifyToken = require('./verifyToken');

// Example for an admin route
router.get('/admin/data', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  res.status(200).json({ message: 'This is admin data' });
});
