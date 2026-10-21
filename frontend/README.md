# NeuroAge Frontend

NeuroAge is a research-oriented frontend for MRI-based brain-age assessment. It supports a public landing page, a scientific dashboard, MRI intake and preview workflows, and report/history views that are intentionally framed as exploratory research tools rather than medical diagnoses.

## Installation

```bash
cd frontend
npm install
```

## Local development

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 4173
```

The app is currently configured to run on port 4173 in local validation, which matches the stable Vite build/test workflow used during project handover.

## Environment configuration

Copy the example environment file and fill in the deployment values:

```bash
cp .env.example .env
```

Required frontend variables:

```env
VITE_APP_ENV=development
VITE_API_BASE_URL=https://api.example.com
VITE_USE_DEMO_DATA=false
VITE_API_TIMEOUT_MS=15000
VITE_ENABLE_POLLING=true
```

Notes:

- `VITE_API_BASE_URL` is the public base URL for the backend API and must not include secrets or auth tokens.
- Use `VITE_USE_DEMO_DATA=false` in production or whenever the backend is available.
- Demo mode is intentionally enabled automatically when the API base URL is absent; this is a safe fallback for local development only and must not be mistaken for real inference.
- No secrets should be embedded in the client bundle. Do not store API keys, private endpoints, or access tokens in frontend env variables unless the deployment platform explicitly supports public-safe configuration and the backend contract requires it.

## Testing and build commands

```bash
cd frontend
npm run test
npm run lint
npm run format:check
npm run build
```

Additional local commands:

```bash
npm run dev
npm run preview -- --host 0.0.0.0 --port 4173
```

## API integration requirements

The frontend uses a typed service boundary and intentionally avoids assuming a live backend contract before the API is confirmed.

Expected backend integration points:

- `POST /api/v1/assessments`
- `GET /api/v1/assessments/:id/status`
- `GET /api/v1/assessments/:id`
- `GET /api/v1/reports`
- `GET /api/v1/reports/:id/pdf`

The frontend expects:

- MRI upload validation for `.nii` and `.nii.gz` files only
- file-size limits enforced before upload
- a non-diagnostic response payload with `assessmentId`, `status`, `message`, and timestamps
- report artifact URLs that must be served by the backend, not created client-side

The app does not silently invent success states. When the backend is unavailable or the status contract is not yet confirmed, the UI remains clearly labeled as demo mode.

## Deployment instructions

### Static hosting

The frontend is a Vite React application that can be deployed as a static bundle to any modern SPA host.

```bash
cd frontend
npm install
npm run build
```

Deploy the generated `dist/` output to the chosen static host.

### SPA route fallback

For hosting platforms such as Netlify, Vercel, or Azure Static Web Apps, configure rewrite rules so that requests to non-root routes are routed back to `/index.html`.

Examples:

- Netlify: `_redirects` containing `/* /index.html 200`
- Vercel: rewrite all routes to `index.html`
- Azure Static Web Apps: configure a fallback route in the static web app configuration

### Production environment

Set the production API URL through `VITE_API_BASE_URL` and keep demo mode disabled:

```env
VITE_USE_DEMO_DATA=false
VITE_API_BASE_URL=https://<production-api-host>
```

## Known limitations

- The frontend is designed to be backend-safe, but the backend and ML API contracts are still pending confirmation.
- Authentication is intentionally disabled until the backend team confirms the actual sign-in, token, and permission model.
- MRI preview rendering depends on backend-generated image previews or a dedicated medical imaging viewer; browser-only display is not a substitute for scientific volume review.
- The dashboard and reports remain research-focused and should not be presented as clinical interpretations.
- The current demo mode is for development and safety validation only; it cannot be used to claim real model inference.

## Handover status

This frontend is ready for integration work once the backend and ML teams confirm the live contracts for:

- authentication
- assessment submission
- polling/status endpoints
- report generation and PDF delivery
- production environment configuration
