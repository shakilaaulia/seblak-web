// src/routes/topping.js
const express = require('express');
const router = express.Router();
const { getAllToppings } = require('../controllers/toppingController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(getAllToppings));

module.exports = router;
