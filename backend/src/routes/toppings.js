const express = require('express');
const router = express.Router();
const toppingController = require('../controllers/toppingController');

router.get('/', toppingController.getToppings);
router.get('/:id', toppingController.getToppingById);
router.post('/', toppingController.createTopping);
router.put('/:id', toppingController.updateTopping);
router.delete('/:id', toppingController.deleteTopping);

module.exports = router;
