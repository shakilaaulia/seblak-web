const prisma = require('../prismaClient');

// --- Order counter (keep in memory for speed) ---
let orderCounter = 0;

// --- SSE listeners for real-time new order notification ---
const sseListeners = [];

function addSSEListener(res) {
  sseListeners.push(res);
  return () => {
    const idx = sseListeners.indexOf(res);
    if (idx !== -1) sseListeners.splice(idx, 1);
  };
}

function notifySSE(order) {
  sseListeners.forEach(res => {
    try {
      res.write(`event: new-order\ndata: ${JSON.stringify(order)}\n\n`);
    } catch (e) {
      // remove dead connections
    }
  });
}

// --- Product ---
async function getAllProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
}

async function createProduct(data) {
  return prisma.product.create({ data });
}

async function updateProduct(id, data) {
  return prisma.product.update({ where: { id }, data });
}

async function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

async function updateProductStock(id, stock) {
  return prisma.product.update({ where: { id }, data: { stock: Math.max(0, stock) } });
}

// --- Ingredient ---
async function getAllIngredients() {
  return prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
}

async function createIngredient(data) {
  return prisma.ingredient.create({ data });
}

async function updateIngredient(id, data) {
  return prisma.ingredient.update({ where: { id }, data });
}

async function deleteIngredient(id) {
  return prisma.ingredient.delete({ where: { id } });
}

// --- Topping ---
async function getAllToppings() {
  return prisma.topping.findMany({ orderBy: { name: 'asc' } });
}

async function createTopping(data) {
  return prisma.topping.create({ data });
}

async function updateTopping(id, data) {
  return prisma.topping.update({ where: { id }, data });
}

async function deleteTopping(id) {
  return prisma.topping.delete({ where: { id } });
}

// --- Order ---
async function getNextOrderNumber() {
  orderCounter++;
  return `#SBK-${String(orderCounter).padStart(3, '0')}`;
}

async function getAllOrders(status, search) {
  const where = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerWhatsapp: { contains: search, mode: 'insensitive' } },
    ];
  }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
}

async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

async function createOrder(orderData, items) {
  const order = await prisma.order.create({
    data: {
      ...orderData,
      items: {
        create: items,
      },
    },
    include: { items: true },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      title: 'Pesanan Baru',
      message: `Pesanan ${order.orderNumber} dari ${order.customerName} masuk!`,
      orderId: order.id,
    },
  });

  // Notify SSE listeners
  notifySSE(order);

  return order;
}

async function updateOrderStatus(id, newStatus, declineReason) {
  const data = { status: newStatus };
  if (declineReason) data.declineReason = declineReason;

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  });

  if (newStatus === 'READY') {
    await prisma.notification.create({
      data: {
        title: 'Pesanan Siap!',
        message: `Pesanan ${order.orderNumber} siap diambil!`,
        orderId: order.id,
      },
    });
  }

  return order;
}

// --- Dashboard Summary ---
async function getDashboardSummary() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const allOrders = await prisma.order.findMany();
  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);

  const totalOrdersToday = todayOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
  const processingOrders = allOrders.filter(o => o.status === 'PROCESSING').length;
  const completedToday = todayOrders.filter(o => o.status === 'COMPLETED').length;
  const totalRevenueToday = todayOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return {
    totalOrdersToday,
    pendingOrders,
    processingOrders,
    completedToday,
    totalRevenueToday,
    totalOrdersAll: allOrders.length,
  };
}

// --- Restaurant ---
async function getRestaurant() {
  let setting = await prisma.restaurantSetting.findUnique({ where: { id: 'rest-1' } });
  if (!setting) {
    setting = await prisma.restaurantSetting.create({ data: { id: 'rest-1' } });
  }
  return setting;
}

async function updateRestaurant(data) {
  return prisma.restaurantSetting.upsert({
    where: { id: 'rest-1' },
    update: data,
    create: { id: 'rest-1', ...data },
  });
}

// --- Notification ---
async function getAllNotifications() {
  return prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
}

async function markNotificationRead(id) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

// --- Ingredient Stock Deduction ---
async function deductIngredientStock(productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.recipe) return;

  for (const ing of product.recipe) {
    const ingredient = await prisma.ingredient.findUnique({ where: { id: ing.ingredientId } });
    if (ingredient) {
      await prisma.ingredient.update({
        where: { id: ing.ingredientId },
        data: { remaining: Math.max(0, ingredient.remaining - ing.quantity * quantity) },
      });
    }
  }
}

// --- Topping Stock ---
async function validateToppingStock(items) {
  const errors = [];
  const toppingNeeds = {};
  for (const item of items) {
    if (item.customization?.toppings) {
      for (const topping of item.customization.toppings) {
        const qty = topping.quantity * (item.quantity || 1);
        toppingNeeds[topping.name] = (toppingNeeds[topping.name] || 0) + qty;
      }
    }
  }
  for (const [name, needed] of Object.entries(toppingNeeds)) {
    const dbTopping = await prisma.topping.findFirst({ where: { name } });
    if (!dbTopping) {
      errors.push(`Topping "${name}" tidak ditemukan`);
    } else if (dbTopping.remaining < needed) {
      errors.push(`Stok topping "${name}" tidak mencukupi. Tersedia: ${dbTopping.remaining}, diminta: ${needed}`);
    }
  }
  return errors;
}

async function deductToppingStock(items) {
  const toppingNeeds = {};
  for (const item of items) {
    if (item.customization?.toppings) {
      for (const topping of item.customization.toppings) {
        const qty = topping.quantity * (item.quantity || 1);
        toppingNeeds[topping.name] = (toppingNeeds[topping.name] || 0) + qty;
      }
    }
  }
  for (const [name, quantity] of Object.entries(toppingNeeds)) {
    const dbTopping = await prisma.topping.findFirst({ where: { name } });
    if (dbTopping) {
      await prisma.topping.update({
        where: { id: dbTopping.id },
        data: { remaining: { decrement: quantity } },
      });
    }
  }
}

// --- Init order counter ---
async function initOrderCounter() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });
  if (lastOrder) {
    const match = lastOrder.orderNumber.match(/SBK-(\d+)/);
    if (match) {
      orderCounter = parseInt(match[1], 10);
    }
  }
}

module.exports = {
  addSSEListener,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getAllToppings,
  createTopping,
  updateTopping,
  deleteTopping,
  getNextOrderNumber,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getDashboardSummary,
  getRestaurant,
  updateRestaurant,
  getAllNotifications,
  markNotificationRead,
  deductIngredientStock,
  validateToppingStock,
  deductToppingStock,
  initOrderCounter,
};
