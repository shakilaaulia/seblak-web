const store = require('../dataStore');

function getAllIngredients(_req, res) {
  res.json(store.ingredients);
}

function createIngredient(req, res) {
  const body = req.body;
  const newIngredient = {
    id: `i${Date.now()}`,
    name: body.name,
    remaining: body.remaining ?? 10,
    unit: body.unit ?? 'porsi',
    minWarning: body.minWarning ?? 3,
  };
  store.addIngredient(newIngredient);
  res.status(201).json(newIngredient);
}

function updateIngredient(req, res) {
  const ingredient = store.updateIngredient(req.params.id, req.body);
  if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
  res.json(ingredient);
}

function deleteIngredient(req, res) {
  const deleted = store.deleteIngredient(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Ingredient not found' });
  res.json({ message: 'Ingredient deleted' });
}

module.exports = { getAllIngredients, createIngredient, updateIngredient, deleteIngredient };
