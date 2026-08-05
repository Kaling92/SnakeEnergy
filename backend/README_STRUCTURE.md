# Backend Structure (Phase 1)

Standardized JavaScript backend layout used for ongoing refactor:

- `index.js`: Express bootstrap and route mounting.
- `config/`: Configuration modules.
  - `env.js`: Environment loading and startup warnings.
- `utils/`: Shared runtime helpers.
  - `logger.js`: Timestamped application logging.
  - `http.js`: Standard success/error response helpers.
- `middleware/`: Cross-cutting middleware (auth, etc.).
- `routes/`: Endpoint route definitions.
- `controllers/`: Request handlers.
- `models/`: Mongoose schemas/models.

## Startup Commands

From `backend` directory:
- Development: `npm run dev`
- Production-like: `npm run start`

## Backward Compatibility

- Existing route mounts and endpoint paths are preserved in Phase 1.
- Legacy auth compatibility routes remain active:
  - `POST /api/login`
  - `POST /api/signup`
