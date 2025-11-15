require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const qs = require('node:querystring');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------- Static assets ----------
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ---------- Health ----------
app.get('/healthz', (_, res) => res.status(200).send('ok'));

// ---------- Env check ----------
app.get('/_envcheck', (_, res) => {
  const keys = ['BASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
  const out = {};
  for (const k of keys) out[k] = !!process.env[k];
  res.json(out);
});

// ---------- Pages ----------

// Main landing page (pre-login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Page shown after successful auth
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'user-portal.html'));
});

// (Optional) admin + plans
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin-portal.html'));
});

app.get('/plans', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'recommended-plan.html'));
});

// ---------- Google OAuth: URL ----------
app.get('/api/auth/google/url', (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return res.status(500).json({
      error: 'MISSING_ENV',
      GOOGLE_CLIENT_ID: !!GOOGLE_CLIENT_ID,
      GOOGLE_REDIRECT_URI: !!GOOGLE_REDIRECT_URI,
    });
  }

  const params = {
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: ['openid', 'email', 'profile'].join(' '),
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
  };

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify(params)}`;
  res.json({ url });
});

// ---------- Google OAuth: callback ----------
// Google will call this after user approves.
// For now, if we see a "code" we just redirect to /user.
app.get('/api/auth/google/callback', (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Missing "code" from Google');
  }

  // TODO later: exchange code for tokens, fetch profile, set session/cookie.
  // For now, treat it as successful login and send user to /user page.
  return res.redirect('/user');
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`API server running on http://${HOST}:${PORT}`);
});
