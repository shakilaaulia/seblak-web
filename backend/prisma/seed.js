const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Upsert restaurant setting
  await prisma.restaurantSetting.upsert({
    where: { id: 'rest-1' },
    update: {},
    create: {
      id: 'rest-1',
      name: 'Seblak Mamah Zahwa',
      address: 'Jl. Pedas Manis No. 10, Bandung',
      phone: '6281234567890',
      isOpen: true,
    },
  });

  // Seed ingredients
  const ingredientData = [
    { id: 'i1', name: 'Mie', remaining: 50, unit: 'bungkus', minWarning: 10 },
    { id: 'i2', name: 'Bakso Sapi', remaining: 30, unit: 'butir', minWarning: 10 },
    { id: 'i3', name: 'Cilok', remaining: 40, unit: 'butir', minWarning: 10 },
    { id: 'i4', name: 'Ayam Suwir', remaining: 20, unit: 'porsi', minWarning: 5 },
    { id: 'i5', name: 'Kerupuk Oren', remaining: 25, unit: 'porsi', minWarning: 5 },
    { id: 'i6', name: 'Cireng', remaining: 30, unit: 'porsi', minWarning: 8 },
    { id: 'i7', name: 'Makaroni', remaining: 20, unit: 'porsi', minWarning: 5 },
    { id: 'i8', name: 'Telur Puyuh', remaining: 40, unit: 'butir', minWarning: 10 },
  ];
  for (const ing of ingredientData) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: ing,
      create: ing,
    });
  }

  // Seed toppings
  const toppingData = [
    { id: 't1', name: 'Kerupuk', price: 2000, remaining: 20, minWarning: 5, unit: 'porsi' },
    { id: 't2', name: 'Siomay', price: 3000, remaining: 15, minWarning: 5, unit: 'porsi' },
    { id: 't3', name: 'Ceker Ayam', price: 5000, remaining: 10, minWarning: 3, unit: 'porsi' },
    { id: 't4', name: 'Sosis', price: 4000, remaining: 12, minWarning: 4, unit: 'porsi' },
  ];
  for (const top of toppingData) {
    await prisma.topping.upsert({
      where: { id: top.id },
      update: top,
      create: top,
    });
  }

  // Seed products
  const productData = [
    {
      id: 'seblak-1',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak khas Mamah Zahwa dengan bumbu pedas pilihan',
      price: 0,
      stock: 999,
      imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=400&auto=format&fit=crop',
      categoryId: 'seblak',
    },
    {
      id: 'm1',
      name: 'Cilok Goang',
      description: 'Cilok dengan kuah pedas segar',
      price: 10000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
    },
    {
      id: 'm2',
      name: 'Mie Bakso',
      description: 'Mie basah dengan bakso sapi',
      price: 13000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
    },
    {
      id: 'm3',
      name: 'Mie Jeletot',
      description: 'Mie pedas jeletot dengan topping ayam suwir',
      price: 10000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
    },
    {
      id: 'd1',
      name: 'Pop Ice',
      description: 'Minuman bubuk pop ice dengan pilihan varian rasa',
      price: 0,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop',
      categoryId: 'minuman',
      variants: [
        { name: 'Coklat', price: 5000 },
        { name: 'Vanilla', price: 5000 },
        { name: 'Stroberi', price: 5000 },
        { name: 'Mangga', price: 5000 },
      ],
    },
    {
      id: 'd2',
      name: 'Nutrisari',
      description: 'Minuman bubuk jeruk segar',
      price: 5000,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop',
      categoryId: 'minuman',
    },
    {
      id: 'd3',
      name: 'Beng-beng Drink',
      description: 'Minuman coklat beng-beng',
      price: 6000,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=400&auto=format&fit=crop',
      categoryId: 'minuman',
    },
  ];
  for (const prod of productData) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
