import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const data: any = { ...body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    const { variants, recipe, ...productData } = data;

    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        productData.variants = {
          create: variants.map((v: any) => ({
            name: v.name,
            price: parseFloat(v.price) || 0
          }))
        };
      }
    }

    if (recipe !== undefined) {
      await prisma.productRecipeIngredient.deleteMany({ where: { productId: id } });
      if (recipe.length > 0) {
        productData.recipe = {
          create: recipe.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity) || 1
          }))
        };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        variants: true,
        recipe: { include: { ingredient: true } }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Invalid request or product not found' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      return NextResponse.json({ 
        message: 'Produk tidak bisa dihapus karena masih ada order yang menggunakannya' 
      }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Product not found or internal server error' }, { status: 500 });
  }
}
