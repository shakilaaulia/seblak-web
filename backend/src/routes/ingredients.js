const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getAllIngredients, createIngredient, updateIngredient, deleteIngredient } = require('../services/db');

const router = express.Router();

router.get('/', requireAdmin, asyncWrapper(async (_req, res) => {
  res.json(await getAllIngredients());
}));

router.post('/', requireAdmin, asyncWrapper(async (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: 'Name required' });
  res.status(201).json(await createIngredient(req.body));
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  res.json(await updateIngredient(req.params.id, req.body));
}));

router.delete('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  await deleteIngredient(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
