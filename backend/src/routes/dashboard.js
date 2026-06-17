const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.get('/sum', asyncWrapper(ctrl.getSummary));

module.exports = router;
