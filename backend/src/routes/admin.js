const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/auth', adminController.login);
router.get('/verify', adminController.verify);

module.exports = router;
