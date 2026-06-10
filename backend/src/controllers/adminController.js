exports.login = (req, res, next) => {
  try {
    const { pin } = req.body;
    const ADMIN_PIN = process.env.ADMIN_PIN || '123456';
    
    if (pin === ADMIN_PIN) {
      res.cookie('admin_session', 'true', {
        httpOnly: true,
        secure: false, // In production, this should be true with HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 8 * 1000, // 8 hours in ms (frontend had 8 hours in seconds)
        path: '/',
      });
      return res.json({ authenticated: true });
    }
    
    return res.status(401).json({ authenticated: false, message: 'PIN salah' });
  } catch (err) {
    next(err);
  }
};

exports.verify = (req, res) => {
  const session = req.cookies?.admin_session;
  if (session === 'true') {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
};
