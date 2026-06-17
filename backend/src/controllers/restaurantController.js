const store = require('../dataStore');

function getRestaurant(_req, res) {
  res.json(store.restaurant);
}

function updateRestaurant(req, res) {
  const updated = store.updateRestaurant(req.body);
  res.json(updated);
}

module.exports = { getRestaurant, updateRestaurant };
