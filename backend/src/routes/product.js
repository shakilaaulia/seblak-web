const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/', asyncWrapper(ctrl.getAllProducts));
router.post('/', asyncWrapper(ctrl.createProduct));
router.patch('/:id', asyncWrapper(ctrl.updateProduct));
router.delete('/:id', asyncWrapper(ctrl.deleteProduct));

module.exports = router;
