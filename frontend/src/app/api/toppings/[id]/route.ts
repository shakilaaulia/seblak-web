import { NextResponse } from 'next/server';
import { updateTopping, deleteTopping as deleteToppingStore } from '@/lib/store';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const topping = updateTopping(id, body);
    if (!topping) {
      return NextResponse.json({ message: 'Topping not found' }, { status: 404 });
    }
    return NextResponse.json(topping);
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deleteToppingStore(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Topping not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Topping deleted' });
}
