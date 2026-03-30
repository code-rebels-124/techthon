# LifeFlow - Blood Bank Management System

LifeFlow is a full-stack Blood Bank Management System built for hospital operations and emergency coordination.
It includes hospital-based login, blood inventory tracking, donor management, emergency request handling, and a futuristic dashboard UI for hackathons and demos.

## Features

- `Hospital-based login` with hospital-specific data access
- `Blood inventory management` for all major blood groups
- `Donor management` with add, update, delete, and search
- `Emergency request system` with matching and hospital response flow
- `Real-time style sync` using periodic refresh
- `Graphs & analytics` for blood stock, donation trends, and emergency demand

## Tech Stack

- `Frontend:` React, Tailwind CSS, Framer Motion
- `Backend:` Node.js, Express
- `Database:` MongoDB
- `Charts:` Recharts

## Project Structure

```text
smart_blood/
├── public/
├── server/
│   ├── data/
│   │   ├── hospitals.json
│   │   └── store.json
│   ├── db.js
│   ├── fallback-server.js
│   ├── index.js
│   ├── load-env.js
│   ├── models.js
│   ├── seed.js
│   ├── security.js
│   ├── services.js
│   └── store.js
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd smart_blood
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/lifeflow
JWT_SECRET=your-super-secret-key
PORT=4000
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Run the project

```bash
npm run dev
```

### 6. Open the app

```text
http://localhost:5173
```

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - backend server port

## Available Scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run seed
npm run build
```

## Demo

Demo Video: [Add Google Drive Link Here]

## Screenshots

- Add login screen screenshot here
- Add dashboard screenshot here
- Add emergency request screen screenshot here

## Future Improvements

- AI-based blood demand prediction
- SMS/Email notifications
- Live blood transport tracking

## Author

- `Your Name Here`
