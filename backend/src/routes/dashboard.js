const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { getDashboardSummary } = require('../services/db');

router.get('/sum', asyncWrapper(async (_req, res) => {
  const summary = await getDashboardSummary();
  res.json(summary);
}));

module.exports = router;
