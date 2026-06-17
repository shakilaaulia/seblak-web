const express = require('express');
const asyncWrapper = require('../middleware/asyncWrapper');
const { requireAdmin } = require('../middleware/requireAdmin');
const { getDashboardSummary } = require('../services/db');

const router = express.Router();

router.get('/sum', requireAdmin, asyncWrapper(async (_req, res) => {
  res.json(await getDashboardSummary());
}));

module.exports = router;
