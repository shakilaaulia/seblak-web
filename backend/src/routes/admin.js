const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');

const ADMIN_PIN = process.env.ADMIN_PIN || '123456';

router.post('/auth', asyncWrapper(async (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.cookie('admin_session', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true });
  }
  return res.status(401).json({ message: 'PIN salah' });
}));

router.get('/verify', asyncWrapper(async (req, res) => {
  if (req.cookies?.admin_session === 'authenticated') {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
}));

module.exports = router;
