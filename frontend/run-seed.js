const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Seeding FULL menu from photo ===');

  // 1. Categories
  await prisma.category.upsert({
    where: { id: 'seblak' },
    update: { name: 'Seblak' },
    create: { id: 'seblak', name: 'Seblak' }
  });
  await prisma.category.upsert({
    where: { id: 'makanan' },
    update: { name: 'Makanan' },
    create: { id: 'makanan', name: 'Makanan' }
  });
  await prisma.category.upsert({
    where: { id: 'minuman' },
    update: { name: 'Minuman' },
    create: { id: 'minuman', name: 'Minuman' }
  });

  // 2. Delete ALL existing products (clean slate)
  console.log('Cleaning existing products...');
  await prisma.productVariant.deleteMany({});
  await prisma.productRecipeIngredient.deleteMany({});
  await prisma.product.deleteMany({});

  // 3. Seblak Mamah Zahwa (main customizable product)
  console.log('Creating Seblak...');
  await prisma.product.create({
    data: {
      id: 'prod-seblak',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak khas dengan bumbu rahasia',
      price: 0,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80',
      categoryId: 'seblak',
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

  // =============================================
  // 4. MAKANAN — Seblak Bebas Toping section
  // =============================================
  console.log('Creating Makanan — Seblak Bebas Toping...');
  const seblakBebasToping = [
    { id: 'prod-cilok',        name: 'Cilok Goang',              price: 10000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-mie-ayam',     name: 'Mie Ayam',                 price: 10000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-mie-ayam-ckr', name: 'Mie Ayam + Ceker',         price: 12000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-mie-bakso',    name: 'Mie Bakso',                price: 13000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-mie-jeletot',  name: 'Mie Jeletot',              price: 10000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-kwetiaw-jlt',  name: 'Kwetiaw Jeletot',          price: 10000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-spatula',      name: 'Spatula / Spaghetti Tulang', price: 10000, desc: 'Seblak Bebas Toping' },
    { id: 'prod-makroni',      name: 'Makroni Basah + Telor',    price: 8000,  desc: 'Seblak Bebas Toping' },
    { id: 'prod-ceker-mercon', name: 'Ceker Mercon',             price: 8000,  desc: 'Seblak Bebas Toping' },
    { id: 'prod-popmie-mini',  name: 'Pop Mie Mini',             price: 5000,  desc: 'Seblak Bebas Toping' },
    { id: 'prod-popmie-besar', name: 'Pop Mie Besar',            price: 7000,  desc: 'Seblak Bebas Toping' },
    { id: 'prod-mie-gelas',    name: 'Mie Gelas Pake Cup',       price: 3000,  desc: 'Seblak Bebas Toping' },
    { id: 'prod-cirawang',     name: 'Cirawang Misdasem',        price: 15000, desc: 'Seblak Bebas Toping' },
  ];

  // =============================================
  // 5. MAKANAN — Cireng Isi section
  // =============================================
  console.log('Creating Makanan — Cireng Isi...');
  const cirengIsi = [
    { id: 'prod-cireng-jando',  name: 'Cireng Isi Jando',        price: 1000, desc: 'Cireng Isi' },
    { id: 'prod-cireng-ati',    name: 'Cireng Isi Ati',          price: 1000, desc: 'Cireng Isi' },
    { id: 'prod-cireng-keju',   name: 'Cireng Isi Keju',         price: 1000, desc: 'Cireng Isi' },
    { id: 'prod-cireng-bs',     name: 'Cireng Isi Bakso + Sosis', price: 1000, desc: 'Cireng Isi' },
  ];

  // =============================================
  // 6. MAKANAN — Cemilan & Lainnya section
  // =============================================
  console.log('Creating Makanan — Cemilan & Lainnya...');
  const cemilanLainnya = [
    { id: 'prod-tahu-jablay',   name: 'Tahu Jablay',              price: 5000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-cibay',         name: 'Cibay',                    price: 2000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-basreng',       name: 'Basreng 1 Porsi',          price: 5000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-cimol',         name: 'Cimol 1 Porsi',            price: 5000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-otakotak',      name: 'Otak-Otak 1 Porsi',        price: 5000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-otakotak-oren', name: 'Otak-Otak Oren',           price: 1000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-otakotak-keju', name: 'Otak-Otak Keju Lumer',     price: 5000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-karedok-bsr',   name: 'Karedok Basreng',          price: 6000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-karedok-oo',    name: 'Karedok Otak-Otak',        price: 6000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-karedok-cimol', name: 'Karedok Cimol',            price: 6000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-citul',         name: 'Citul',                    price: 1000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-sukro',         name: 'Sukro Cikur',              price: 1000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-pilus',         name: 'Pilus',                    price: 1000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-cireng-kuah',   name: 'Cireng Kuah',              price: 10000, desc: 'Cemilan & Lainnya' },
    { id: 'prod-martabak',      name: 'Martabak Telor',           price: 8000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-cireng-lmkt',   name: 'Cireng Lamokot',           price: 7000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-kwetiaw-jntr',  name: 'Kwetiaw Jontor',           price: 10000, desc: 'Cemilan & Lainnya' },
    { id: 'prod-cigor',         name: 'Cigor',                    price: 7000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-pisang-keju',   name: 'Pisang Keju',              price: 7000,  desc: 'Cemilan & Lainnya' },
    { id: 'prod-pisang-kj-ck',  name: 'Pisang Keju Coklat',       price: 10000, desc: 'Cemilan & Lainnya' },
  ];

  const allMakanan = [...seblakBebasToping, ...cirengIsi, ...cemilanLainnya];

  // Food placeholder images (various Unsplash food images)
  const foodImages = [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
  ];

  for (let i = 0; i < allMakanan.length; i++) {
    const item = allMakanan[i];
    const img = foodImages[i % foodImages.length];
    await prisma.product.create({
      data: {
        id: item.id,
        name: item.name,
        description: item.desc,
        price: item.price,
        stock: 100,
        imageUrl: img,
        categoryId: 'makanan',
      }
    });
  }
  console.log(`  Created ${allMakanan.length} makanan items`);

  // =============================================
  // 7. MINUMAN
  // =============================================
  console.log('Creating Minuman...');
  const allMinuman = [
    { id: 'prod-pop-ice',      name: 'Pop Ice',           price: 5000 },
    { id: 'prod-nutrisari',    name: 'Nutrisari',         price: 5000 },
    { id: 'prod-bengbeng',     name: 'Beng-Beng Drink',   price: 6000 },
    { id: 'prod-teh-tarik',    name: 'Teh Tarik',         price: 6000 },
    { id: 'prod-chocolatos',   name: 'Chocolatos',        price: 6000 },
    { id: 'prod-milo',         name: 'Milo',              price: 6000 },
    { id: 'prod-creamy-latte', name: 'Creamy Latte',      price: 6000 },
    { id: 'prod-tea-jus',      name: 'Tea Jus (pakai cup)', price: 3000 },
    { id: 'prod-teh-sisri',    name: 'Teh Sisri',         price: 2000 },
    { id: 'prod-finto',        name: 'Finto',             price: 2000 },
    { id: 'prod-cocorio',      name: 'Cocorio',           price: 2000 },
    { id: 'prod-top-ice',      name: 'Top Ice',           price: 2000 },
    { id: 'prod-marimas',      name: 'Marimas',           price: 2000 },
    { id: 'prod-jasjus',       name: 'Jasjus',            price: 2000 },
  ];

  const drinkImages = [
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
  ];

  for (let i = 0; i < allMinuman.length; i++) {
    const item = allMinuman[i];
    const img = drinkImages[i % drinkImages.length];
    await prisma.product.create({
      data: {
        id: item.id,
        name: item.name,
        description: 'Minuman',
        price: item.price,
        stock: 100,
        imageUrl: img,
        categoryId: 'minuman',
      }
    });
  }
  console.log(`  Created ${allMinuman.length} minuman items`);

  // =============================================
  // 8. Toppings (for Seblak customization)
  // =============================================
  console.log('Creating Toppings...');
  await prisma.topping.deleteMany({});
  const toppings = [
    { name: 'Kerupuk Oren', price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' },
    { name: 'Makaroni', price: 1000, remaining: 100, minWarning: 10, unit: 'porsi' },
    { name: 'Mie Kuning', price: 1500, remaining: 100, minWarning: 10, unit: 'porsi' },
    { name: 'Sosis', price: 2000, remaining: 100, minWarning: 10, unit: 'porsi' },
    { name: 'Ceker', price: 3000, remaining: 100, minWarning: 10, unit: 'porsi' },
  ];
  for (const topping of toppings) {
    await prisma.topping.create({ data: topping });
  }

  // =============================================
  // 9. Restaurant Info
  // =============================================
  await prisma.restaurant.upsert({
    where: { id: 'resto-1' },
    update: {},
    create: {
      id: 'resto-1',
      name: 'Seblak Mamah Zahwa',
      description: 'Seblak terenak se-Bandung Raya',
      address: 'Jl. Contoh No. 123',
      phone: '081234567890',
      logoUrl: '/logo.png'
    }
  });

  // Final count
  const totalProducts = await prisma.product.count();
  const totalToppings = await prisma.topping.count();
  console.log(`\n=== DONE! ===`);
  console.log(`Total products: ${totalProducts}`);
  console.log(`  - 1 Seblak (customizable)`);
  console.log(`  - ${allMakanan.length} Makanan`);
  console.log(`  - ${allMinuman.length} Minuman`);
  console.log(`Total toppings: ${totalToppings}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
