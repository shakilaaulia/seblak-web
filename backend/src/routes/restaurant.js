const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getRestaurant, updateRestaurant } = require('../services/db');

router.get('/', asyncWrapper(async (_req, res) => {
  const setting = await getRestaurant();
  res.json(setting);
}));

router.patch('/', requireAdmin, asyncWrapper(async (req, res) => {
  const updated = await updateRestaurant(req.body);
  res.json(updated);
}));

module.exports = router;
