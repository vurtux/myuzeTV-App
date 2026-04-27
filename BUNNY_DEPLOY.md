# Deploy myuzeTV Web to Bunny CDN

This document describes how to build and deploy the myuzeTV web app to Bunny CDN Static Storage.

## Bunny CDN Setup

### Existing Configuration

- **Storage Zone:** `myuzetvapp`
- **Pull Zone domain:** `myuzetv.myuze.app`
- **FTP host:** `storage.bunnycdn.com`, port 21

### Storage Zone – Error Handling (SPA routing)

For client-side routing (Expo Router) to work with direct URLs like `/drama/[slug]` and `/watch/[episodeId]`:

1. Open the Storage Zone in the Bunny dashboard
2. Go to **Error handling**
3. Enable **Rewrite 404 to 200 status code**
4. Set **404 File path** to `/index.html`
5. Click **Save**

## Build

For deploy (includes auth token from `.env`):

```bash
cd myuzeTV-App
npm install
npm run build:deploy
```

This runs `expo export --platform web` and injects `config.js` with `EXPO_PUBLIC_AUTH_TOKEN` from `.env` into all HTML files. Output is written to `dist/` (index.html, config.js, _expo/, assets/, etc.).

For build only (no token injection):

```bash
npm run build:web
```

**Base URL:** If serving from a subpath, set `EXPO_PUBLIC_WEB_BASE_URL` before building. For root URL, no change needed.

## Manual Deploy

1. Build: `npm run build:web`
2. Upload the contents of `dist/` to the Storage Zone via:
   - Bunny dashboard (Storage Zone file manager)
   - FTP (credentials from Storage Zone)
   - Bunny Storage REST API

## GitHub Actions Deploy

On push to `main` (when myuzeTV-App files change), the workflow at `.github/workflows/deploy-web-bunny.yml` builds and deploys automatically.

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `BUNNY_STORAGE_NAME` | Storage Zone name (`myuzetvapp`) |
| `BUNNY_STORAGE_PASSWORD` | Storage Zone API password (FTP & API Access) |
| `BUNNY_ACCESS_KEY` | Bunny API key (for purge) |
| `BUNNY_PULL_ZONE_ID` | Pull Zone ID |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL (default: `https://tv.myuze.app/api`) |

## Environment Variables for Build

The build embeds `EXPO_PUBLIC_*` values. Ensure `.env` or CI variables include:

- `EXPO_PUBLIC_API_URL` – Backend API URL (e.g. `https://tv.myuze.app/api`)
