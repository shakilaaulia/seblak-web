// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const toppingRoutes = require('./routes/topping');
const orderRoutes = require('./routes/order');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const { authGuard } = require('./middleware/authGuard');

// Middleware
app.use(cors({ origin: '*', credentials: true })); // TODO: restrict origin in prod
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/orders', authGuard, orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Central error handler
app.use(errorHandler);

module.exports = app;
