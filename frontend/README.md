# AI Student Hub — Frontend

This is a minimal React + Vite frontend for the AI Student Hub backend.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

Important:
- Backend must be running at `http://localhost:5000` (default). You can change `VITE_API_BASE` in `.env` if needed.
- Auth uses JWT stored in `localStorage` as `token`.

Files added:
- `src/main.jsx`, `src/App.jsx`
- `src/pages/Login.jsx`, `src/pages/Signup.jsx`, `src/pages/Dashboard.jsx`
- `src/services/api.js` (axios instance + `setAuthToken`)

Next steps I can take for you:
- Add tool connect/disconnect UI and calls to `/api/tools`
- Add form validation and nicer styling (Tailwind)
- Wire frontend build into `server.js` static serving
