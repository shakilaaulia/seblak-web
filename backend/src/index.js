const app = require('./app');
const prisma = require('./prismaClient');
const { initOrderCounter } = require('./services/db');

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect();
  console.log('Connected to Supabase PostgreSQL');

  await initOrderCounter();
  console.log('Order counter initialized');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
