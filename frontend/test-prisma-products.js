const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Mencoba fetching products dengan relations...');
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        recipe: {
          include: { ingredient: true }
        }
      }
    });
    console.log('✅ BERHASIL FETCH PRODUCTS!');
    console.log(`Jumlah produk: ${products.length}`);
    if (products.length > 0) {
      console.log('Sample produk pertama:', JSON.stringify(products[0], null, 2));
    }
  } catch (error) {
    console.error('❌ GAGAL FETCH PRODUCTS!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
