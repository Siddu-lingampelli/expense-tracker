# $ monitor

Track expenses without handing your data to anyone.

![mit](https://img.shields.io/badge/license-MIT-blue)
![vite](https://img.shields.io/badge/vite-4.5-646CFF?logo=vite)
![react](https://img.shields.io/badge/react-18.2-61DAFB?logo=react)
![tailwind](https://img.shields.io/badge/tailwind-3.3-06B6D4?logo=tailwindcss)

## Live

[https://expense-track-v1.vercel.app](https://expense-track-v1.vercel.app)

## Stack

- **Vite** + **React 18** — SPA
- **Tailwind CSS 3** — utility-first styling
- **React Query** — async state & caching
- **Chart.js** — dashboard charts
- **React Router 6** — client-side routing
- **react-hook-form** + **zod** — form validation
- **react-icons** (Feather) — icon set

All data lives in `localStorage`. No backend, no cloud, no sign-up fees.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`.

## Build

```bash
npm run build    # outputs to frontend/dist
```

## Deploy

Push to `master` → Vercel auto-deploys (SPA rewrite configured in `vercel.json`).

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Project structure

```
frontend/src/
  pages/          — 11 route pages
  components/     — layout, shared UI
  hooks/          — useAuth, useInView
  context/        — AuthContext, ThemeContext
  utils/          — localStorage mock API layer
```

Backend (`backend/`) exists in the repo but is **not used** — the app is fully client-side.

## License

MIT
