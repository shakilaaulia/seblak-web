const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(ctrl.getOrders));
router.post('/', asyncWrapper(ctrl.createOrder));
router.get('/events', asyncWrapper(ctrl.orderEvents));
router.get('/:id', asyncWrapper(ctrl.getOrderById));
router.patch('/:id', asyncWrapper(ctrl.updateOrderStatus));

module.exports = router;
