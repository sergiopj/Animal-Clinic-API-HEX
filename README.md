# Animal Clinic API

REST API built with NestJS and a hexagonal architecture, featuring multi-clinic tenant isolation, role-based access control, and Auth0 JWT authentication.

Interactive OpenAPI documentation is available at `GET /api/v1/docs` (JSON spec at `GET /api/v1/docs-json`).

---

## Architecture & Tenancy Model

The application follows hexagonal architecture principles:
- **Domain**: Pure business entities (`Pet`, `Clinic`, `User`, `ClinicMembership`) and value objects decoupled from frameworks.
- **Application**: Ports and use cases enforcing business validation and tenant filtering rules.
- **Infrastructure**: Inbound HTTP controllers, Outbound TypeORM persistence repositories, Auth0 JWT strategy, and database migrations.

### Authorization Roles & Policy

| Role | Scope | Capabilities |
|---|---|---|
| `clinic_user` | Clinic-specific (`ClinicMembership`) | View, create, update, and delete pets belonging to authorized clinic(s). |
| `clinic_admin` | Clinic-specific (`ClinicMembership`) | All `clinic_user` pet capabilities + manage user memberships within their own clinic. |
| `platform_admin` | Global (`User.platformRole`) | Operate across all clinics and pets; create, update, and deactivate clinics; manage user memberships across any clinic; list provisioned users. |

Key isolation and security rules:
- **Cryptographic JWT Validation**: Validates Auth0 RS256 token via JWKS.
- **Local Access Context Resolution**: Links identity strictly by issuer (`iss`) and subject (`sub`). Tokens alone do not grant business data access; an unprovisioned identity receives `403 Forbidden`.
- **Tenant Isolation**: Pet queries filter by authorized clinic IDs directly in persistence (`WHERE clinicId IN (...)`).
- **Resource Existence Obfuscation**: Requesting a pet or clinic belonging to an unauthorized clinic returns `404 Not Found` (rather than revealing its existence via `403`).
- **Controlled Platform Admin**: `platform_admin` cannot be assigned via public HTTP endpoints.

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- PostgreSQL 16+ (or Docker)

### Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=animal_clinic_user
DB_PASSWORD=animal_clinic_secret
DB_NAME=animal_clinic

AUTH0_ISSUER_URL=https://<your-auth0-tenant>.us.auth0.com/
AUTH0_AUDIENCE=https://api.animal-clinic
```

### Database Migrations

Run database migrations to apply the schema, including the multi-clinic pet association:

```bash
npm run migration:run
```

To inspect migrations:
- `src/infrastructure/database/migrations/1793194475354-CreatePetsTable.ts`
- `src/infrastructure/database/migrations/1793200000000-CreateClinicsTable.ts`
- `src/infrastructure/database/migrations/1793794725043-CreateUsersAndClinicMembershipsTables.ts`
- `src/infrastructure/database/migrations/1793800000000-AddClinicIdToPets.ts` (Adds `clinicId`, index, and foreign key on `pets`)
- `src/infrastructure/database/migrations/1793900000000-MakePetClinicIdNotNull.ts` (Enforces `NOT NULL` on `pets.clinicId` with pre-check safety guard)

### Backfill Guide: Migrating Existing Pets to NOT NULL Clinic IDs

The `1793900000000-MakePetClinicIdNotNull.ts` migration enforces that every pet belongs to a valid clinic. The migration includes a built-in safety guard: it checks for rows with `clinicId IS NULL` and aborts with a clear error if any unassigned pets are found.

Before applying the migration in an existing environment with legacy pet data, perform the manual SQL backfill:

1. **Find orphaned pets without an assigned clinic**:
   ```sql
   SELECT id, name FROM pets WHERE "clinicId" IS NULL;
   ```

2. **Assign orphaned pets to their designated clinic**:
   ```sql
   UPDATE pets SET "clinicId" = '<clinic-uuid>' WHERE id IN ('<pet-uuid>', ...);
   ```

3. **Verify all pets have a clinic assigned**:
   ```sql
   SELECT COUNT(*) FROM pets WHERE "clinicId" IS NULL;
   ```
   *(Must return 0 before proceeding)*

4. **Run migration**:
   ```bash
   npm run migration:run
   ```

### Seed Initial Platform Admin

The first `platform_admin` must be provisioned via an explicit controlled mechanism rather than public HTTP endpoints:

```bash
PLATFORM_ADMIN_ISSUER="https://<your-auth0-tenant>.us.auth0.com/" \
PLATFORM_ADMIN_SUBJECT="auth0|admin-user-id" \
npm run seed:admin
```

This creates or updates the local user record with `platformRole = 'platform_admin'`.

### User Onboarding Flow (Strict Pre-Provisioning)

The API enforces strict pre-provisioning for all staff members. JIT (Just-In-Time) auto-registration upon login is intentionally disabled:

1. **Employee identity created in Auth0**: An administrator or HR team creates the employee account in Auth0, which issues an `issuer` URL and `subject` (sub).
2. **Pre-provision membership before first login**: A `clinic_admin` (for their clinic) or `platform_admin` calls `POST /clinics/:clinicId/memberships` with the employee's Auth0 identity:
   ```json
   POST /clinics/:clinicId/memberships
   {
     "issuer": "https://<your-auth0-tenant>.auth0.com/",
     "subject": "auth0|employee-sub",
     "role": "clinic_user"
   }
   ```
   If no local `User` record exists for `(issuer, subject)`, the system creates the local user with **zero global roles** and immediately attaches the clinic membership.
3. **Employee logs in**: The user authenticates against Auth0 and calls the API with their Bearer token.
4. **Context resolution**: The API resolves the user and their clinic memberships. The user is now fully authorized for that clinic.
5. **Unprovisioned access blocked**: Any Auth0 identity that attempts to call the API without prior provisioning receives `403 Forbidden` (`User account is not provisioned or lacks permissions`), including on `GET /users/me`.

### Build & Run

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Development mode with hot reload
npm run start:dev
```

