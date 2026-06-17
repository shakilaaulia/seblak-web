import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim();

    if (!search) {
      return NextResponse.json({ message: 'Parameter pencarian diperlukan' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerWhatsapp: { contains: search, mode: 'insensitive' } },
          { orderNumber: { contains: search, mode: 'insensitive' } }
        ]
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error tracking orders:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
