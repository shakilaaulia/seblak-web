require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const productRoutes = require('./routes/product');
const ingredientRoutes = require('./routes/ingredient');
const toppingRoutes = require('./routes/topping');
const restaurantRoutes = require('./routes/restaurant');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/products', productRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
