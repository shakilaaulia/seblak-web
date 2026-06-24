const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getDashboardSummary } = require('../services/db');

router.get('/sum', requireAdmin, asyncWrapper(async (_req, res) => {
  const summary = await getDashboardSummary();
  res.json(summary);
}));

module.exports = router;
