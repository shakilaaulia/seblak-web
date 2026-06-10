import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, declineReason } = await req.json();

    const validActions = ['approve', 'process', 'ready', 'complete', 'decline'] as const;
    if (!validActions.includes(action)) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    const statusMap: Record<string, 'PROCESSING' | 'READY' | 'COMPLETED' | 'DECLINED'> = {
      approve: 'PROCESSING',
      process: 'PROCESSING',
      ready: 'READY',
      complete: 'COMPLETED',
      decline: 'DECLINED',
    };

    const newStatus = statusMap[action];
    
    const updateData: any = { status: newStatus };
    if (action === 'decline') {
      updateData.declineReason = declineReason || '';
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true }
    });

    if (newStatus === 'READY') {
      await prisma.notification.create({
        data: {
          title: 'Pesanan Siap!',
          message: `Pesanan ${order.orderNumber} siap diambil!`,
          orderId: order.id
        }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ message: 'Invalid request or order not found' }, { status: 400 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
