import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById, getOrderItems } from '@/lib/store';

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
    const updated = updateOrderStatus(id, newStatus, declineReason);

    if (!updated) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...updated,
      items: getOrderItems(updated.id),
    });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({
    ...order,
    items: getOrderItems(order.id),
  });
}
