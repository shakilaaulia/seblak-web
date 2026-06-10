import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany();
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, remaining, unit, minWarning } = await req.json();
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        remaining: parseFloat(remaining) || 0,
        unit: unit || 'pcs',
        minWarning: parseFloat(minWarning) || 0,
      }
    });
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
