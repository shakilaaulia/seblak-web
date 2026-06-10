// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const restaurantRoutes = require('./routes/restaurant');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const ingredientRoutes = require('./routes/ingredients');
const toppingRoutes = require('./routes/toppings');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true })); // TODO: restrict origin in prod
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/toppings', toppingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Central error handler
app.use(errorHandler);

module.exports = app;
