const store = require('../dataStore');

function getAllProducts(_req, res) {
  res.json(store.products);
}

function createProduct(req, res) {
  const body = req.body;
  const newProduct = {
    id: `p${Date.now()}`,
    name: body.name,
    description: body.description || '',
    price: body.price,
    stock: body.stock ?? 0,
    imageUrl: body.imageUrl || '',
    categoryId: body.categoryId || '',
    isActive: true,
    variants: body.variants || undefined,
    recipe: body.recipe || undefined,
  };
  store.addProduct(newProduct);
  res.status(201).json(newProduct);
}

function updateProduct(req, res) {
  const product = store.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

function deleteProduct(req, res) {
  const deleted = store.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
