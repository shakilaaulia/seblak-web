const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getAllToppings, createTopping, updateTopping, deleteTopping } = require('../services/db');

const router = express.Router();

router.get('/', asyncWrapper(async (_req, res) => {
  res.json(await getAllToppings());
}));

router.post('/', requireAdmin, asyncWrapper(async (req, res) => {
  if (!req.body.name || req.body.price === undefined) {
    return res.status(400).json({ message: 'Name and price required' });
  }
  res.status(201).json(await createTopping(req.body));
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  res.json(await updateTopping(req.params.id, req.body));
}));

router.delete('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  await deleteTopping(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
