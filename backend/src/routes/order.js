// src/routes/order.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.post('/', asyncWrapper(createOrder));
router.get('/', asyncWrapper(getOrders));
router.patch('/:id/status', asyncWrapper(updateOrderStatus));

module.exports = router;
