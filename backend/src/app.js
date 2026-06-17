require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const ingredientRoutes = require('./routes/ingredients');
const toppingRoutes = require('./routes/toppings');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const restaurantRoutes = require('./routes/restaurant');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
