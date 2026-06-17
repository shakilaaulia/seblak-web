const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');

const router = express.Router();

router.post('/auth', asyncWrapper(async (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || '123456';
  if (String(pin) !== String(adminPin)) {
    return res.status(401).json({ error: 'PIN salah', message: 'PIN salah' });
  }
  res.cookie('admin_session', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  return res.json({ success: true });
}));

router.get('/verify', asyncWrapper(async (req, res) => {
  if (req.cookies?.admin_session === 'authenticated') return res.json({ authenticated: true });
  return res.status(401).json({ authenticated: false });
}));

router.post('/logout', asyncWrapper(async (_req, res) => {
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true });
}));

module.exports = router;
