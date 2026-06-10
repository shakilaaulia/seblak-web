const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

router.get('/', restaurantController.getRestaurant);
router.patch('/', restaurantController.updateRestaurant);

module.exports = router;
