import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Category Seblak
  const catSeblak = await prisma.category.create({
    data: { id: 'cat-seblak', name: 'Seblak' }
  });

  // Create Category Makanan
  const catMakanan = await prisma.category.create({
    data: { id: 'cat-makanan', name: 'Makanan' }
  });

  // Create Category Minuman
  const catMinuman = await prisma.category.create({
    data: { id: 'cat-minuman', name: 'Minuman' }
  });

  // 1. Seblak Mamah Zahwa
  await prisma.product.create({
    data: {
      id: 'prod-seblak',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak khas dengan bumbu rahasia',
      price: 0,
      stock: 100,
      imageUrl: '/placeholder-seblak.jpg',
      categoryId: catSeblak.id,
      variants: {
        create: [
          { name: 'Original', price: 0 },
          { name: 'Pedas Sedikit', price: 0 },
          { name: 'Sedang', price: 0 },
          { name: 'Pedas', price: 0 },
        ]
      }
    }
  });

  // 2. Makanan
  await prisma.product.create({
    data: {
      id: 'prod-cilok',
      name: 'Cilok Goang',
      description: 'Cilok dengan kuah pedas gurih',
      price: 10000,
      stock: 50,
      imageUrl: '/placeholder-cilok.jpg',
      categoryId: catMakanan.id,
    }
  });

  await prisma.product.create({
    data: {
      id: 'prod-bakso',
      name: 'Mie Bakso',
      description: 'Mie bakso sapi asli',
      price: 13000,
      stock: 50,
      imageUrl: '/placeholder-bakso.jpg',
      categoryId: catMakanan.id,
    }
  });

  // 3. Minuman
  await prisma.product.create({
    data: {
      id: 'prod-nutrisari',
      name: 'Nutrisari',
      description: 'Es Nutrisari segar',
      price: 5000,
      stock: 100,
      imageUrl: '/placeholder-drink.jpg',
      categoryId: catMinuman.id,
    }
  });

  // Toppings
  await prisma.topping.create({ data: { name: 'Kerupuk Oren', price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' } });
  await prisma.topping.create({ data: { name: 'Makaroni', price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' } });
  await prisma.topping.create({ data: { name: 'Mie Kuning', price: 1500, remaining: 100, minWarning: 10, unit: 'porsi' } });
  await prisma.topping.create({ data: { name: 'Sosis', price: 2000, remaining: 100, minWarning: 10, unit: 'porsi' } });
  await prisma.topping.create({ data: { name: 'Ceker', price: 3000, remaining: 100, minWarning: 10, unit: 'porsi' } });

  // Restaurant Info
  await prisma.restaurant.create({
    data: {
      id: 'resto-1',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak terenak se-Bandung Raya',
      address: 'Jl. Contoh No. 123',
      phone: '081234567890',
      logoUrl: '/logo.png'
    }
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
