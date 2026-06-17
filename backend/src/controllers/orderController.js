const store = require('../dataStore');

function getOrders(req, res) {
  const { status, search } = req.query;
  let orders = store.getOrdersByStatus(status || 'all');

  if (search) {
    const q = search.toLowerCase().trim();
    orders = orders.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      (o.customerWhatsapp || '').toLowerCase().includes(q)
    );
  }

  const result = orders.map(o => ({ ...o, items: store.getOrderItems(o.id) }));
  res.json(result);
}

function createOrder(req, res) {
  const body = req.body;
  const { customerName, customerWhatsapp, notes, totalPrice, paymentProofUrl, items } = body;

  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
  }

  const id = `ord-${Date.now()}`;
  const orderNumber = store.getNextOrderNumber();
  const now = new Date().toISOString();

  const order = {
    id,
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
    id: `oi-${id}-${i}`,
    orderId: id,
    productId: item.productId || '',
    productName: item.productName || item.name || '',
    quantity: item.quantity || 1,
    price: item.price || 0,
    subtotal: (item.price || 0) * (item.quantity || 1),
    customization: item.customization || undefined,
    selectedVariants: item.selectedVariants || undefined,
  }));

  store.addOrder(order, orderItems);

  for (const item of items) {
    const productId = item.productId || '';
    if (productId) {
      store.deductIngredientStock(productId, item.quantity || 1);
    }
  }

  res.status(201).json({ ...order, items: orderItems });
}

function getOrderById(req, res) {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ ...order, items: store.getOrderItems(order.id) });
}

function updateOrderStatus(req, res) {
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
  const updated = store.updateOrderStatus(req.params.id, newStatus, declineReason);

  if (!updated) return res.status(404).json({ message: 'Order not found' });

  // Emit SSE event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.emit('order_update', {
      orderId: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  }

  res.json({ ...updated, items: store.getOrderItems(updated.id) });
}

function orderEvents(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('retry: 3000\n\n');

  const cleanup = store.addSSEListener((order) => {
    const data = JSON.stringify({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalPrice: order.totalPrice,
      status: order.status,
    });
    res.write(`event: new-order\ndata: ${data}\n\n`);
  });

  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    cleanup();
    clearInterval(keepAlive);
  });
}

module.exports = { getOrders, createOrder, getOrderById, updateOrderStatus, orderEvents };
