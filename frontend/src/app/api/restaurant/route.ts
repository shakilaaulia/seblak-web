import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Seblak Mamah Zahwa',
          description: '',
          address: '',
          phone: '',
          logoUrl: ''
        }
      });
    }
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { name, description, address, phone, logoUrl } = await req.json();
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;

    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Seblak Mamah Zahwa',
          description: '',
          address: '',
          phone: '',
          logoUrl: ''
        }
      });
    }
    
    restaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data
    });
    
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
