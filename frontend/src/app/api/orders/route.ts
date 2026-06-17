import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateQueueNumber } from '@/lib/queue';
import { emitNewOrder } from '@/lib/sse';
import type { OrderItem } from '@/lib/types';

type OrderInputItem = {
  productId?: string;
  productName?: string;
  name?: string;
  quantity?: number;
  price?: number;
  customization?: OrderItem['customization'];
  selectedVariants?: OrderItem['selectedVariants'];
};

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'true') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search')?.toLowerCase().trim();

    let where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerWhatsapp: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerWhatsapp, notes, totalPrice, paymentProofUrl, items } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Data pesanan tidak lengkap' }, { status: 400 });
    }

    const orderNumber = await generateQueueNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerWhatsapp: customerWhatsapp || '',
        notes: notes || '',
        totalPrice: parseFloat(totalPrice) || 0,
        paymentProofUrl: paymentProofUrl || '',
        status: 'PENDING',
        items: {
          create: items.map((item: OrderInputItem) => ({
            productId: item.productId || '',
            productName: item.productName || item.name || '',
            quantity: parseInt(item.quantity as any, 10) || 1,
            price: parseFloat(item.price as any) || 0,
            subtotal: (parseFloat(item.price as any) || 0) * (parseInt(item.quantity as any, 10) || 1),
            customization: item.customization ? JSON.stringify(item.customization) : null,
            selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null
          }))
        }
      },
      include: { items: true }
    });

    await prisma.notification.create({
      data: {
        title: 'Pesanan Baru',
        message: `Pesanan ${order.orderNumber} dari ${order.customerName} masuk!`,
        orderId: order.id
      }
    });

    // Notify SSE stream safely
    try {
      emitNewOrder(order);
    } catch (sseErr) {
      console.warn('SSE notification failed, order created anyway:', sseErr);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
