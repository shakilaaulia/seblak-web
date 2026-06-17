const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertCategory(category) {
  await prisma.category.upsert({
    where: { id: category.id },
    update: category,
    create: category,
  });
}

async function upsertIngredient(ingredient) {
  await prisma.ingredient.upsert({
    where: { id: ingredient.id },
    update: ingredient,
    create: ingredient,
  });
}

async function upsertTopping(topping) {
  await prisma.topping.upsert({
    where: { id: topping.id },
    update: topping,
    create: topping,
  });
}

async function upsertProduct(product) {
  const { variants = [], recipe = [], ...data } = product;
  await prisma.product.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });

  await prisma.productVariant.deleteMany({ where: { productId: data.id } });
  if (variants.length > 0) {
    await prisma.productVariant.createMany({
      data: variants.map((variant, index) => ({
        productId: data.id,
        name: variant.name,
        price: variant.price,
        sortOrder: index,
      })),
    });
  }

  await prisma.productIngredient.deleteMany({ where: { productId: data.id } });
  if (recipe.length > 0) {
    await prisma.productIngredient.createMany({
      data: recipe.map((item) => ({
        productId: data.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      })),
    });
  }
}

async function main() {
  await prisma.restaurantSetting.upsert({
    where: { id: 'rest-1' },
    update: {
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak, makanan, dan minuman rumahan.',
      address: 'Jl. Pedas Manis No. 10, Bandung',
      phone: '6281234567890',
      isOpen: true,
      openHour: '09:00',
      closeHour: '21:00',
      qrisName: 'SEBLAK MAMAH ZAHWA',
    },
    create: {
      id: 'rest-1',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak, makanan, dan minuman rumahan.',
      address: 'Jl. Pedas Manis No. 10, Bandung',
      phone: '6281234567890',
      isOpen: true,
      openHour: '09:00',
      closeHour: '21:00',
      qrisName: 'SEBLAK MAMAH ZAHWA',
    },
  });

  for (const category of [
    { id: 'seblak', name: 'Seblak', sortOrder: 1 },
    { id: 'makanan', name: 'Makanan', sortOrder: 2 },
    { id: 'minuman', name: 'Minuman', sortOrder: 3 },
  ]) {
    await upsertCategory(category);
  }

  for (const ingredient of [
    { id: 'i1', name: 'Mie', remaining: 50, unit: 'bungkus', minWarning: 10 },
    { id: 'i2', name: 'Bakso Sapi', remaining: 30, unit: 'butir', minWarning: 10 },
    { id: 'i3', name: 'Cilok', remaining: 40, unit: 'butir', minWarning: 10 },
    { id: 'i4', name: 'Ayam Suwir', remaining: 20, unit: 'porsi', minWarning: 5 },
    { id: 'i5', name: 'Kerupuk Oren', remaining: 25, unit: 'porsi', minWarning: 5 },
    { id: 'i6', name: 'Cireng', remaining: 30, unit: 'porsi', minWarning: 8 },
    { id: 'i7', name: 'Makaroni', remaining: 20, unit: 'porsi', minWarning: 5 },
    { id: 'i8', name: 'Telur Puyuh', remaining: 40, unit: 'butir', minWarning: 10 },
  ]) {
    await upsertIngredient(ingredient);
  }

  for (const topping of [
    { id: 't1', name: 'Kerupuk', price: 2000, remaining: 20, minWarning: 5, unit: 'porsi' },
    { id: 't2', name: 'Siomay', price: 3000, remaining: 15, minWarning: 5, unit: 'porsi' },
    { id: 't3', name: 'Ceker Ayam', price: 5000, remaining: 10, minWarning: 3, unit: 'porsi' },
    { id: 't4', name: 'Sosis', price: 4000, remaining: 12, minWarning: 4, unit: 'porsi' },
  ]) {
    await upsertTopping(topping);
  }

  for (const product of [
    {
      id: 'seblak-1',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak khas Mamah Zahwa dengan bumbu pedas pilihan',
      price: 0,
      stock: 999,
      imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=400&auto=format&fit=crop',
      categoryId: 'seblak',
      recipe: [
        { ingredientId: 'i1', quantity: 1 },
        { ingredientId: 'i5', quantity: 1 },
      ],
    },
    {
      id: 'm1',
      name: 'Cilok Goang',
      description: 'Cilok dengan kuah pedas segar',
      price: 10000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
      recipe: [{ ingredientId: 'i3', quantity: 5 }],
    },
    {
      id: 'm2',
      name: 'Mie Bakso',
      description: 'Mie basah dengan bakso sapi',
      price: 13000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
      recipe: [
        { ingredientId: 'i1', quantity: 1 },
        { ingredientId: 'i2', quantity: 3 },
      ],
    },
    {
      id: 'm3',
      name: 'Mie Jeletot',
      description: 'Mie pedas jeletot dengan topping ayam suwir',
      price: 10000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
      categoryId: 'makanan',
      recipe: [
        { ingredientId: 'i1', quantity: 1 },
        { ingredientId: 'i4', quantity: 1 },
      ],
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
  ]) {
    await upsertProduct(product);
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
