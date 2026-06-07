import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const products = getStore().products;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    products[idx] = { ...products[idx], ...body };
    return NextResponse.json(products[idx]);
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = getStore().products;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  products.splice(idx, 1);
  return NextResponse.json({ message: 'Product deleted' });
}
