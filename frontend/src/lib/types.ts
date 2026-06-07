export type AdminSession = {
  authenticated: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  logoUrl: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  isActive: boolean;
};

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'DECLINED';

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerWhatsapp?: string;
  notes?: string;
  totalPrice: number;
  paymentProofUrl: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
};
