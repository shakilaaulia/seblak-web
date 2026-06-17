const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../services/db');

const router = express.Router();

router.get('/', asyncWrapper(async (_req, res) => {
  res.json(await getAllProducts());
}));

router.post('/', requireAdmin, asyncWrapper(async (req, res) => {
  if (!req.body.name || req.body.price === undefined) {
    return res.status(400).json({ message: 'Name and price required' });
  }
  const product = await createProduct(req.body);
  res.status(201).json(product);
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  res.json(await updateProduct(req.params.id, req.body));
}));

router.delete('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  await deleteProduct(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
