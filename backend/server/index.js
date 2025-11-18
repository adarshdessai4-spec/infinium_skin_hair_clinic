require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const qs = require('node:querystring');
const fs = require('fs');
const fsPromises = require('fs/promises');

const app = express();

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
const FRONTEND_ASSETS_DIR = path.join(FRONTEND_DIR, 'assets');
const FRONTEND_PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------- Static assets ----------
if (fs.existsSync(FRONTEND_ASSETS_DIR)) {
  app.use('/assets', express.static(FRONTEND_ASSETS_DIR));
}

if (fs.existsSync(FRONTEND_PUBLIC_DIR)) {
  app.use('/public', express.static(FRONTEND_PUBLIC_DIR));
}

// ---------- Before/After gallery API ----------

const BEFORE_AFTER_DIR = path.join(FRONTEND_ASSETS_DIR, 'images', 'before-after');
const BEFORE_AFTER_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const formatGalleryTitle = (filename = '') => {
  const parsed = path.parse(filename);
  const raw = (parsed.name || 'Result').replace(/[-_]+/g, ' ').trim();
  if (!raw) return 'Infinium Result';
  return raw[0].toUpperCase() + raw.slice(1);
};

app.get('/api/before-after', async (_, res) => {
  try {
    const entries = await fsPromises.readdir(BEFORE_AFTER_DIR);
    const items = entries
      .filter((file) => BEFORE_AFTER_EXTS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((filename) => {
        const title = formatGalleryTitle(filename);
        return {
          image: `/assets/images/before-after/${filename}`,
          title,
          alt: `${title} – Infinium Hair & Skin Clinic result`,
        };
      });

    return res.json({ items });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return res.json({ items: [] });
    }

    console.error('Unable to read before-after gallery', error);
    return res.status(500).json({ error: 'UNABLE_TO_LOAD_BEFORE_AFTER' });
  }
});

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
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Page shown after successful auth
app.get('/user', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'user-portal.html'));
});

// (Optional) admin + plans
app.get('/admin', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'admin-portal.html'));
});

app.get('/plans', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'recommended-plan.html'));
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
