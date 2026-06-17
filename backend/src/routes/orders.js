const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const {
  addSSEListener,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../services/db');

const router = express.Router();

router.get('/', asyncWrapper(async (req, res) => {
  const { status, search } = req.query;
  if (!search && req.cookies?.admin_session !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized', message: 'Unauthorized' });
  }
  res.json(await getAllOrders(status, search ? String(search).trim() : undefined));
}));

router.get('/events', requireAdmin, asyncWrapper(async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('event: connected\ndata: {}\n\n');
  const cleanup = addSSEListener(res);
  req.on('close', cleanup);
}));

router.get('/:id', asyncWrapper(async (req, res) => {
  const order = await getOrderById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

router.post('/', asyncWrapper(async (req, res) => {
  res.status(201).json(await createOrder(req.body));
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  const statusMap = {
    approve: 'PROCESSING',
    process: 'PROCESSING',
    ready: 'READY',
    complete: 'COMPLETED',
    decline: 'DECLINED',
  };
  const nextStatus = statusMap[req.body.action];
  if (!nextStatus) return res.status(400).json({ message: 'Invalid action' });
  const order = await updateOrderStatus(req.params.id, nextStatus, req.body.declineReason);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

module.exports = router;
