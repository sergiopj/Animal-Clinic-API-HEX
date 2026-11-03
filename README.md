# Animal Clinic API

REST API built with NestJS and a hexagonal structure.

## Pet endpoints

- `POST /api/v1/pets` — creates a pet.
- `GET /api/v1/pets` — returns the pets as a JSON array.
- `GET /api/v1/pets/:id` — returns a pet by ID.
- `PATCH /api/v1/pets/:id` — updates a pet.
- `DELETE /api/v1/pets/:id` — deletes a pet.

All pet endpoints are protected with Auth0 JWT.
- `GET /api/v1/docs` — interactive OpenAPI documentation.

## Architecture

The pets flow separates the HTTP controller, application use case, domain model,
repository port, and PostgreSQL/TypeORM adapter.

## Security

Authentication is implemented with Auth0 JWT access tokens (RS256/JWKS). Protected endpoints require a valid Bearer token.
Local authorization, clinic tenant isolation, and role resolution (`clinic_user`, `clinic_admin`, etc.) remain to be implemented in subsequent phases.

## Run locally

Requirements: Node.js 20 or later and PostgreSQL.

1. Configure the database and Auth0 values in `.env` using `.env.example` as a reference:
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
   - `AUTH0_ISSUER_URL`: e.g. `https://<tenant>.<region>.auth0.com/`
   - `AUTH0_AUDIENCE`: e.g. `https://api.animal-clinic`
2. Apply the database migrations:

   ```console
   npm run migration:run
   ```

3. Build and start the API:

   ```console
   npm run build
   npm start
   ```

For development with automatic restarts:

```console
npm run start:dev
```

The API listens on port `3000` by default. Set `PORT` to override it.

## Run with Docker Compose

Set `DB_PASSWORD`, `AUTH0_ISSUER_URL`, and `AUTH0_AUDIENCE` in the local `.env` file, then run:

```console
docker compose up --build
```

The API is available at `http://localhost:3000`; PostgreSQL is exposed on port
`5432`. Run migrations against the running database with `npm run migration:run`
from a local environment configured with the same connection details.

## Tests

```console
npm test
```
