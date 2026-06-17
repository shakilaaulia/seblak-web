import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        recipe: {
          include: { ingredient: true }
        }
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, price, stock, imageUrl, categoryId, isActive, variants, recipe } = await req.json();
    let category = null;
    if (categoryId) {
       category = await prisma.category.findUnique({ where: { id: categoryId } });
    }
    if (!category && categoryId) {
       category = await prisma.category.create({ data: { id: categoryId, name: categoryId } });
    } else if (!categoryId) {
       let defaultCat = await prisma.category.findFirst();
       if (!defaultCat) {
          defaultCat = await prisma.category.create({ data: { name: 'Default Category' } });
       }
       category = defaultCat;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl || '',
        categoryId: category.id,
        isActive: isActive !== undefined ? isActive : true,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            name: v.name,
            price: parseFloat(v.price) || 0
          }))
        } : undefined,
        recipe: recipe && recipe.length > 0 ? {
          create: recipe.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity) || 1
          }))
        } : undefined
      },
      include: {
        variants: true,
        recipe: { include: { ingredient: true } }
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
