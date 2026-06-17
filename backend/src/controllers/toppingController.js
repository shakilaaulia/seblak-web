const store = require('../dataStore');

function getAllToppings(_req, res) {
  res.json(store.toppings);
}

function createTopping(req, res) {
  const body = req.body;
  const newTopping = {
    id: `t${Date.now()}`,
    name: body.name,
    price: body.price,
    remaining: body.remaining ?? 10,
    minWarning: body.minWarning ?? 3,
    unit: body.unit ?? 'porsi',
  };
  store.addTopping(newTopping);
  res.status(201).json(newTopping);
}

function updateTopping(req, res) {
  const topping = store.updateTopping(req.params.id, req.body);
  if (!topping) return res.status(404).json({ message: 'Topping not found' });
  res.json(topping);
}

function deleteTopping(req, res) {
  const deleted = store.deleteTopping(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Topping not found' });
  res.json({ message: 'Topping deleted' });
}

module.exports = { getAllToppings, createTopping, updateTopping, deleteTopping };
