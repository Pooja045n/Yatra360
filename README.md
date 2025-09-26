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
