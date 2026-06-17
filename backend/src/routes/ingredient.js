const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ingredientController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(ctrl.getAllIngredients));
router.post('/', asyncWrapper(ctrl.createIngredient));
router.patch('/:id', asyncWrapper(ctrl.updateIngredient));
router.delete('/:id', asyncWrapper(ctrl.deleteIngredient));

module.exports = router;
