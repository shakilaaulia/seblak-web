// src/controllers/authController.js
const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');

/**
 * Customer login / auto‑register via WhatsApp number.
 * Expected body: { phoneNumber, name? }
 */
async function loginCustomer(req, res) {
  const { phoneNumber, name } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber required' });
  }

  let user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phoneNumber,
        name: name || '',
        role: 'CUSTOMER',
      },
    });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, user });
}

/**
 * Seller (admin) login.
 * Expected body: { phoneNumber, password }
 */
async function loginSeller(req, res) {
  const { phoneNumber, password } = req.body;
  // Simple example – replace with proper password hashing in prod.
  const seller = await prisma.user.findFirst({
    where: {
      phoneNumber,
      role: 'SELLER',
    },
  });

  if (!seller) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (password !== process.env.SELLER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: seller.id, role: seller.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, seller });
}

module.exports = { loginCustomer, loginSeller };
