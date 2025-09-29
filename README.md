# Yatra360

Full‑stack travel planning and discovery platform with an AI assistant, dynamic itineraries, cultural insights, currency conversion, and admin management tools.

## Overview
Yatra360 combines curated regional data, festivals, places, budgeting tools, and an AI assistant that understands user preferences (interests + budget tier) to generate and refine travel itineraries for India. The system supports authenticated users with personalized recommendations, bookmarking/liking, and an admin dashboard for managing content.

## Key Features
- AI Travel Assistant
  - Intent detection (itinerary, refine, festival info, currency, preferences)
  - Streaming style responses with knowledge base integration
  - User preference memory (interests + budget tier)
- Dynamic Itinerary Generator (multi-day, region-aware skeletons)
- Live Festival Listing (fetched from backend with fallbacks)
- Currency Conversion & Flexible Natural Language Parsing
- Budget Planner Module
- Recommendation & Interaction Logging (likes, bookmarks, ratings – idempotent)
- Admin Dashboard (protected routes; CRUD over core domain entities)
- Region & Place Metadata (cultural heritage, images, etc.)
- Secure Auth
  - JWT hybrid validation + DB refresh to keep role/isAdmin accurate
  - `/auth/me` endpoint for debugging current token context
- Robust API Health/Route Enumeration Endpoint

## Tech Stack
**Frontend:** React (CRA), Hooks, Contexts, Axios, localStorage persistence

**Backend:** Node.js, Express 5, MongoDB/Mongoose, JWT authentication, modular controllers & routes

**Other:** Regex-based NLP parsing for currency queries, preference storage, streaming simulation

## Repository Structure
```
backend/          # Express server, models, controllers, routes, middleware
frontend/         # React app (CRA)
  public/         # Static assets & service worker tweaks
  src/
    components/   # UI components (Assistant, AdminDashboard, etc.)
    pages/        # Page-level components
    services/     # API helpers (axios)
    assistant/    # AI assistant engine & preferences modules
LICENSE           # MIT License
README.md         # (This file)
```

## Running Locally
### Prerequisites
- Node.js (LTS recommended)
- MongoDB instance (local or Atlas)
- Git (for version control)

### 1. Install Dependencies
From the project root run (in two shells or sequentially):
```
cd backend
npm install
cd ../frontend
npm install
```

### 2. Environment Variables
Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/yatra360
JWT_SECRET=replace_with_long_random_string
NODE_ENV=development
```
(Optional) `frontend/.env`:
```
REACT_APP_API_BASE=http://localhost:5000
```

### 3. Start Servers
Backend:
```
cd backend
npm start
```
Frontend (in another terminal):
```
cd frontend
npm start
```
Open http://localhost:3000

## Authentication & Admin
- Register or login to obtain JWT stored client-side.
- `/auth/me` returns the sanitized user + role flags.
- Admin promotion currently manual (e.g., set `isAdmin: true` on the user in the database) until an admin seeding flow is added.

## AI Assistant Flow
1. User asks for itinerary → engine parses days & regions → generates structured daily outline.
2. User refines ("refine day 2 foodie focus") → assistant narrows into subtopic.
3. Currency queries ("convert rs.90 in us dollars") parsed via normalization and routed to conversion logic or backend endpoint.
4. Preferences saved (budget tier, interests) and inform future answers.

## Currency Parsing Highlights
Handles variations like:
- `convert rs.90 in us dollars`
- `usd to inr 15`
- `How much is ₹2500 to EUR?`
- `last conversion again`

## Health & Debugging
- `/api/health` enumerates mounted routes (useful during development)
- `/auth/me` confirms current auth context

## Scripts (Representative)
Backend `package.json` scripts might include:
- `start` – start server
- `dev` – nodemon (if configured)

Frontend (CRA default):
- `start`, `build`, `test`, `eject`

## Roadmap Ideas
- Real weather & live currency API integration
- Advanced recommendation scoring (collaborative filtering)
- Admin user management UI
- Test coverage (Jest + supertest for backend)
- CI pipeline (GitHub Actions)
- Region search & filtering enhancements

## MongoDB Atlas Configuration
For Atlas, set:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net    # (may omit trailing /<db>)
MONGO_DB_NAME=yatra360                                              # optional explicit DB name
```
If your MONGO_URI already includes the database (e.g. `...mongodb.net/yatra360?retryWrites=true`), you can omit `MONGO_DB_NAME`.
The connection helper (`backend/config/db.js`) will append `MONGO_DB_NAME` only if the URI lacks one.


## Contributing
1. Fork & clone
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional messages (e.g., `feat: add weather stub`)
4. Open a PR against `main`

## License
MIT – see `LICENSE`.

## Acknowledgements
- Create React App
- Express & Mongoose ecosystem
- Open-source community inspiration for parsing & itinerary patterns

Enjoy building with Yatra360! 🚀

## Deployment: Vercel (Frontend) + Render (Backend)

This setup deploys the React frontend to Vercel and the Node/Express API + MongoDB connection to Render.

### 1. Prepare Backend (Render)
1. Push latest code to GitHub (backend code lives in `backend/`).
2. In Render dashboard: New + Web Service → connect your repository.
3. Root Directory: set to `backend`.
4. Build Command: `npm install` (Render auto‑installs). If you later add build steps, adjust accordingly.
5. Start Command: `node server.js` (or `npm start`).
6. Instance Type: Pick free or starter per needs.

