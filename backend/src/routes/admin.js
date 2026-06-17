const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const asyncWrapper = require('../middleware/asyncWrapper');

router.post('/auth', asyncWrapper(ctrl.auth));
router.get('/verify', asyncWrapper(ctrl.verify));

module.exports = router;
