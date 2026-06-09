import { NextResponse } from 'next/server';
import { getStore, addIngredient } from '@/lib/store';
import type { Ingredient } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getStore().ingredients);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newIngredient: Ingredient = {
      id: `i${Date.now()}`,
      name: body.name,
      remaining: body.remaining ?? 10,
      unit: body.unit ?? 'porsi',
      minWarning: body.minWarning ?? 3,
    };
    addIngredient(newIngredient);
    return NextResponse.json(newIngredient, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
