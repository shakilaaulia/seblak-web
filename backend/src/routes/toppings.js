const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  getAllToppings,
  createTopping,
  updateTopping,
  deleteTopping,
} = require('../services/db');

router.get('/', asyncWrapper(async (_req, res) => {
  const toppings = await getAllToppings();
  res.json(toppings);
}));

router.post('/', asyncWrapper(async (req, res) => {
  const { name, price, remaining, minWarning, unit } = req.body;
  if (!name || price === undefined) return res.status(400).json({ message: 'Name and price required' });
  const topping = await createTopping({
    name,
    price,
    remaining: remaining ?? 0,
    minWarning: minWarning ?? 5,
    unit: unit || 'porsi',
  });
  res.status(201).json(topping);
}));

router.patch('/:id', asyncWrapper(async (req, res) => {
  const updated = await updateTopping(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
}));

router.delete('/:id', asyncWrapper(async (req, res) => {
  await deleteTopping(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
