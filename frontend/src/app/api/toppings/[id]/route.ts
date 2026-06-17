import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, price, remaining, minWarning, unit } = await req.json();
    
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (remaining !== undefined) data.remaining = parseFloat(remaining);
    if (minWarning !== undefined) data.minWarning = parseFloat(minWarning);
    if (unit !== undefined) data.unit = unit;

    const topping = await prisma.topping.update({
      where: { id },
      data
    });
    
    return NextResponse.json(topping);
  } catch (error) {
    console.error('Error updating topping:', error);
    return NextResponse.json({ message: 'Invalid request or topping not found' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.topping.delete({ where: { id } });
    return NextResponse.json({ message: 'Topping deleted' });
  } catch (error) {
    console.error('Error deleting topping:', error);
    return NextResponse.json({ message: 'Topping not found or internal server error' }, { status: 500 });
  }
}
