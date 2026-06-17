const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} = require('../services/db');

router.get('/', asyncWrapper(async (_req, res) => {
  const products = await getAllProducts();
  res.json(products);
}));

router.post('/', requireAdmin, asyncWrapper(async (req, res) => {
  const { name, price, description, imageUrl, categoryId, variants, recipe } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price required' });
  }
  const product = await createProduct({
    name,
    price,
    description: description || '',
    imageUrl: imageUrl || '',
    categoryId: categoryId || 'makanan',
    isActive: true,
    stock: req.body.stock ?? 0,
    variants: variants || undefined,
    recipe: recipe || undefined,
  });
  res.status(201).json(product);
}));

router.patch('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  const updated = await updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
}));

router.delete('/:id', requireAdmin, asyncWrapper(async (req, res) => {
  await deleteProduct(req.params.id);
  res.json({ success: true });
}));

router.patch('/:id/stock', requireAdmin, asyncWrapper(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined) return res.status(400).json({ message: 'Stock required' });
  const updated = await updateProductStock(req.params.id, stock);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
}));

module.exports = router;
