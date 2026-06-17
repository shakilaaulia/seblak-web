// src/middleware/authGuard.js
/**
 * Simple cookie-based guard. Expects admin_session cookie to be 'true'.
 */
function authGuard(req, res, next) {
  const session = req.cookies?.admin_session;
  if (session === 'true') {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authGuard };
