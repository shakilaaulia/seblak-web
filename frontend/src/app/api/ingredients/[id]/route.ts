import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, remaining, unit, minWarning } = await req.json();
    
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (remaining !== undefined) data.remaining = parseFloat(remaining);
    if (unit !== undefined) data.unit = unit;
    if (minWarning !== undefined) data.minWarning = parseFloat(minWarning);

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data
    });
    
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ message: 'Invalid request or ingredient not found' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.ingredient.delete({ where: { id } });
    return NextResponse.json({ message: 'Ingredient deleted' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ message: 'Ingredient not found or internal server error' }, { status: 500 });
  }
}
