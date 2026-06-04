// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { loginCustomer, loginSeller } = require('../controllers/authController');
const asyncWrapper = require('../middleware/asyncWrapper');

// Customer login (WhatsApp number) – auto‑register if not exist
router.post('/customer', asyncWrapper(loginCustomer));

// Seller/Admin login
router.post('/seller', asyncWrapper(loginSeller));

module.exports = router;
