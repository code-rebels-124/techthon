# LifeFlow - Smart Blood Supply Management System

LifeFlow is a modern healthcare operations dashboard for monitoring blood inventory, predicting demand, and recommending redistribution between hospitals and blood banks.

## Stack

- React + Vite
- Tailwind CSS
- Reusable shadcn-style UI primitives
- Node.js + Express
- Recharts
- Framer Motion
- Lucide React
- Firebase Authentication + Firestore

## Features

- Premium dashboard with glassmorphism cards, gradients, and animated counters
- Real-time style blood inventory monitoring across all major blood groups
- Critical stock and near-expiry alerts
- Demand trend visualization and prediction summaries
- Redistribution recommendations between hospitals
- Hospitals and blood banks directory with search and status filters
- Emergency mode with nearest blood bank suggestions
- Role-based authentication for hospitals and consumers
- Firebase-ready auth with a built-in demo fallback mode
- Consumer dashboard with donor finder and emergency shortcuts
- Dark mode toggle and alerts inbox
- Mock backend API ready for Firebase or MongoDB integration later

## Project structure

- `src/components` reusable UI and dashboard modules
- `src/pages` routed application screens
- `src/context` auth state and role management
- `src/routes` protected route guards
- `src/services` API layer
- `src/data` frontend fallback data
- `src/utils` helpers
- `server` Express API and mock analytics engine

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Add your Firebase web app credentials to `.env`.

If you skip Firebase credentials, LifeFlow still works in demo mode using local demo accounts.

4. Start frontend and backend together:

```bash
npm run dev
```

5. Open the Vite app URL shown in the terminal. API requests use `VITE_API_URL` and fall back to `http://localhost:4000`.

## Demo users

- `hospital@test.com` / `123456`
- `user@test.com` / `123456`

These work instantly in demo mode and keep the auth flow functional even before Firebase credentials are added.

## Scripts

- `npm run dev` starts Vite and Express together
- `npm run client` starts only the Vite frontend
- `npm run server` starts only the Express backend
- `npm run build` builds the frontend for production
- `npm run preview` previews the production build

## Next upgrades

- Persist hospital inventory updates fully in Firestore
- Swap mock analytics data for Firestore or MongoDB
- Integrate live location tracking for emergency routing
- Add donor operations and audit logging
