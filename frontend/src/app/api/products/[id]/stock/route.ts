import { NextResponse } from 'next/server';
import { updateProductStock } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { stock } = await req.json();
    const updated = updateProductStock(id, stock);
    if (!updated) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
