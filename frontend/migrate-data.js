require('../backend/node_modules/dotenv').config({ path: '.env' });
const { PrismaClient: NewPrismaClient } = require('@prisma/client');
const { PrismaClient: OldPrismaClient } = require('../backend/node_modules/@prisma/client');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL tidak ditemukan! Pastikan kamu sudah membuat file .env dan mengisinya.");
    process.exit(1);
  }

  const newPrisma = new NewPrismaClient();
  const oldPrisma = new OldPrismaClient({
    datasources: {
      db: {
        url: "file:../../backend/prisma/dev.db" 
      }
    }
  });

  console.log("🚀 Memulai migrasi data dari SQLite (Lama) ke Supabase (Baru)...");

  try {
    // 1. Migrate Categories
    console.log("Migrasi Categories...");
    const categories = await oldPrisma.category.findMany();
    for (const cat of categories) {
      await newPrisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: cat,
      });
    }

    // 2. Migrate Ingredients
    console.log("Migrasi Ingredients...");
    const ingredients = await oldPrisma.ingredient.findMany();
    for (const ing of ingredients) {
      await newPrisma.ingredient.upsert({
        where: { id: ing.id },
        update: {},
        create: ing,
      });
    }

    // 3. Migrate Products
    console.log("Migrasi Products...");
    const products = await oldPrisma.product.findMany();
    for (const prod of products) {
      await newPrisma.product.upsert({
        where: { id: prod.id },
        update: {},
        create: prod,
      });
    }

    // 4. Migrate Product Variants
    console.log("Migrasi Product Variants...");
    const variants = await oldPrisma.productVariant.findMany();
    for (const variant of variants) {
      await newPrisma.productVariant.upsert({
        where: { id: variant.id },
        update: {},
        create: variant,
      });
    }

    // 5. Migrate Product Recipe Ingredients
    console.log("Migrasi Product Recipe Ingredients...");
    const recipes = await oldPrisma.productRecipeIngredient.findMany();
    for (const recipe of recipes) {
      await newPrisma.productRecipeIngredient.upsert({
        where: { id: recipe.id },
        update: {},
        create: recipe,
      });
    }

    // 6. Migrate Restaurant Info
    console.log("Migrasi Restaurant Profile...");
    const restaurants = await oldPrisma.restaurant.findMany();
    for (const rest of restaurants) {
      await newPrisma.restaurant.upsert({
        where: { id: rest.id },
        update: {},
        create: rest,
      });
    }

    console.log("✅ Migrasi Data Selesai! Cek website kamu sekarang.");
  } catch (error) {
    console.error("❌ Gagal migrasi data:", error);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

main();
