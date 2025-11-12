const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const {
  MSG91_AUTH_KEY,
  MSG91_TEMPLATE_ID,
  MSG91_SENDER_ID = 'INFCLN',
  MSG91_OTP_LENGTH = 6,
} = process.env;

if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
  console.warn(
    '⚠️  MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing. OTP endpoints will fail until these are set.'
  );
}

app.use(cors());
app.use(express.json());

const sanitizePhone = (value = '') => value.replace(/\D/g, '');

const buildMsg91Headers = () => ({
  authkey: MSG91_AUTH_KEY,
  'content-type': 'application/json',
});

app.post('/api/send-otp', async (req, res) => {
  try {
    const digits = sanitizePhone(req.body?.phone);
    if (!digits || digits.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10 digit mobile number.' });
    }

    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: `91${digits}`,
      sender: MSG91_SENDER_ID,
      otp_length: Number(MSG91_OTP_LENGTH) || 6,
    };

    await axios.post('https://api.msg91.com/api/v5/otp', payload, {
      headers: buildMsg91Headers(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('MSG91 send OTP error', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || 'Unable to send OTP right now. Please try again later.';
    res.status(status).json({ message });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const digits = sanitizePhone(req.body?.phone);
    const otp = sanitizePhone(req.body?.otp);

    if (!digits || digits.length < 10 || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required.' });
    }

    const payload = {
      mobile: `91${digits}`,
      otp,
    };

    await axios.post('https://api.msg91.com/api/v5/otp/verify', payload, {
      headers: buildMsg91Headers(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('MSG91 verify OTP error', error?.response?.data || error.message);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'OTP verification failed. Please try again.';
    res.status(status).json({ message });
  }
});

app.listen(PORT, () => {
  console.log(`OTP API server running on http://localhost:${PORT}`);
});
