# Phase 0 Baseline and Safety Setup

## Environment Variable Contract

Required:
- `MONGO_URI`: MongoDB connection string used by backend.
- `JWT_SECRET`: Secret for signing and verifying JWT tokens.
- `WALLET_ENCRYPTION_KEY`: Reserved for AES-256 wallet key encryption in upcoming phases.

Optional:
- `PORT`: Backend server port (default: `5000`).

## Local Runbook

### Backend
1. Open terminal at `backend`.
2. Install dependencies: `npm install`.
3. Create `.env` with at least `JWT_SECRET` and optionally `MONGO_URI`.
4. Start development server: `npm run dev`.
5. Start production-like server: `npm run start`.

### Frontend
1. Open terminal at `frontend`.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.
4. Production build check: `npm run build`.

### Quick Health Check
- Backend health endpoint: `GET /`
- Expected response: `Crypto Wallet API status: Online`

## Baseline Safety Notes

- Keep existing endpoint paths unchanged while introducing internal structure improvements.
- Keep both `/api/auth/*` and existing legacy `/api/login` + `/api/signup` compatibility routes active.
- Do not remove existing frontend-consumed routes during Phase 0 and 1.
