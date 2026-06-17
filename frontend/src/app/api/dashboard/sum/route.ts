import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'true') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalOrdersAll, totalOrdersToday, pendingOrders, processingOrders, completedToday, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'COMPLETED', createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
      }),
    ]);

    return NextResponse.json({
      totalOrdersToday,
      pendingOrders,
      processingOrders,
      completedToday,
      totalRevenueToday: revenueResult._sum.totalPrice || 0,
      totalOrdersAll,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
