# Frontend API Route Snapshot (Baseline)

This file captures API routes currently consumed by frontend pages before deeper backend refactoring.

## Routes Used by Frontend Pages

- `POST /api/login`
  - Used by: `frontend/src/pages/Login.tsx`, `frontend/src/pages/SignUp.tsx`
- `POST /api/signup`
  - Used by: `frontend/src/pages/SignUp.tsx`
- `GET /api/wallet/dashboard`
  - Used by: `frontend/src/pages/Homepage.tsx`
- `GET /api/wallet/assets`
  - Used by: `frontend/src/pages/Assets.tsx`
- `GET /api/wallet/analytics`
  - Used by: `frontend/src/pages/Analytics.tsx`
- `GET /api/wallets/balances`
  - Used by: `frontend/src/pages/Send.tsx`
- `POST /api/wallets/send`
  - Used by: `frontend/src/pages/Send.tsx`
- `GET /api/wallets/receive`
  - Used by: `frontend/src/pages/Receive.tsx`
- `GET /api/nfts`
  - Used by: `frontend/src/pages/NFT.tsx`
- `GET /api/notifications`
  - Used by: `frontend/src/pages/Notifications.tsx`
- `PUT /api/notifications/mark-all-read`
  - Used by: `frontend/src/pages/Notifications.tsx`
- `GET /api/users/profile`
  - Used by: `frontend/src/pages/Security.tsx`
- `PUT /api/users/profile`
  - Used by: `frontend/src/pages/Security.tsx`
- `GET /api/users/settings/advanced`
  - Used by: `frontend/src/pages/Settings.tsx`
- `PUT /api/users/settings/advanced`
  - Used by: `frontend/src/pages/Settings.tsx`
- `GET /api/swap/quote`
  - Used by: `frontend/src/pages/Swap.tsx`
- `POST /api/swap/execute`
  - Used by: `frontend/src/pages/Swap.tsx`
- `GET /api/transactions`
  - Used by: `frontend/src/pages/Transactions.tsx`
- `GET /api/vaults`
  - Used by: `frontend/src/pages/Wallet.tsx`
- `POST /api/vaults/add`
  - Used by: `frontend/src/pages/Wallet.tsx`
- `GET /api/yield/strategies`
  - Used by: `frontend/src/pages/ExploreVaults.tsx`

## Backend Mount Snapshot

Current route mounts in backend:
- `/api/auth`
- `/api/wallet`
- `/api/wallets`
- `/api/nfts`
- `/api/notifications`
- `/api/swap`
- `/api/users`
- `/api/vaults`
- `/api/yield`
- `/api/transactions`
- Legacy direct routes: `/api/login`, `/api/signup`
