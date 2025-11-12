const express = require('express');
const { createPlanPaymentLink } = require('../controllers/paymentController');

const router = express.Router();

router.post('/plan-link', createPlanPaymentLink);

module.exports = router;
