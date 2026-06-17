const app = require('./app');
const prisma = require('./prismaClient');
const { initOrderCounter } = require('./services/db');

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect();
  await initOrderCounter();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start().catch(async (err) => {
  console.error('Failed to start backend:', err);
  await prisma.$disconnect();
  process.exit(1);
});
