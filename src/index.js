// src/index.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const prisma = require('./prismaClient');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;

// Create HTTP server & attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  // Socket.io connection handling – join a room per authenticated user
  // Clients should send the JWT token in the handshake auth field: { token: '<jwt>' }
  // Example (client): io("http://localhost:3000", { auth: { token } });

  cors: {
    origin: '*', // TODO: restrict in production
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Join user-specific rooms after handshake
io.on('connection', socket => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.sub) {
        const room = `user_${payload.sub}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      }
    } catch (e) {
      console.warn('Invalid JWT on socket connection');
    }
  }
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Make the io instance available to routes/controllers
app.set('io', io);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
