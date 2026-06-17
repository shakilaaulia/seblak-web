const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getRestaurant, updateRestaurant } = require('../services/db');

const router = express.Router();

router.get('/', asyncWrapper(async (_req, res) => {
  res.json(await getRestaurant());
}));

router.patch('/', requireAdmin, asyncWrapper(async (req, res) => {
  res.json(await updateRestaurant(req.body));
}));

module.exports = router;
