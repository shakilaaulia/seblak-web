const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/toppingController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(ctrl.getAllToppings));
router.post('/', asyncWrapper(ctrl.createTopping));
router.patch('/:id', asyncWrapper(ctrl.updateTopping));
router.delete('/:id', asyncWrapper(ctrl.deleteTopping));

module.exports = router;
