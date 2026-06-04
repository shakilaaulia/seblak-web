// src/controllers/orderController.js
const prisma = require('../prismaClient');
const { generateQueueNumber } = require('../utils/queue');

/**
 * POST /api/orders
 * Creates a new order transactionally.
 * Expected body:
 *   {
 *     spiceLevel: Number,
 *     soupType: String,
 *     toppings: [{ toppingId: Number, quantity: Number }, ...]
 *   }
 */
async function createOrder(req, res) {
  const io = req.app.get('io');
  const userId = req.user?.sub; // assumes auth middleware sets req.user
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const { spiceLevel, soupType, toppings } = req.body;
  if (!Array.isArray(toppings) || toppings.length === 0) {
    return res.status(400).json({ error: 'At least one topping is required' });
  }

  // 1️⃣ Verify topping IDs and fetch prices
  const toppingIds = toppings.map(t => t.toppingId);
  const dbToppings = await prisma.topping.findMany({
    where: { id: { in: toppingIds }, isReady: true },
  });
  if (dbToppings.length !== toppingIds.length) {
    return res.status(400).json({ error: 'Invalid or unavailable topping(s)' });
  }

  // 2️⃣ Compute total price safely
  const priceMap = new Map(dbToppings.map(t => [t.id, Number(t.price)]));
  let totalPrice = 0;
  for (const { toppingId, quantity } of toppings) {
    totalPrice += priceMap.get(toppingId) * quantity;
  }

  // 3️⃣ Generate daily queue number
  const queueNumber = await generateQueueNumber();

  // 4️⃣ Transaction: create Order + OrderDetails
  const order = await prisma.$transaction(async tx => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        queueNumber,
        totalPrice,
        spiceLevel,
        soupType,
        status: 'PENDING',
      },
    });

    const details = toppings.map(t => ({
      orderId: newOrder.id,
      toppingId: t.toppingId,
      quantity: t.quantity,
    }));
    await tx.orderDetail.createMany({ data: details });
    return newOrder;
  });

  // 5️⃣ Emit real‑time event to seller dashboard
  io.emit('new_order', {
    orderId: order.id,
    queueNumber: order.queueNumber,
    totalPrice: order.totalPrice,
    spiceLevel: order.spiceLevel,
    soupType: order.soupType,
    status: order.status,
    createdAt: order.createdAt,
  });

  res.status(201).json({ order });
}

/**
 * GET /api/orders
 *   – No query: seller fetches all orders.
 *   – ?userId=xx : customer fetches his/her order history.
 */
async function getOrders(req, res) {
  const { userId } = req.query;
  const filter = userId ? { userId: Number(userId) } : {};

  const orders = await prisma.order.findMany({
    where: filter,
    include: {
      orderDetails: { include: { topping: true } },
      user: { select: { id: true, name: true, phoneNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
}

/**
 * PATCH /api/orders/:id/status
 * Body: { status: 'COOKING' | 'READY' }
 */
async function updateOrderStatus(req, res) {
  const io = req.app.get('io');
  const orderId = Number(req.params.id);
  const { status } = req.body;
  if (!['COOKING', 'READY'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // Notify the specific customer (room name = `user_${userId}`)
  io.to(`user_${updated.userId}`).emit('status_updated', {
    orderId: updated.id,
    status: updated.status,
    updatedAt: new Date(),
  });

  res.json(updated);
}

module.exports = { createOrder, getOrders, updateOrderStatus };
