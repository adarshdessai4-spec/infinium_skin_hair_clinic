const axios = require('axios');
const { google } = require('googleapis');

const {
  MSG91_AUTH_KEY,
  MSG91_TEMPLATE_ID,
  MSG91_SENDER_ID = 'INFCLN',
  MSG91_OTP_LENGTH = 6,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI,
} = process.env;

if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
  console.warn(
    '⚠️  MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing. OTP endpoints will fail until these are set.'
  );
}

const sanitizePhone = (value = '') => value.replace(/\D/g, '');

const buildMsg91Headers = () => ({
  authkey: MSG91_AUTH_KEY,
  'content-type': 'application/json',
});

const getGoogleClient = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return null;
  }

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

exports.sendOtp = async (req, res) => {
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
};

exports.verifyOtp = async (req, res) => {
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
};

exports.getGoogleAuthUrl = (req, res) => {
  const client = getGoogleClient();
  if (!client) {
    return res.status(500).json({ message: 'Google login is not configured yet.' });
  }

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

  res.json({ url });
};

exports.handleGoogleCallback = async (req, res) => {
  console.log('hit google callback', req.query);
  const client = getGoogleClient();
  if (!client) {
    return res.status(500).send('Google login is not configured yet.');
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();
    const payload = {
      source: 'infinium-google-auth',
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture,
      },
    };
    res.send(`<!DOCTYPE html><html><body><script>
      window.opener && window.opener.postMessage(${JSON.stringify(payload)}, '*');
      window.close();
    </script></body></html>`);
  } catch (error) {
    console.error('Google auth error', error);
    const payload = {
      source: 'infinium-google-auth',
      error: 'Unable to complete Google login. Please try again.',
    };
    res.status(500).send(`<!DOCTYPE html><html><body><script>
      window.opener && window.opener.postMessage(${JSON.stringify(payload)}, '*');
      window.close();
    </script></body></html>`);
  }
};
