# LifeFlow - Smart Blood Bank Management System

LifeFlow is a full-stack blood bank management platform designed for hospital operations, emergency coordination, and hackathon demos.
It combines a futuristic command-center style UI with hospital-scoped authentication, live inventory visibility, donor management, and emergency blood request matching.

## Overview

LifeFlow is built to solve a practical workflow:

- hospitals manage their own blood inventory
- hospitals manage their own donor network
- emergency requests can be raised and matched against available hospitals
- public hospital listings, dashboards, and charts all read from the same shared backend data
- the system works in both MongoDB mode and local fallback mode

The project is intentionally structured so it can run quickly for demos without requiring a perfect cloud setup.

## Core Features

- Hospital authentication with protected access
- Role-aware backend sessions using JWT
- Hospital-specific dashboard and scoped data access
- Blood inventory management for all major blood groups
- Donor management with add, edit, delete, and search
- Emergency request creation and hospital response flow
- Shared hospital network listing across India
- Real hospital dataset seeded from Indian hospital names and locations
- Charts and visual summaries driven by the same backend data as the UI
- Futuristic dark-mode interface using glassmorphism and motion
- MongoDB-first architecture with automatic local fallback mode

## UI / UX Direction

The interface is intentionally not a basic admin panel.

Design goals:

- futuristic healthcare control center feel
- dark mode base with neon red, cyan, green, and amber accents
- layered glass panels instead of flat cards
- smooth transitions with Framer Motion
- fast scanning with low text density
- mobile-friendly responsive layouts

Main experience areas:

- Command Center
- Inventory
- Donors
- Hospitals
- Emergency

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- JWT authentication
- bcrypt password hashing

### Data

- MongoDB via Mongoose
- Local JSON fallback datastore for offline/demo mode

## Architecture

LifeFlow supports two backend runtime modes:

### 1. Mongo Mode

If MongoDB is available, the app uses:

- `server/db.js`
- `server/models.js`
- `server/services.js`
- `server/seed.js`

### 2. Local Fallback Mode

If MongoDB is unavailable, the server automatically falls back to:

- `server/fallback-server.js`
- `server/store.js`
- `server/data/store.json`

This makes the project much easier to demo locally while keeping the production architecture modular.

## Real Hospital Dataset

The project includes a real-world hospital seed dataset based on recognizable Indian hospitals and medical institutions.

Dataset highlights:

- 30+ real hospitals
- spread across multiple Indian cities and states
- includes private hospitals, government hospitals, and medical institutions
- realistic addresses and approximate coordinates
- used across hospital listings, emergency matching, and seeded backend data

Primary dataset file:

- [server/data/hospitals.json](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/data/hospitals.json)

Fallback runtime store:

- [server/data/store.json](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/data/store.json)

## Authentication

The app currently supports:

- hospital login
- hospital registration
- requester/demo user access for emergency flow

Authentication flow:

1. user logs in using backend auth
2. server returns JWT token
3. token is stored locally in the frontend
4. protected routes fetch scoped data from backend APIs

Important files:

- [server/index.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/index.js)
- [server/security.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/security.js)
- [src/context/AuthContext.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/context/AuthContext.jsx)
- [src/routes/ProtectedRoute.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/routes/ProtectedRoute.jsx)

## Command Center Features

### Hospital Dashboard

- total stock visibility
- low stock highlights
- emergency feed
- availability visuals
- donation trend charts

### Inventory

- hospital-scoped inventory editing
- stock level visuals per blood type
- update and remove flows

### Donors

- donor search
- donor profile cards
- add, update, and delete operations

### Hospitals

- live hospital network listing
- stock overview per hospital
- search and filtering

### Emergency

- create urgent blood requests
- match requests against hospitals
- hospital response actions

## Project Structure

```text
smart_blood/
|-- public/
|-- server/
|   |-- data/
|   |   |-- hospitals.json
|   |   |-- store.json
|   |-- db.js
|   |-- fallback-server.js
|   |-- index.js
|   |-- load-env.js
|   |-- logic.js
|   |-- models.js
|   |-- seed.js
|   |-- security.js
|   |-- services.js
|   |-- store.js
|-- src/
|   |-- components/
|   |   |-- auth/
|   |   |-- dashboard/
|   |   |-- donors/
|   |   |-- emergency/
|   |   |-- layout/
|   |   |-- map/
|   |   |-- ui/
|   |-- context/
|   |-- data/
|   |-- lib/
|   |-- pages/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- App.jsx
|   |-- index.css
|   |-- main.jsx
|-- .env
|-- .env.example
|-- package.json
|-- vite.config.js
|-- README.md
```

