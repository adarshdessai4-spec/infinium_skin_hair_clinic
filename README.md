## Infinium Hair & Skin Care Clinic

Static marketing site with supporting OTP login flow powered by MSG91.

### Project Log (so we remember where we left off)

- **Navigation + visuals**
  - Mobile nav stacks the logo/CTA icons and keeps the hamburger visible.
  - WhatsApp button now uses the green rounded-square icon and opens `wa.me/917621871654`.
  - New standalone pages: `money-back.html` (policy + eligibility modal) and `combos.html` (custom plan showcase).
- **Hamburger overlay actions**
  - “Hair Test ™”, “Money Back Guarantee”, “Infinium Combos”, and “Log In” all route to real screens now.
- **Login with OTP / Google**
  - Modal supports two steps (phone entry → OTP entry) with resend countdown, inline errors, and focus management.
  - Google button now launches the OAuth popup and closes the modal when the user grants access.
  - Role toggle (User/Admin) dictates where the user lands post login.
- **User/Admin portals**
  - User dashboard mirrors the live design hero and launches shortcuts; data hydrates from `/api/user/dashboard`.
  - Admin console shows stats, tables, and activity feed sourced from `/api/admin/*`.
- **Backend**
  - Express app is modularised (`server/src/...`) with dedicated routes/controllers.
  - MSG91 OTP + Google OAuth helper endpoints live in the auth module.
  - Prisma/PostgreSQL schema (`prisma/schema.prisma`) defines users, profiles, meds, sessions, etc., with graceful fallbacks until a DB is connected.

### Local Development

1. Install dependencies

```bash
npm install
```

2. Configure env vars by copying `.env.example` to `.env` and filling MSG91, Google, and database credentials.

```bash
cp .env.example .env
```

3. (Optional but recommended) Point `DATABASE_URL` to your Postgres instance, then run Prisma generate/migrate.

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the API server (serves `/api/send-otp`, `/api/verify-otp`, Google auth callbacks, and dashboard/admin endpoints).

```bash
npm run start:server
```

5. Serve the static site (for example):

```bash
npx serve .
```

6. Visit the site (default `http://localhost:3000`) and ensure it can reach `http://localhost:4000` for OTP, Google auth, and dashboard calls.  
   If the API lives elsewhere, define `window.__INF_OTP_API_BASE = 'https://your-api.com'` before loading `assets/js/main.js`.

7. For Google login, create OAuth credentials (Web Application) in Google Cloud Console, add  
   `http://localhost:4000/api/auth/google/callback` as an authorized redirect, and populate the `.env` values below.

### Environment Variables

| Name | Description |
| --- | --- |
| `MSG91_AUTH_KEY` | MSG91 account auth key |
| `MSG91_TEMPLATE_ID` | Approved OTP template ID |
| `MSG91_SENDER_ID` | Sender ID (default `INFCLN`) |
| `MSG91_OTP_LENGTH` | OTP digit length (default `6`) |
| `PORT` | Port for the local OTP API (default `4000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect (default `http://localhost:4000/api/auth/google/callback`) |
| `DATABASE_URL` | Postgres connection string used by Prisma |

### API surface (current)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/send-otp` | Trigger MSG91 OTP |
| `POST` | `/api/verify-otp` | Validate OTP |
| `GET`  | `/api/auth/google/url` | Generate Google consent URL |
| `GET`  | `/api/auth/google/callback` | OAuth callback (popup) |
| `GET`  | `/api/user/dashboard` | Return hydrated user dashboard data |
| `GET`  | `/api/admin/stats` | Admin KPI cards + activity feed |
| `GET`  | `/api/admin/users` | Latest users for the admin table |

### Deployment reminders

- The static site can live on any host (GitHub Pages, Vercel, etc.). Just proxy `/api/*` to wherever the OTP server is running.
- Keep MSG91 + Google secrets server-side only. The frontend never needs the auth key or client secret.
- Update `DATABASE_URL` and rerun `prisma migrate deploy` in production so the schema stays current.
- For Google login, update the redirect URI in Google Cloud when you deploy to a different domain.
