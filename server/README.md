# YieldMaster AI – Backend

Node.js + Express + TypeScript API with Prisma (SQLite) and JWT auth.

## Setup

1. **Install dependencies**
   ```bash
   cd server && npm install
   ```

2. **Environment**
   - Copy `server/.env.example` to `server/.env` (or use the existing `.env`).
   - Set `JWT_SECRET` to a strong random string in production.

3. **Database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
   - Creates SQLite DB at `server/prisma/dev.db`.
   - Seeds a demo user: **demo@yieldmaster.ai** / **demo1234**.

4. **Run the API**
   ```bash
   npm run dev
   ```
   - API: http://localhost:3001  
   - Health: http://localhost:3001/api/health  

## Frontend dev

From the project root, run the Vite app:

```bash
npm run dev
```

Vite proxies `/api` to `http://localhost:3001`, so the frontend talks to the backend with no CORS issues.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | `/api/auth/signup` | No  | Register (email, password, optional name) |
| POST   | `/api/auth/login`  | No  | Login (email, password) → returns `user` + `token` |
| GET    | `/api/users/me`    | Yes | Current user + settings |
| PATCH  | `/api/users/me`    | Yes | Update name, location |
| GET    | `/api/dashboard/stats` | Yes | Dashboard stats |
| GET    | `/api/dashboard/yield-trends` | Yes | Yield chart data |
| GET    | `/api/dashboard/weather` | Yes | Weather data |
| GET    | `/api/dashboard/crop-distribution` | Yes | Crop mix |
| GET    | `/api/dashboard/activity` | Yes | Recent activity |

Protected routes require header: `Authorization: Bearer <token>`.
