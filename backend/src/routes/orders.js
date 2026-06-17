const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getNextOrderNumber,
  deductIngredientStock,
  addSSEListener,
} = require('../services/db');

// GET /api/orders - list/search orders
router.get('/', asyncWrapper(async (req, res) => {
  const { status, search } = req.query;
  const orders = await getAllOrders(status, search?.toLowerCase().trim());
  const result = orders.map(o => ({
    ...o,
    paymentProofFileName: undefined,
  }));
  res.json(orders);
}));

// GET /api/orders/events - SSE stream
router.get('/events', asyncWrapper(async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('event: connected\ndata: {}\n\n');

  const cleanup = addSSEListener(res);

  req.on('close', () => {
    cleanup();
  });
}));

// GET /api/orders/:id - single order with items
router.get('/:id', asyncWrapper(async (req, res) => {
  const order = await getOrderById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

// POST /api/orders - create order
router.post('/', asyncWrapper(async (req, res) => {
  const { customerName, customerWhatsapp, notes, totalPrice, paymentProofUrl, items } = req.body;
  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
  }

  const orderNumber = await getNextOrderNumber();
  const now = new Date().toISOString();

  const orderData = {
    orderNumber,
    customerName,
    customerWhatsapp: customerWhatsapp || '',
    notes: notes || '',
    totalPrice: totalPrice || 0,
    paymentProofUrl: paymentProofUrl || '',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  const orderItems = items.map((item, i) => ({
    productId: item.productId || '',
    productName: item.productName || item.name || '',
    quantity: item.quantity || 1,
    price: item.price || 0,
    subtotal: (item.price || 0) * (item.quantity || 1),
    customization: item.customization || undefined,
    selectedVariants: item.selectedVariants || undefined,
  }));

  const order = await createOrder(orderData, orderItems);

  for (const item of items) {
    const productId = item.productId || '';
    if (productId) {
      await deductIngredientStock(productId, item.quantity || 1);
    }
  }

  res.status(201).json(order);
}));

// PATCH /api/orders/:id - update order status
router.patch('/:id', asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { action, declineReason } = req.body;

  const validActions = ['approve', 'process', 'ready', 'complete', 'decline'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  const statusMap = {
    approve: 'PROCESSING',
    process: 'PROCESSING',
    ready: 'READY',
    complete: 'COMPLETED',
    decline: 'DECLINED',
  };

  const newStatus = statusMap[action];
  const updated = await updateOrderStatus(id, newStatus, declineReason);
  if (!updated) return res.status(404).json({ message: 'Order not found' });

  res.json(updated);
}));

module.exports = router;
