const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/auth', adminController.login);

module.exports = router;
