const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authGuard } = require('../middleware/authGuard');

router.post('/', orderController.createOrder); // Public: Create order
router.get('/track', orderController.trackOrder); // Public: Track order by phone/search
router.get('/:id', orderController.getOrderById); // Public: View order detail

router.get('/', authGuard, orderController.getOrders); // Admin only: List all orders
router.patch('/:id', authGuard, orderController.updateOrderStatus); // Admin only: Update order status

module.exports = router;
