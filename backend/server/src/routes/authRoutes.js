const express = require('express');
const {
  sendOtp,
  verifyOtp,
  getGoogleAuthUrl,
  handleGoogleCallback,
} = require('../controllers/authController');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/auth/google/url', getGoogleAuthUrl);
router.all('/auth/google/callback', handleGoogleCallback);

module.exports = router;
