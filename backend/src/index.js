const http = require('http');
const app = require('./app');
const prisma = require('./prismaClient');
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
