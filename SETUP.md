# Project Setup and Production Run

The repository uses npm workspaces to install frontend and backend dependencies from the project root.

## Requirements

- Node.js and npm
- MongoDB Community Edition running locally
- A modern web browser

The root `.env` file configures MongoDB with `MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1` and the backend port with `PORT=3000`. Start the local MongoDB Community Edition service before starting the application.

## Install

From the project root, run:

```bash
npm install
```

## Run in Development

Start the Vue development server:

```bash
npm run dev
```

In a second terminal, start the backend:

```bash
npm start --workspace backend
```

Open the Vite development URL shown in the first terminal (normally `http://localhost:5173`). The frontend development server proxies the existing student API requests to the backend at `http://localhost:3000`.

The Vue development server provides the student, course, and enrollment views and proxies API requests to the backend.

## Production Build and Start

From the project root, build the Vue frontend and start the Express server:

```bash
npm install
npm run build
npm start
```

Open the application at `http://localhost:3000`. Express serves the production Vue assets and falls back to the Vue app for client-side routes, including direct refreshes on `/students`, `/courses`, and `/enrollments`.
