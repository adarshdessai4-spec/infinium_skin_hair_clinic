const express = require('express');
const { getDashboard } = require('../controllers/userController');

const router = express.Router();

router.get('/dashboard', getDashboard);

module.exports = router;
