## Infinium Hair & Skin Care Clinic

Static marketing site with supporting OTP login flow powered by MSG91.

### Project Log (so we remember where we left off)

- **Navigation + visuals**
  - Mobile nav stacks the logo/CTA icons and keeps the hamburger visible.
  - WhatsApp button now uses the green rounded-square icon and opens `wa.me/917621871654`.
  - New standalone pages: `money-back.html` (policy + eligibility modal) and `combos.html` (custom plan showcase).
- **Hamburger overlay actions**
  - “Hair Test ™”, “Money Back Guarantee”, “Infinium Combos”, and “Log In” all route to real screens now.
- **Login with OTP**
  - Modal supports two steps (phone entry → OTP entry) with resend countdown, inline errors, and focus management.
  - Frontend JS hits `/api/send-otp` and `/api/verify-otp` using MSG91 (via the new Express proxy).
- **Backend**
  - `server/index.js` hosts the OTP proxy. Uses `.env` for MSG91 creds, exposes `/api/send-otp` + `/api/verify-otp`.

### Local Development

1. Install dependencies

```bash
npm install
```

2. Configure MSG91 credentials by copying `.env.example` to `.env` and filling the values you received from MSG91.

```bash
cp .env.example .env
```

3. Start the OTP API server (serves `/api/send-otp` and `/api/verify-otp`).

```bash
npm run start:server
```

4. Serve the static site (for example):

```bash
npx serve .
```

5. Visit the site (default `http://localhost:3000`) and ensure it can reach `http://localhost:4000` for OTP calls.  
   If the API lives elsewhere, define `window.__INF_OTP_API_BASE = 'https://your-api.com'` before loading `assets/js/main.js`.

### Environment Variables

| Name | Description |
| --- | --- |
| `MSG91_AUTH_KEY` | MSG91 account auth key |
| `MSG91_TEMPLATE_ID` | Approved OTP template ID |
| `MSG91_SENDER_ID` | Sender ID (default `INFCLN`) |
| `MSG91_OTP_LENGTH` | OTP digit length (default `6`) |
| `PORT` | Port for the local OTP API (default `4000`) |

### Deployment reminders

- The static site can live on any host (GitHub Pages, Vercel, etc.). Just proxy `/api/*` to wherever the OTP server is running.
- Keep MSG91 credentials server-side only. The frontend never needs the auth key.
