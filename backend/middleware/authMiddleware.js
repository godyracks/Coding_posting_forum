const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = req.header('Authorization');

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Remove the 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT verification error:", err.message);
    return res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
