## Infinium Hair & Skin Care Clinic

Static marketing site with supporting OTP login flow powered by MSG91.

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

4. Open the static site (e.g. with `npx serve .` or any other static server) and ensure it can reach `http://localhost:4000`.

### Environment Variables

| Name | Description |
| --- | --- |
| `MSG91_AUTH_KEY` | MSG91 account auth key |
| `MSG91_TEMPLATE_ID` | Approved OTP template ID |
| `MSG91_SENDER_ID` | Sender ID (default `INFCLN`) |
| `MSG91_OTP_LENGTH` | OTP digit length (default `6`) |
| `PORT` | Port for the local OTP API (default `4000`) |

### Frontend Config

The login modal expects the OTP API to be reachable at `/api`. When deploying, proxy `/api` to the server above or set `window.__INF_OTP_API_BASE` before loading `assets/js/main.js` to point to your hosted endpoint.
