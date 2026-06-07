import { NextResponse } from 'next/server';
import { getOrdersByStatus, getOrderItems, addOrder, getNextOrderNumber } from '@/lib/store';
import type { Order, OrderItem } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search')?.toLowerCase().trim();

  let orders = getOrdersByStatus(status);

  if (search) {
    orders = orders.filter(o =>
      o.customerName.toLowerCase().includes(search) ||
      (o.customerWhatsapp || '').toLowerCase().includes(search)
    );
  }

  const result = orders.map(o => ({
    ...o,
    items: getOrderItems(o.id),
  }));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerWhatsapp, notes, totalPrice, paymentProofUrl, items } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Data pesanan tidak lengkap' }, { status: 400 });
    }

    const id = `ord-${Date.now()}`;
    const orderNumber = getNextOrderNumber();
    const now = new Date().toISOString();

    const order: Order = {
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

    const orderItems: OrderItem[] = items.map((item: any, i: number) => ({
      id: `oi-${id}-${i}`,
      orderId: id,
      productId: item.productId || '',
      productName: item.productName || item.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      subtotal: (item.price || 0) * (item.quantity || 1),
    }));

    addOrder(order, orderItems);

    return NextResponse.json({
      ...order,
      items: orderItems,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
