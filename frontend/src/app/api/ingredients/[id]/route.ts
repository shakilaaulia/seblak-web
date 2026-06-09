import { NextResponse } from 'next/server';
import { updateIngredient, deleteIngredient } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const ingredient = updateIngredient(id, body);
    if (!ingredient) {
      return NextResponse.json({ message: 'Ingredient not found' }, { status: 404 });
    }
    return NextResponse.json(ingredient);
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deleteIngredient(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Ingredient not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Ingredient deleted' });
}
