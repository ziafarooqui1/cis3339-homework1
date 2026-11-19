# Project Setup

The repository uses npm workspaces to install frontend and backend dependencies from the project root.

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

The Vue app shell includes client-side routes for students, courses, and enrollments. Their assignment functionality will be implemented requirement by requirement.

## Build

Build the Vue frontend from the project root:

```bash
npm run build
```