## Important Files

### Backend

- [server/index.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/index.js)
  Main API entry point and runtime mode selection.

- [server/services.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/services.js)
  Mongo-based selectors, aggregation, and dashboard shaping.

- [server/fallback-server.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/fallback-server.js)
  Express routes for local datastore mode.

- [server/store.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/store.js)
  Local datastore creation, persistence, and dataset upgrade path.

- [server/seed.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/server/seed.js)
  Mongo seed script for hospitals, inventory, donors, and activities.

### Frontend

- [src/App.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/App.jsx)
  Route setup, shell, and page transitions.

- [src/components/layout/app-shell.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/components/layout/app-shell.jsx)
  Main shell layout logic.

- [src/pages/dashboard-page.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/pages/dashboard-page.jsx)
  Command center experience.

- [src/pages/hospitals-page.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/pages/hospitals-page.jsx)
  Hospital network listing UI.

- [src/pages/emergency-page.jsx](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/pages/emergency-page.jsx)
  Emergency request and response flow.

- [src/services/api.js](C:/Users/VISHNUVARDHAN/OneDrive/Desktop/smart_blood/src/services/api.js)
  Shared frontend API layer.

## Environment Variables

Current project environment supports:

```env
APP_NAME=LifeFlow
APP_REGION=India
NODE_ENV=development
APP_MODE=local

MONGO_URI=mongodb://127.0.0.1:27017/lifeflow
PORT=4000
JWT_SECRET=change-this-to-a-long-random-secret
TOKEN_TTL_HOURS=24h

USE_LOCAL_FALLBACK=true
SEED_HOSPITAL_DATASET=server/data/hospitals.json

DEMO_HOSPITAL_EMAIL=hospital@test.com
DEMO_HOSPITAL_PASSWORD=123456
DEMO_REQUESTER_EMAIL=user@test.com
DEMO_REQUESTER_PASSWORD=123456
```

Notes:

- `MONGO_URI` is used only when Mongo mode is available.
- if MongoDB is unavailable, the app falls back automatically to local datastore mode
- `.env.example` is the safe template
- `.env` contains your local runtime values

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/code-rebels-124/techthon.git
cd smart_blood
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Use the provided template:

```bash
copy .env.example .env
```

Then edit `.env` if needed.

### 4. Run the app

```bash
npm run dev
```

Default URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`

## Seeding Data

### MongoDB seed

If you want MongoDB populated with the real hospital dataset:

```bash
npm run seed
```

This will create:

- 30+ hospitals
- full blood inventory for each hospital
- donor records
- activity logs

### Local fallback seed

Local mode reads from:

- `server/data/hospitals.json`

and writes the live fallback state to:

- `server/data/store.json`

The store is automatically created or upgraded when needed.

## Available Scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run preview
npm run server
npm run seed
```

## Demo Credentials

### Hospital

- email: `hospital@test.com`
- password: `123456`

### Requester

- email: `user@test.com`
- password: `123456`

## API Summary

Main API groups:

- `/api/auth/*`
- `/api/command-center`
- `/api/hospitals`
- `/api/hospitals/nearby`
- `/api/inventory/*`
- `/api/donors/*`
- `/api/emergency-requests/*`

The backend exposes the same hospital data to:

- listings
- dashboard summaries
- emergency matching
- charts

## Current Status

The project currently includes:

- futuristic command-center UI
- hospital-aware routing
- backend auth
- emergency request handling
- real Indian hospital dataset integration
- local fallback mode
- MongoDB seed support

## Future Improvements

- stronger AI demand prediction
- donor recommendation engine
- SMS and WhatsApp emergency notifications
- transport and dispatch tracking
- admin analytics and audit view
- hospital map clustering and route optimization

## Notes

- this repo is optimized for fast demos and hackathons
- MongoDB is optional for local development because fallback mode is built in
- the hospital dataset has been integrated into the shared backend flow, not just static UI cards

## Author

- Code Rebels / LifeFlow project
