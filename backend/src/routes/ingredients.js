const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../services/db');

router.get('/', requireAdmin, asyncWrapper(async (_req, res) => {
  const ingredients = await getAllIngredients();
  res.json(ingredients);
}));

router.post('/', requireAdmin, asyncWrapper(async (req, res) => {
  const { name, remaining, unit, minWarning } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const ingredient = await createIngredient({
    name,
    remaining: remaining ?? 0,
    unit: unit || 'pcs',
    minWarning: minWarning ?? 5,
  });
  res.status(201).json(ingredient);
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  const updated = await updateIngredient(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
}));

router.delete('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  await deleteIngredient(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
