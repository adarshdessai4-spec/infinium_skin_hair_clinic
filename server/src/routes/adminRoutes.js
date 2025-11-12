const express = require('express');
const { getStats, listUsers } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getStats);
router.get('/users', listUsers);

module.exports = router;