### Running with Docker Compose

```bash
docker compose up --build
```

PostgreSQL is exposed on port `5432`, and the API is accessible on port `3000`.

---

## Testing

Run unit and HTTP integration tests:

```bash
npm test
```

To run tests in-band:

```bash
npm test -- --runInBand
```

---

## API Summary

All business endpoints are mounted under the global prefix `/api/v1` and require `Authorization: Bearer <token>` (except documentation endpoints).

### Pets (`/api/v1/pets`)
- `GET /api/v1/pets`: List pets in authorized clinic(s). Platform admins can query across all clinics. Supports optional `?clinicId=` filter.
- `GET /api/v1/pets/:id`: Get pet details. Scoped to authorized clinics; returns `404` for unauthorized clinic pets.
- `POST /api/v1/pets`: Create pet in an authorized clinic (`clinicId` required).
- `PUT /api/v1/pets/:id`: Update pet details or transfer between authorized clinics.
- `DELETE /api/v1/pets/:id`: Delete pet within authorized clinic.

### Clinics (`/api/v1/clinics`)
- `GET /api/v1/clinics`: List clinics accessible to the current user (all for platform admin, authorized clinics for staff).
- `GET /api/v1/clinics/:id`: Get clinic details.
- `POST /api/v1/clinics`: Create clinic (`platform_admin` only).
- `PUT /api/v1/clinics/:id`: Update clinic (`platform_admin` only).
- `DELETE /api/v1/clinics/:id`: Soft-deactivate clinic (`status = inactive`, `platform_admin` only).

### Clinic Memberships (`/api/v1/clinics/:clinicId/memberships`)
- `GET /api/v1/clinics/:clinicId/memberships`: List staff memberships (`clinic_admin` of clinic or `platform_admin`).
- `POST /api/v1/clinics/:clinicId/memberships`: Assign user to clinic or pre-provision a new user by Auth0 issuer and subject (`clinic_user` or `clinic_admin`).
- `PUT /api/v1/clinics/:clinicId/memberships/:userId`: Update membership role.
- `DELETE /api/v1/clinics/:clinicId/memberships/:userId`: Revoke membership.

### Users (`/api/v1/users`)
- `GET /api/v1/users`: List provisioned users (`platform_admin` only).
- `GET /api/v1/users/me`: View current authenticated identity profile and active clinic memberships.
