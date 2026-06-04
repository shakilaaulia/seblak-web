// src/middleware/authGuard.js
const jwt = require('jsonwebtoken');
/**
 * Simple JWT guard. Expects Authorization header "Bearer <token>".
 * On success, attaches decoded payload to req.user.
 */
function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authGuard };