Environment Variables (Render → Settings → Environment):
```
PORT=10000            # Render supplies PORT automatically; you can omit or leave
MONGO_URI=YOUR_ATLAS_OR_RENDER_MONGODB_URI
JWT_SECRET=LONG_RANDOM_STRING
EMAIL_USER=you@example.com        # Optional if email flows used
EMAIL_PASS=app_or_smtp_password   # Optional
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```
After first deploy note the generated backend URL, e.g. `https://yatra-backend.onrender.com`.

### 2. Configure Frontend (Vercel)
1. Import your GitHub repo in Vercel.
2. Project Settings:
  - Framework Preset: Create React App
  - Root Directory: `frontend`
3. Environment Variables (Vercel → Settings → Environment Variables):
```
REACT_APP_API_BASE=https://yatra-backend.onrender.com
```
4. Deploy. Vercel will build and give you a domain like `https://yatra360.vercel.app`.
5. Go back to Render and ensure `FRONTEND_URL` matches that final Vercel domain (redeploy backend if changed).

### 3. Local Development vs Production
Locally you can keep using proxy or `REACT_APP_API_BASE=http://localhost:5000`. In production, the frontend uses the fully qualified backend API URL.

### 4. Testing After Deploy
Check (backend): `https://your-render-app/api/health`
Check (frontend): Open Vercel URL, login, verify API calls succeed (no CORS errors in console).

Health endpoint now returns extended operational metadata:
```
{
  status: "ready" | "initializing",
  time: ISOString,
  uptimeSeconds: Number,
  startTime: ISOString,
  pid: Number,
  node: "vXX.X.X",
  env: "production" | "development",
  commit: <git sha if provided by platform>,
  branch: <git branch>,
  memory: { rss, heapUsed },
  mongo: "connected" | "not-connected",
  dbName: "yatra360" (example),
  mounts: ["/api/places", ...],
  routeCount: Number,
  routes: [{ method, path }, ...]
}
```
Render exposes `RENDER_GIT_COMMIT` and `RENDER_GIT_BRANCH` automatically; if present they populate `commit` and `branch`.

### 5. CORS
Current backend uses permissive CORS. For stricter security, modify `server.js` later:
```js
// Example stricter CORS (optional enhancement)
// const allowed = process.env.FRONTEND_URL;
// app.use(cors({ origin: allowed, methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }));
```

### 6. Environment Variable Reference
| Variable | Location | Purpose |
|----------|----------|---------|
| MONGO_URI | Render backend | MongoDB connection string |
| JWT_SECRET | Render backend | JWT signing secret |
| EMAIL_USER | Render backend | SMTP user for password emails |
| EMAIL_PASS | Render backend | SMTP password/app key |
| FRONTEND_URL | Render backend | Used for email links & potential CORS tightening |
| REACT_APP_API_BASE | Vercel frontend | Absolute API base URL |

### 7. Optional Enhancements
- Add a custom domain to both Vercel and Render; update `FRONTEND_URL`.
- Add a 404 fallback page in React (already handled by SPA route logic) and monitor logs.
- Introduce rate limiting or request logging middleware on backend for production.

### 8. Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| CORS error in browser | FRONTEND_URL mismatch | Set correct domain on backend env and redeploy |
| 404 on API calls | Wrong REACT_APP_API_BASE | Update var in Vercel & redeploy frontend |
| Email not sending | Missing EMAIL_* vars or less secure app access disabled | Provide correct SMTP/app password |
| JWT invalid after redeploy | Changed JWT_SECRET | Keep secret stable or force re-login |

That’s it—you now have a split deployment: fast global CDN for the UI (Vercel) and a managed Node service (Render) for the API.

### 9. Deployment Config Artifacts Added
- `frontend/vercel.json`: Adds basic security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Adjust as needed.
- `render.yaml`: Example declarative config for the backend service (you can import this in Render, or continue configuring via dashboard). Environment variable values marked `sync: false` must be supplied manually.
- Conditional CORS: Implemented in `backend/server.js` – when `NODE_ENV=production` and `FRONTEND_URL` is set, only that origin is allowed; otherwise development remains permissive.

If you later adopt a different hosting strategy (e.g., single reverse proxy or container orchestration), you can remove these without affecting core application logic.

### 10. Runtime & Graceful Shutdown Behavior
- The server defers `app.listen` until a successful MongoDB connection is established (improves cold‑start reliability on Render).
- A readiness flag (`app.get('ready')`) switches from `false` to `true` only after Mongo + HTTP server are both up.
- `/api/health` reports `status: "initializing"` until ready. This can be used by external uptime monitors to avoid false alerts during deploys.
- Graceful shutdown: `SIGINT`/`SIGTERM` trigger a sequence: readiness set false → stop accepting new connections → close Mongo → exit (with a 10s safety timeout).
- This minimizes dropped requests during automatic restarts or manual deploys.

Environment variables optionally recognized for metadata:
| Variable | Purpose |
|----------|---------|
| RENDER_GIT_COMMIT | Populates health `commit` field |
| RENDER_GIT_BRANCH | Populates health `branch` field |
| VERCEL_GIT_COMMIT | Fallback commit if deployed in Vercel context |
| VERCEL_GIT_COMMIT_REF | Fallback branch name |

You can extend this further by adding a `VERSION` env var (e.g., from CI) and including it in the health payload.

