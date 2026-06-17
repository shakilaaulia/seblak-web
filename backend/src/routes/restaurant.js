const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/restaurantController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(ctrl.getRestaurant));
router.patch('/', asyncWrapper(ctrl.updateRestaurant));

module.exports = router;
