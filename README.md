# Medium Backend

TypeScript modular-monolith starter with Express, PostgreSQL, Prisma, Redis, rate limiting, and Docker Compose.

## Quick start

```sh
docker compose up --build
```

The API is available at `http://localhost:3000`. Check `GET /health` for database and Redis connectivity. Prisma applies checked-in migrations automatically when the API container starts.

```sh
docker compose exec api npm run db:studio
```

Use `npm run db:migrate` to create a new development migration after changing `prisma/schema.prisma`, and `npm run db:migrate:deploy` to apply committed migrations in deployment. Useful local commands are `npm run build`, `npm run lint`, and `npm run test`. Add domain modules under `src/` as the product grows.

API routes under `/api` are limited to 100 requests per 15 minutes by default. Configure `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` in `.env` as needed. Keep stricter, route-specific limiters for authentication, publishing, comments, and uploads when those modules are added.
