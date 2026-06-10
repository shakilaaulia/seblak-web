import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const toppings = await prisma.topping.findMany();
    return NextResponse.json(toppings);
  } catch (error) {
    console.error('Error fetching toppings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, price, remaining, minWarning, unit } = await req.json();
    const topping = await prisma.topping.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        remaining: parseFloat(remaining) || 0,
        minWarning: parseFloat(minWarning) || 0,
        unit: unit || 'porsi',
      }
    });
    return NextResponse.json(topping, { status: 201 });
  } catch (error) {
    console.error('Error creating topping:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
