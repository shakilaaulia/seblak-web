function requireAdmin(req, res, next) {
  if (req.cookies?.admin_session === 'authenticated') return next();
  return res.status(401).json({ error: 'Unauthorized', message: 'Unauthorized' });
}

module.exports = { requireAdmin };
