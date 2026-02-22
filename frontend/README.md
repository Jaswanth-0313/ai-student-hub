# AI Student Hub — Frontend

This is a minimal React + Vite frontend for the AI Student Hub backend.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

The frontend automatically uses:
- **Development** (`npm run dev`): `http://localhost:5000/api` (from `.env.development`)
- **Production** (`npm run build`): `https://ai-student-hub-cwql.onrender.com/api` (from `.env.production`)

To override locally, create `.env.local`:
```
VITE_API_BASE=http://your-custom-api-url/api
```

## Important Notes
- Auth uses JWT stored in `localStorage` as `token`
- Backend must be running at the configured API URL

Files added:
- `src/main.jsx`, `src/App.jsx`
- `src/pages/Login.jsx`, `src/pages/Signup.jsx`, `src/pages/Dashboard.jsx`
- `src/services/api.js` (axios instance + `setAuthToken`)

Next steps I can take for you:
- Add tool connect/disconnect UI and calls to `/api/tools`
- Add form validation and nicer styling (Tailwind)
- Wire frontend build into `server.js` static serving
