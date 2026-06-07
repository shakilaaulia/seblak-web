import { Restaurant, Product, Order, OrderItem, Notification } from './types';

let orders: Order[] = [];

let orderItems: OrderItem[] = [];

const restaurant: Restaurant = {
  id: 'rest-1',
  name: 'Seblak Mamah Zahwa',
  description: '',
  address: '',
  phone: '',
  logoUrl: '',
};

const products: Product[] = [];

let notifications: Notification[] = [];

let orderCounter = 0;

export const getStore = () => ({
  orders,
  orderItems,
  restaurant,
  products,
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
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();

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
