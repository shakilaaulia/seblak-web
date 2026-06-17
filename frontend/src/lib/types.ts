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
  isOpen: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type ProductVariant = {
  name: string;
  price: number;
};

export type ProductRecipeIngredient = {
  ingredientId: string;
  name: string;
  quantity: number;
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
  variants?: ProductVariant[];
  recipe?: ProductRecipeIngredient[];
};

export type Ingredient = {
  id: string;
  name: string;
  remaining: number;
  unit: string;
  minWarning: number;
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
  declineReason?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  customization?: {
    spiciness: string;
    soup: string;
    flavors: string[];
    toppings: { id?: string; name: string; price?: number; quantity: number }[];
    notes: string;
  };
  selectedVariants?: { name: string; price: number; quantity: number }[];
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  remaining: number;
  minWarning: number;
  unit: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
};
