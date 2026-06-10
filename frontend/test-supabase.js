const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Mencoba menyambung ke database Supabase...');
  try {
    // Melakukan query ringan untuk test koneksi
    const categories = await prisma.category.findMany();
    const productCount = await prisma.product.count();
    
    console.log('\n======================================');
    console.log('✅ KONEKSI KE SUPABASE BERHASIL!');
    console.log('======================================');
    console.log(`Jumlah Kategori di DB : ${categories.length}`);
    console.log(`Jumlah Produk di DB   : ${productCount}`);
    console.log('Daftar Kategori       :', categories.map(c => c.name).join(', '));
    console.log('======================================\n');
  } catch (error) {
    console.log('\n======================================');
    console.log('❌ KONEKSI KE SUPABASE GAGAL!');
    console.log('======================================');
    console.log('Penyebab Error:', error.message);
    console.log('======================================\n');
  } finally {
    await prisma.$disconnect();
  }
}

main();
