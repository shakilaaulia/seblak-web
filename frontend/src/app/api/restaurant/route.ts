import { NextResponse } from 'next/server';
import { getStore, updateRestaurant } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getStore().restaurant);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const updated = updateRestaurant(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
