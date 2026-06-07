import { NextResponse } from 'next/server';
import { getStore, updateProductStock } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getStore().products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = {
      id: `p${Date.now()}`,
      name: body.name,
      description: body.description || '',
      price: body.price,
      stock: body.stock ?? 0,
      imageUrl: body.imageUrl || '',
      categoryId: body.categoryId || '',
      isActive: true,
    };
    getStore().products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
