import { Restaurant, Product, Order, OrderItem, Notification, Topping, Ingredient } from './types';

const orders: Order[] = [];

const orderItems: OrderItem[] = [];

const restaurant: Restaurant = {
  id: 'rest-1',
  name: 'Seblak Mamah Zahwa',
  description: 'Seblak terenak se-Bandung Raya',
  address: 'Jl. Contoh No. 123',
  phone: '081234567890',
  logoUrl: '/logo.png',
};

// ====== FOOD IMAGES ======
const FI = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
];
const DI = [
  'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
  'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80',
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
];

const products: Product[] = [
  // ===== SEBLAK =====
  { id: 'seblak-1', name: 'Seblak Mamah Zahwa', description: 'Seblak khas dengan bumbu rahasia', price: 0, stock: 999, imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', categoryId: 'seblak', isActive: true },

  // ===== MAKANAN — Seblak Bebas Toping =====
  { id: 'm-cilok',       name: 'Cilok Goang',              description: 'Seblak Bebas Toping', price: 10000, stock: 100, imageUrl: FI[0], categoryId: 'makanan', isActive: true },
  { id: 'm-mie-ayam',    name: 'Mie Ayam',                 description: 'Seblak Bebas Toping', price: 10000, stock: 100, imageUrl: FI[1], categoryId: 'makanan', isActive: true },
  { id: 'm-mie-ayam-ckr',name: 'Mie Ayam + Ceker',         description: 'Seblak Bebas Toping', price: 12000, stock: 100, imageUrl: FI[2], categoryId: 'makanan', isActive: true },
  { id: 'm-mie-bakso',   name: 'Mie Bakso',                description: 'Seblak Bebas Toping', price: 13000, stock: 100, imageUrl: FI[3], categoryId: 'makanan', isActive: true },
  { id: 'm-mie-jeletot', name: 'Mie Jeletot',              description: 'Seblak Bebas Toping', price: 10000, stock: 100, imageUrl: FI[4], categoryId: 'makanan', isActive: true },
  { id: 'm-kwetiaw-jlt', name: 'Kwetiaw Jeletot',          description: 'Seblak Bebas Toping', price: 10000, stock: 100, imageUrl: FI[5], categoryId: 'makanan', isActive: true },
  { id: 'm-spatula',     name: 'Spatula / Spaghetti Tulang',description: 'Seblak Bebas Toping', price: 10000, stock: 100, imageUrl: FI[6], categoryId: 'makanan', isActive: true },
  { id: 'm-makroni',     name: 'Makroni Basah + Telor',    description: 'Seblak Bebas Toping', price: 8000,  stock: 100, imageUrl: FI[7], categoryId: 'makanan', isActive: true },
  { id: 'm-ceker-mercon',name: 'Ceker Mercon',             description: 'Seblak Bebas Toping', price: 8000,  stock: 100, imageUrl: FI[0], categoryId: 'makanan', isActive: true },
  { id: 'm-popmie-mini', name: 'Pop Mie Mini',             description: 'Seblak Bebas Toping', price: 5000,  stock: 100, imageUrl: FI[1], categoryId: 'makanan', isActive: true },
  { id: 'm-popmie-besar',name: 'Pop Mie Besar',            description: 'Seblak Bebas Toping', price: 7000,  stock: 100, imageUrl: FI[2], categoryId: 'makanan', isActive: true },
  { id: 'm-mie-gelas',   name: 'Mie Gelas Pake Cup',       description: 'Seblak Bebas Toping', price: 3000,  stock: 100, imageUrl: FI[3], categoryId: 'makanan', isActive: true },
  { id: 'm-cirawang',    name: 'Cirawang Misdasem',        description: 'Seblak Bebas Toping', price: 15000, stock: 100, imageUrl: FI[4], categoryId: 'makanan', isActive: true },

  // ===== MAKANAN — Cireng Isi =====
  { id: 'm-cireng-jando',name: 'Cireng Isi Jando',         description: 'Cireng Isi', price: 1000, stock: 100, imageUrl: FI[5], categoryId: 'makanan', isActive: true },
  { id: 'm-cireng-ati',  name: 'Cireng Isi Ati',           description: 'Cireng Isi', price: 1000, stock: 100, imageUrl: FI[6], categoryId: 'makanan', isActive: true },
  { id: 'm-cireng-keju', name: 'Cireng Isi Keju',          description: 'Cireng Isi', price: 1000, stock: 100, imageUrl: FI[7], categoryId: 'makanan', isActive: true },
  { id: 'm-cireng-bs',   name: 'Cireng Isi Bakso + Sosis', description: 'Cireng Isi', price: 1000, stock: 100, imageUrl: FI[0], categoryId: 'makanan', isActive: true },

  // ===== MAKANAN — Cemilan & Lainnya =====
  { id: 'm-tahu-jablay', name: 'Tahu Jablay',              description: 'Cemilan & Lainnya', price: 5000,  stock: 100, imageUrl: FI[1], categoryId: 'makanan', isActive: true },
  { id: 'm-cibay',       name: 'Cibay',                    description: 'Cemilan & Lainnya', price: 2000,  stock: 100, imageUrl: FI[2], categoryId: 'makanan', isActive: true },
  { id: 'm-basreng',     name: 'Basreng 1 Porsi',          description: 'Cemilan & Lainnya', price: 5000,  stock: 100, imageUrl: FI[3], categoryId: 'makanan', isActive: true },
  { id: 'm-cimol',       name: 'Cimol 1 Porsi',            description: 'Cemilan & Lainnya', price: 5000,  stock: 100, imageUrl: FI[4], categoryId: 'makanan', isActive: true },
  { id: 'm-otakotak',    name: 'Otak-Otak 1 Porsi',        description: 'Cemilan & Lainnya', price: 5000,  stock: 100, imageUrl: FI[5], categoryId: 'makanan', isActive: true },
  { id: 'm-otakotak-oren',name:'Otak-Otak Oren',           description: 'Cemilan & Lainnya', price: 1000,  stock: 100, imageUrl: FI[6], categoryId: 'makanan', isActive: true },
  { id: 'm-otakotak-keju',name:'Otak-Otak Keju Lumer',     description: 'Cemilan & Lainnya', price: 5000,  stock: 100, imageUrl: FI[7], categoryId: 'makanan', isActive: true },
  { id: 'm-karedok-bsr', name: 'Karedok Basreng',          description: 'Cemilan & Lainnya', price: 6000,  stock: 100, imageUrl: FI[0], categoryId: 'makanan', isActive: true },
  { id: 'm-karedok-oo',  name: 'Karedok Otak-Otak',        description: 'Cemilan & Lainnya', price: 6000,  stock: 100, imageUrl: FI[1], categoryId: 'makanan', isActive: true },
  { id: 'm-karedok-cimol',name:'Karedok Cimol',            description: 'Cemilan & Lainnya', price: 6000,  stock: 100, imageUrl: FI[2], categoryId: 'makanan', isActive: true },
  { id: 'm-citul',       name: 'Citul',                    description: 'Cemilan & Lainnya', price: 1000,  stock: 100, imageUrl: FI[3], categoryId: 'makanan', isActive: true },
  { id: 'm-sukro',       name: 'Sukro Cikur',              description: 'Cemilan & Lainnya', price: 1000,  stock: 100, imageUrl: FI[4], categoryId: 'makanan', isActive: true },
  { id: 'm-pilus',       name: 'Pilus',                    description: 'Cemilan & Lainnya', price: 1000,  stock: 100, imageUrl: FI[5], categoryId: 'makanan', isActive: true },
  { id: 'm-cireng-kuah', name: 'Cireng Kuah',              description: 'Cemilan & Lainnya', price: 10000, stock: 100, imageUrl: FI[6], categoryId: 'makanan', isActive: true },
  { id: 'm-martabak',    name: 'Martabak Telor',           description: 'Cemilan & Lainnya', price: 8000,  stock: 100, imageUrl: FI[7], categoryId: 'makanan', isActive: true },
  { id: 'm-cireng-lmkt', name: 'Cireng Lamokot',           description: 'Cemilan & Lainnya', price: 7000,  stock: 100, imageUrl: FI[0], categoryId: 'makanan', isActive: true },
  { id: 'm-kwetiaw-jntr',name: 'Kwetiaw Jontor',           description: 'Cemilan & Lainnya', price: 10000, stock: 100, imageUrl: FI[1], categoryId: 'makanan', isActive: true },
  { id: 'm-cigor',       name: 'Cigor',                    description: 'Cemilan & Lainnya', price: 7000,  stock: 100, imageUrl: FI[2], categoryId: 'makanan', isActive: true },
  { id: 'm-pisang-keju', name: 'Pisang Keju',              description: 'Cemilan & Lainnya', price: 7000,  stock: 100, imageUrl: FI[3], categoryId: 'makanan', isActive: true },
  { id: 'm-pisang-kj-ck',name: 'Pisang Keju Coklat',       description: 'Cemilan & Lainnya', price: 10000, stock: 100, imageUrl: FI[4], categoryId: 'makanan', isActive: true },

  // ===== MINUMAN =====
  { id: 'd-pop-ice',     name: 'Pop Ice',                  description: 'Minuman', price: 5000, stock: 100, imageUrl: DI[0], categoryId: 'minuman', isActive: true },
  { id: 'd-nutrisari',   name: 'Nutrisari',                description: 'Minuman', price: 5000, stock: 100, imageUrl: DI[1], categoryId: 'minuman', isActive: true },
  { id: 'd-bengbeng',    name: 'Beng-Beng Drink',          description: 'Minuman', price: 6000, stock: 100, imageUrl: DI[2], categoryId: 'minuman', isActive: true },
  { id: 'd-teh-tarik',   name: 'Teh Tarik',                description: 'Minuman', price: 6000, stock: 100, imageUrl: DI[3], categoryId: 'minuman', isActive: true },
  { id: 'd-chocolatos',  name: 'Chocolatos',               description: 'Minuman', price: 6000, stock: 100, imageUrl: DI[4], categoryId: 'minuman', isActive: true },
  { id: 'd-milo',        name: 'Milo',                     description: 'Minuman', price: 6000, stock: 100, imageUrl: DI[5], categoryId: 'minuman', isActive: true },
  { id: 'd-creamy-latte',name: 'Creamy Latte',             description: 'Minuman', price: 6000, stock: 100, imageUrl: DI[0], categoryId: 'minuman', isActive: true },
  { id: 'd-tea-jus',     name: 'Tea Jus (pakai cup)',      description: 'Minuman', price: 3000, stock: 100, imageUrl: DI[1], categoryId: 'minuman', isActive: true },
  { id: 'd-teh-sisri',   name: 'Teh Sisri',                description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[2], categoryId: 'minuman', isActive: true },
  { id: 'd-finto',       name: 'Finto',                    description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[3], categoryId: 'minuman', isActive: true },
  { id: 'd-cocorio',     name: 'Cocorio',                  description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[4], categoryId: 'minuman', isActive: true },
  { id: 'd-top-ice',     name: 'Top Ice',                  description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[5], categoryId: 'minuman', isActive: true },
  { id: 'd-marimas',     name: 'Marimas',                  description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[0], categoryId: 'minuman', isActive: true },
  { id: 'd-jasjus',      name: 'Jasjus',                   description: 'Minuman', price: 2000, stock: 100, imageUrl: DI[1], categoryId: 'minuman', isActive: true },
];

const ingredients: Ingredient[] = [
  { id: 'i1', name: 'Mie', remaining: 50, unit: 'bungkus', minWarning: 10 },
  { id: 'i2', name: 'Bakso Sapi', remaining: 30, unit: 'butir', minWarning: 10 },
  { id: 'i3', name: 'Cilok', remaining: 40, unit: 'butir', minWarning: 10 },
  { id: 'i4', name: 'Ayam Suwir', remaining: 20, unit: 'porsi', minWarning: 5 },
  { id: 'i5', name: 'Kerupuk Oren', remaining: 25, unit: 'porsi', minWarning: 5 },
  { id: 'i6', name: 'Cireng', remaining: 30, unit: 'porsi', minWarning: 8 },
  { id: 'i7', name: 'Makaroni', remaining: 20, unit: 'porsi', minWarning: 5 },
  { id: 'i8', name: 'Telur Puyuh', remaining: 40, unit: 'butir', minWarning: 10 },
];

const toppings: Topping[] = [
  { id: 't1', name: 'Kerupuk Oren', price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' },
  { id: 't2', name: 'Makaroni',     price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' },
  { id: 't3', name: 'Mie Kuning',   price: 1500, remaining: 100, minWarning: 10, unit: 'porsi' },
  { id: 't4', name: 'Sosis',        price: 2000, remaining: 100, minWarning: 10, unit: 'porsi' },
  { id: 't5', name: 'Ceker',        price: 3000, remaining: 100, minWarning: 10, unit: 'porsi' },
];

const notifications: Notification[] = [];

let orderCounter = 0;

export const getStore = () => ({
  orders,
  orderItems,
  restaurant,
  products,
  ingredients,
  toppings,
  notifications,
  orderCounter,
});

export const addOrder = (order: Order, items: OrderItem[]) => {
  orders.push(order);
  orderItems.push(...items);
  notifications.push({
    id: `notif-${Date.now()}`,
    title: 'Pesanan Baru',
    message: `Pesanan ${order.orderNumber} dari ${order.customerName} masuk!`,
    orderId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  // Notify SSE listeners
  sseListeners.forEach(cb => cb(order));
};

export const updateOrderStatus = (orderId: string, status: Order['status'], declineReason?: string) => {
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
        orderId: order.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
  return order;
};

export const getNextOrderNumber = () => {
  orderCounter++;
  return `#SBK-${String(orderCounter).padStart(3, '0')}`;
};

export const getOrdersByStatus = (status?: string) => {
  if (!status || status === 'all') return orders;
  return orders.filter(o => o.status === status);
};

export const getOrderById = (id: string) => orders.find(o => o.id === id);

export const getOrderItems = (orderId: string) => orderItems.filter(i => i.orderId === orderId);

export const addProduct = (product: Product) => {
  products.push(product);
  return product;
};

export const updateProduct = (id: string, data: Partial<Product>) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  return products[idx];
};

export const deleteProduct = (id: string) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
};

export const updateProductStock = (productId: string, stock: number) => {
  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock = Math.max(0, stock);
    return product;
  }
  return null;
};

export const updateRestaurant = (data: Partial<Restaurant>) => {
  Object.assign(restaurant, data);
  return restaurant;
};

export const addIngredient = (ingredient: Ingredient) => {
  ingredients.push(ingredient);
  return ingredient;
};

export const updateIngredient = (id: string, data: Partial<Ingredient>) => {
  const idx = ingredients.findIndex(i => i.id === id);
  if (idx === -1) return null;
  ingredients[idx] = { ...ingredients[idx], ...data };
  return ingredients[idx];
};

export const deleteIngredient = (id: string) => {
  const idx = ingredients.findIndex(i => i.id === id);
  if (idx === -1) return false;
  ingredients.splice(idx, 1);
  return true;
};

export const deductIngredientStock = (productId: string, quantity: number) => {
  const product = products.find(p => p.id === productId);
  if (!product?.recipe) return;
  for (const ing of product.recipe) {
    const ingredient = ingredients.find(i => i.id === ing.ingredientId);
    if (ingredient) {
      ingredient.remaining = Math.max(0, ingredient.remaining - ing.quantity * quantity);
    }
  }
};

// SSE listeners for real-time new order notification
type SSECallback = (order: Order) => void;
const sseListeners: SSECallback[] = [];

export const addSSEListener = (cb: SSECallback) => {
  sseListeners.push(cb);
  return () => {
    const idx = sseListeners.indexOf(cb);
    if (idx !== -1) sseListeners.splice(idx, 1);
  };
};

export const addTopping = (topping: Topping) => {
  toppings.push(topping);
  return topping;
};

export const updateTopping = (id: string, data: Partial<Topping>) => {
  const idx = toppings.findIndex(t => t.id === id);
  if (idx === -1) return null;
  toppings[idx] = { ...toppings[idx], ...data };
  return toppings[idx];
};

export const deleteTopping = (id: string) => {
  const idx = toppings.findIndex(t => t.id === id);
  if (idx === -1) return false;
  toppings.splice(idx, 1);
  return true;
};

export const getDashboardSummary = () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const todayOrders = orders.filter(o => o.createdAt >= todayStart);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const completedToday = todayOrders.filter(o => o.status === 'COMPLETED').length;
  const totalRevenueToday = todayOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return {
    totalOrdersToday: todayOrders.length,
    pendingOrders,
    processingOrders,
    completedToday,
    totalRevenueToday,
    totalOrdersAll: orders.length,
  };
};

export const getNotifications = () => notifications;

export const markNotificationRead = (id: string) => {
  const notif = notifications.find(n => n.id === id);
  if (notif) notif.isRead = true;
};
