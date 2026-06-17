const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authGuard } = require('../middleware/authGuard');

router.get('/sum', authGuard, dashboardController.getSummary);

module.exports = router;
