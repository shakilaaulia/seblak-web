const orders = [];
const orderItems = [];

const restaurant = {
  id: 'rest-1',
  name: 'Seblak Mamah Zahwa',
  description: '',
  address: '',
  phone: '',
  logoUrl: '',
  isOpen: true,
};

const products = [
  {
    id: 'seblak-1', name: 'Seblak Mamah Zahwa', description: 'Seblak khas Mamah Zahwa dengan bumbu pedas pilihan',
    price: 0, stock: 999, imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=400&auto=format&fit=crop',
    categoryId: 'seblak', isActive: true,
  },
  {
    id: 'm1', name: 'Cilok Goang', description: 'Cilok dengan kuah pedas segar',
    price: 10000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
    categoryId: 'makanan', isActive: true,
  },
  {
    id: 'm2', name: 'Mie Bakso', description: 'Mie basah dengan bakso sapi',
    price: 13000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop',
    categoryId: 'makanan', isActive: true,
  },
  {
    id: 'm3', name: 'Mie Jeletot', description: 'Mie pedas jeletot dengan topping ayam suwir',
    price: 10000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
    categoryId: 'makanan', isActive: true,
  },
  {
    id: 'd1', name: 'Pop Ice', description: 'Minuman bubuk pop ice dengan pilihan varian rasa',
    price: 0, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop',
    categoryId: 'minuman', isActive: true,
    variants: [
      { name: 'Coklat', price: 5000 },
      { name: 'Vanilla', price: 5000 },
      { name: 'Stroberi', price: 5000 },
      { name: 'Mangga', price: 5000 },
    ],
  },
  {
    id: 'd2', name: 'Nutrisari', description: 'Minuman bubuk jeruk segar',
    price: 5000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop',
    categoryId: 'minuman', isActive: true,
  },
  {
    id: 'd3', name: 'Beng-beng Drink', description: 'Minuman coklat beng-beng',
    price: 6000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=400&auto=format&fit=crop',
    categoryId: 'minuman', isActive: true,
  },
];

const ingredients = [
  { id: 'i1', name: 'Mie', remaining: 50, unit: 'bungkus', minWarning: 10 },
  { id: 'i2', name: 'Bakso Sapi', remaining: 30, unit: 'butir', minWarning: 10 },
  { id: 'i3', name: 'Cilok', remaining: 40, unit: 'butir', minWarning: 10 },
  { id: 'i4', name: 'Ayam Suwir', remaining: 20, unit: 'porsi', minWarning: 5 },
  { id: 'i5', name: 'Kerupuk Oren', remaining: 25, unit: 'porsi', minWarning: 5 },
  { id: 'i6', name: 'Cireng', remaining: 30, unit: 'porsi', minWarning: 8 },
  { id: 'i7', name: 'Makaroni', remaining: 20, unit: 'porsi', minWarning: 5 },
  { id: 'i8', name: 'Telur Puyuh', remaining: 40, unit: 'butir', minWarning: 10 },
];

const toppings = [
  { id: 't1', name: 'Kerupuk', price: 2000, remaining: 20, minWarning: 5, unit: 'porsi' },
  { id: 't2', name: 'Siomay', price: 3000, remaining: 15, minWarning: 5, unit: 'porsi' },
  { id: 't3', name: 'Ceker Ayam', price: 5000, remaining: 10, minWarning: 3, unit: 'porsi' },
  { id: 't4', name: 'Sosis', price: 4000, remaining: 12, minWarning: 4, unit: 'porsi' },
];

const notifications = [];
let orderCounter = 0;

const sseListeners = [];

function addSSEListener(cb) {
  sseListeners.push(cb);
  return () => {
    const idx = sseListeners.indexOf(cb);
    if (idx !== -1) sseListeners.splice(idx, 1);
  };
}

function notifySSE(order) {
  sseListeners.forEach(cb => cb(order));
}

module.exports = {
  orders, orderItems, restaurant, products, ingredients, toppings, notifications,
  getNextOrderNumber() { orderCounter++; return `#SBK-${String(orderCounter).padStart(3, '0')}`; },
  addOrder(order, items) {
    orders.push(order);
    orderItems.push(...items);
    notifications.push({
      id: `notif-${Date.now()}`,
      title: 'Pesanan Baru',
      message: `Pesanan ${order.orderNumber} dari ${order.customerName} masuk!`,
      orderId: order.id, isRead: false, createdAt: new Date().toISOString(),
    });
    notifySSE(order);
  },
  updateOrderStatus(orderId, status, declineReason) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (declineReason) order.declineReason = declineReason;
      if (status === 'READY') {
        notifications.push({
          id: `notif-${Date.now()}`,
          title: 'Pesanan Siap!',
          message: `Pesanan ${order.orderNumber} siap diambil!`,
          orderId: order.id, isRead: false, createdAt: new Date().toISOString(),
        });
      }
    }
    return order;
  },
  getOrdersByStatus(status) {
    if (!status || status === 'all') return orders;
    return orders.filter(o => o.status === status);
  },
  getOrderById(id) { return orders.find(o => o.id === id); },
  getOrderItems(orderId) { return orderItems.filter(i => i.orderId === orderId); },
  addProduct(product) { products.push(product); return product; },
  updateProduct(id, data) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data };
    return products[idx];
  },
  deleteProduct(id) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1); return true;
  },
  updateProductStock(productId, stock) {
    const product = products.find(p => p.id === productId);
    if (product) { product.stock = Math.max(0, stock); return product; }
    return null;
  },
  updateRestaurant(data) { Object.assign(restaurant, data); return restaurant; },
  addIngredient(ingredient) { ingredients.push(ingredient); return ingredient; },
  updateIngredient(id, data) {
    const idx = ingredients.findIndex(i => i.id === id);
    if (idx === -1) return null;
    ingredients[idx] = { ...ingredients[idx], ...data };
    return ingredients[idx];
  },
  deleteIngredient(id) {
    const idx = ingredients.findIndex(i => i.id === id);
    if (idx === -1) return false;
    ingredients.splice(idx, 1); return true;
  },
  deductIngredientStock(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.recipe) return;
    for (const ing of product.recipe) {
      const ingredient = ingredients.find(i => i.id === ing.ingredientId);
      if (ingredient) ingredient.remaining = Math.max(0, ingredient.remaining - ing.quantity * quantity);
    }
  },
  addTopping(topping) { toppings.push(topping); return topping; },
  updateTopping(id, data) {
    const idx = toppings.findIndex(t => t.id === id);
    if (idx === -1) return null;
    toppings[idx] = { ...toppings[idx], ...data };
    return toppings[idx];
  },
  deleteTopping(id) {
    const idx = toppings.findIndex(t => t.id === id);
    if (idx === -1) return false;
    toppings.splice(idx, 1); return true;
  },
  getDashboardSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayOrders = orders.filter(o => o.createdAt >= todayStart);
    return {
      totalOrdersToday: todayOrders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      processingOrders: orders.filter(o => o.status === 'PROCESSING').length,
      completedToday: todayOrders.filter(o => o.status === 'COMPLETED').length,
      totalRevenueToday: todayOrders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalPrice, 0),
      totalOrdersAll: orders.length,
    };
  },
  getNotifications: () => notifications,
  markNotificationRead(id) { const n = notifications.find(n => n.id === id); if (n) n.isRead = true; },
  addSSEListener,
};
