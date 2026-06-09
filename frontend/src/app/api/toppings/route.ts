import { NextResponse } from 'next/server';
import { getStore, addTopping } from '@/lib/store';
import type { Topping } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getStore().toppings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTopping: Topping = {
      id: `t${Date.now()}`,
      name: body.name,
      price: body.price,
      remaining: body.remaining ?? 10,
      minWarning: body.minWarning ?? 3,
      unit: body.unit ?? 'porsi',
    };
    addTopping(newTopping);
    return NextResponse.json(newTopping, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
