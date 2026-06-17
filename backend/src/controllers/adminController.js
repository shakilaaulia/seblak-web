const ADMIN_PIN = '123456';

function auth(req, res) {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.cookie('admin_session', 'true', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 * 1000,
      path: '/',
    });
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false, message: 'PIN salah' });
}

function verify(req, res) {
  const session = req.cookies?.admin_session;
  if (session === 'true') {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
}

module.exports = { auth, verify };
