# Snake Energy Development Plan

This file is the implementation roadmap for upgrading Snake Energy into a production-ready, secure wallet backend and integrated frontend state system.

## How To Review

- Review one phase at a time.
- Approve or request changes before moving to the next phase.
- Each phase has clear deliverables and exit criteria.

## Phase 0: Baseline and Safety Setup

### Goals
- Freeze current behavior and avoid regressions during migration.
- Prepare branch strategy and environment requirements.

### Deliverables
- Environment variable contract documented (`MONGO_URI`, `JWT_SECRET`, `WALLET_ENCRYPTION_KEY`).
- Local runbook for backend + frontend.
- Snapshot list of existing API routes currently used by frontend pages.

### Exit Criteria
- App still runs in current mode.
- We can compare old vs new API behavior during migration.

### Review Gate
- Confirm variable names and migration approach are acceptable.

---

## Phase 1: Backend Foundation (JavaScript)

### Goals
- Keep backend in JavaScript and standardize project structure without breaking current app startup.

### Deliverables
- Standardized backend source layout for JS modules.
- Shared utilities: logger, error helpers, response helpers.
- Updated npm scripts for stable local development and production startup.

### Exit Criteria
- JavaScript backend runs with the new structure.
- Existing API behavior remains compatible during migration.

### Review Gate
- Confirm folder layout and script strategy.

---

## Phase 2: Canonical Data Models (Mongoose)

### Goals
- Implement required schemas with strict financial precision.

### Deliverables
- `User` model:
  - `username` unique/indexed
  - `passwordHash`
  - `createdAt`
- `Wallet` model:
  - `userId` indexed
  - `publicAddress` unique/indexed
  - `encryptedPrivateKey`
  - `seedPhrase`
  - `status` enum (`ACTIVE`, `LOCKED`)
- `Asset` model:
  - `walletId` indexed
  - `tokenSymbol` enum (`BTC`, `ETH`, `BNB`, `SOL`)
  - `balance` as `Decimal128`
  - unique compound index (`walletId`, `tokenSymbol`)
- `Transaction` model:
  - `txHash` unique/indexed
  - sender/receiver indexed
  - `amount` as `Decimal128`
  - `transactionType` enum (`SEND`, `RECEIVE`, `SWAP`)
  - `status` enum (`SUCCESS`, `FAILED`, `PENDING`)

### Exit Criteria
- Models load and connect.
- Duplicate/legacy transaction schema usage eliminated from new path.

### Review Gate
- Confirm schema fields and index design before service implementation.

---

## Phase 3: DAO Layer

### Goals
- Enforce strict separation so services never access Mongoose models directly.

### Deliverables
- `UserDAO`, `WalletDAO`, `AssetDAO`, `TransactionDAO`.
- All DAO methods support optional `session` for transactions.
- Consistent return shapes and null handling.

### Exit Criteria
- DAOs are unit-testable and independent from route/controller logic.

### Review Gate
- Confirm DAO interfaces and naming conventions.

---

## Phase 4: Auth + Wallet Initialization Service

### Goals
- Implement secure registration/login with wallet bootstrap.

### Deliverables
- `AuthService.register()`:
  - bcrypt hash (10 rounds)
  - generate 12-word seed phrase
  - derive mock private key and `0x` public address
  - AES-256-CBC encrypt private key via env key
  - create user + wallet + default assets in one flow
- `AuthService.login()`:
  - verify password hash
  - issue 24h JWT with `userId`
- Controller endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`

### Exit Criteria
- Register creates required records.
- Login returns valid token and identity payload.

### Review Gate
- Confirm registration payload/response shape and security policy.

---

## Phase 5: Atomic Send Transaction Service

### Goals
- Implement ACID transfer behavior for financial safety.

### Deliverables
- `TransactionService.executeTransfer()` using Mongoose session:
  - validate payload (`receiverAddress`, `amount > 0`, valid `tokenSymbol`)
  - reject self-transfer
  - verify sender balance (`Decimal128` safe comparison)
  - debit sender asset
  - credit receiver asset (upsert token row)
  - create tx record with SHA-256 hash
  - commit on success
  - abort and rollback on failure
  - write failed tx log when needed
- Controller + route:
  - `POST /api/transactions/send` with auth middleware

### Exit Criteria
- Transfer is fully atomic.
- Partial balance writes are impossible on error paths.

### Review Gate
- Confirm failure semantics and expected HTTP codes.

---

## Phase 6: Atomic Swap Service

### Goals
- Swap tokens within the same wallet using transactional integrity.

### Deliverables
- `TransactionService.executeSwap()` using session:
  - payload validation (`fromToken`, `toToken`, `amount`)
  - fixed rate matrix (example: `1 ETH = 20 BNB`)
  - debit `fromToken`, credit converted `toToken`
  - tx logging with type `SWAP`
- Controller + route:
  - `POST /api/transactions/swap` with auth middleware

### Exit Criteria
- Swap updates are atomic and deterministic by rate matrix.

### Review Gate
- Confirm initial rate table values and rounding rules.

---

## Phase 7: Frontend Core Integration (WalletContext)

### Goals
- Centralize wallet data flow and remove duplicated page-level API state.

### Deliverables
- `WalletContext.tsx` with state:
  - `user`
  - `walletAddress`
  - `assets`
  - `transactions`
- Reusable hooks for reading/updating wallet state.
- Axios API client with bearer token support.
- 10-second polling (`setInterval` in `useEffect`) for `GET /api/assets`.
- Proper interval cleanup and error fallback behavior.

### Exit Criteria
- Shared state powers pages consistently.
- Asset values refresh without page reload.

### Review Gate
- Confirm state shape and polling strategy.

---

## Phase 8: Page Migration to Context

### Goals
- Move existing pages from direct Axios calls to WalletContext.

### Deliverables
- Migrate highest-impact pages first:
  - Homepage
  - Send
  - Swap
  - Transactions
- Keep UI/UX behavior unchanged while replacing data source.

### Exit Criteria
- No page performs duplicate ad-hoc calls for wallet core data.

### Review Gate
- Confirm migration order and any UI behavior changes.

---

## Phase 9: Hardening, Validation, and Test Coverage

### Goals
- Raise production readiness and reduce financial risk.

### Deliverables
- Request validation and sanitization for all auth/transaction endpoints.
- Structured error mapping and standardized API response format.
- Tests:
  - unit tests for services/DAOs
  - integration tests for send/swap atomicity and rollback
- Security checks:
  - encryption key validation at startup
  - JWT failure handling
  - safe logging (no private key leaks)

### Exit Criteria
- Core flows pass tests.
- Critical edge cases are covered.

### Review Gate
- Confirm test scope and release readiness criteria.

---

## Proposed Work Sequence

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6
8. Phase 7
9. Phase 8
10. Phase 9

## Approval Tracker

- [x] Phase 0 Implemented (Pending Review)
- [x] Phase 1 Implemented (Pending Review)
- [x] Phase 2 Implemented (Pending Review)
- [x] Phase 9 Implemented (Pending Review)
- [x] Phase 8 Implemented (Pending Review)
- [x] Approve Phase 5
- [x] Approve Phase 6
- [x] Approve Phase 7
- [x] Approve Phase 8
- [x] Approve Phase 9
