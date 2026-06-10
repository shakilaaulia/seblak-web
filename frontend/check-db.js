const { PrismaClient } = require('../backend/node_modules/@prisma/client');

async function main() {
  const oldPrisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:../../backend/prisma/dev.db" 
      }
    }
  });

  try {
    const products = await oldPrisma.product.findMany();
    const categories = await oldPrisma.category.findMany();
    console.log('--- OLD DB ---');
    console.log('Categories:', categories);
    console.log('Products:', products);
  } catch (e) {
    console.error("Error reading old DB:", e);
  } finally {
    await oldPrisma.$disconnect();
  }
}

main();
