import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (id === 'mark-all') {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ message: 'All marked as read' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
