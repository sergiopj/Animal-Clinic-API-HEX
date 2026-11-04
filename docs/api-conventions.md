# API conventions

## Dates and times

- Use `YYYY-MM-DD` for calendar dates that do not represent a specific time or timezone.
  - Example: a pet's birthdate: `2020-03-15`.
- Use ISO 8601 timestamps in UTC for specific moments in time.
  - Example: `2026-10-28T15:41:27Z`.
- When a timestamp is received with a timezone offset, convert it to UTC before storing or returning it.
  - Example: `2026-10-28T16:41:27+01:00` becomes `2026-10-28T15:41:27Z`.
- Do not use locale-specific formats such as `03/15/2020` or `15-03-2020`.

## Responses

- Return successful response data directly as JSON, without a generic `data` wrapper.
- Return a single resource as a JSON object.
- Return an unpaginated collection as a JSON array.
- Return a paginated collection as an object containing `items` and pagination metadata.
- Use `Content-Type: application/json` for JSON responses.

## Errors

- Return errors using the `application/problem+json` format (RFC 9457).
- Include `type`, `title`, `status`, and a safe, human-readable `detail` when applicable.
- Include `instance` to identify the request that caused the error.
- Validation errors may include an `errors` extension with field-specific messages.
- Never expose stack traces, database details, credentials, or other internal information.

## HTTP status codes

- Use `200 OK` for successful requests that return a response body.
- Use `201 Created` when a request creates a resource.
- Use `204 No Content` when a request succeeds and returns no body.
- Use `400 Bad Request` for invalid input or malformed requests.
- Use `401 Unauthorized` when authentication is required but missing or invalid.
- Use `403 Forbidden` when the caller is authenticated but not allowed to perform the operation, or when an authenticated identity is not provisioned in the local database.
- Use `404 Not Found` when the requested resource does not exist, OR when a requested resource belongs to a clinic that the authenticated user is not authorized to access (to avoid leaking resource existence).
- Use `409 Conflict` when the request conflicts with the current state of a resource (e.g. duplicate clinic membership).
- Use `500 Internal Server Error` for unexpected server errors.

## Security and authorization

- Protected endpoints require an authenticated user. The API authenticates Auth0 JWT access tokens.
- Document the authentication and authorization requirements for every endpoint. Explicitly identify public endpoints (e.g. Swagger docs at `/docs`) rather than assuming they are public.
- Return `401 Unauthorized` when credentials are missing or invalid, and `403 Forbidden` when an authenticated user lacks permission or is not provisioned.
- Never include credentials, access tokens, or other secrets in API responses or logs.

### JWT access tokens

- Send access tokens using the `Authorization: Bearer <access-token>` header.
- Accept only access tokens issued for this API; do not accept ID tokens as API credentials.
- Validate the token signature, allowed signing algorithm (RS256), issuer, audience, and time claims, including expiration, before accepting it.
- Link an external identity to a local account using the validated issuer (`iss`) and subject (`sub`), not email alone. Do not store or validate user passwords in this API.
- A valid token establishes identity, not access to business data. Resolve account status, clinic memberships, and permissions from trusted local authorization data; never trust roles or clinic identifiers supplied only by the client.
- Do not send tokens in URLs or include them in logs or API responses. Use HTTPS for requests carrying tokens.
- Use the identity provider's documented signing-key discovery and rotation mechanisms (JWKS). Do not hardcode signing secrets.

### User Provisioning, Onboarding Flow, and First Admin Seed

#### Strict Pre-Provisioning Model (No JIT Registration)
- Authenticated users must have a corresponding record in the local `users` table linked by `issuer` and `subject`.
- **Pre-provisioning is required before first login**: The system enforces strict pre-provisioning. JIT (Just-In-Time) auto-registration on first login is not permitted.
- Valid Auth0 identities without a provisioned local record receive `403 Forbidden` (`User account is not provisioned or lacks permissions` / `User account is not provisioned in local database`) on all endpoints, including `GET /users/me`.

#### User Onboarding Flow
1. **Identity creation in Auth0**: An employee account is created in the identity provider (Auth0), generating a unique `issuer` (`iss`) and `subject` (`sub`) pair.
2. **Pre-provisioning by administrator**: Before the employee can use the API, a `clinic_admin` (for their own clinic) or a `platform_admin` (for any clinic) calls:
   ```http
   POST /clinics/:clinicId/memberships
   Content-Type: application/json
   Authorization: Bearer <admin-token>

   {
     "issuer": "https://<your-auth0-tenant>.auth0.com/",
     "subject": "auth0|654321fedcba",
     "role": "clinic_user"
   }
   ```
   If no local `User` record exists for this `(issuer, subject)` pair, the system creates the local `User` record with **zero global roles** (`platformRole = null`) and immediately attaches the specified `ClinicMembership`.
3. **Employee first login**: The employee logs in via Auth0 and sends their Bearer JWT access token in API requests.
4. **Context resolution & access granted**: The Auth0 JWT strategy resolves the local `UserAccessContext` by `(issuer, subject)` from the database. The user now has access to pet operations within their assigned clinic(s).
5. **Unprovisioned identity rejection**: If an unprovisioned identity logs in and calls `GET /users/me` or any pet/clinic endpoint, the system returns `403 Forbidden`.

#### First Admin Seed
The initial `platform_admin` account cannot be assigned via public HTTP endpoints. It is provisioned using the controlled seed script:
```bash
PLATFORM_ADMIN_ISSUER="https://your-domain.auth0.com/" \
PLATFORM_ADMIN_SUBJECT="auth0|admin-user-id" \
npm run seed:admin
```

### Clinics, roles, and authorization policy

- Clinic-owned data is tenant-scoped: an authenticated user may access records only within a clinic to which they belong and are authorized.
- Determine the clinic scope from the authenticated user's local `UserAccessContext`.
- Persistence-level isolation: Queries filter by authorized clinic IDs (`WHERE clinicId IN (...)`) directly at the database layer, not solely in-memory.
- Preventing cross-tenant resource leakage: Requesting a resource (`/pets/:id`, `/clinics/:id`) that belongs to an unauthorized clinic returns `404 Not Found`, identical to requesting a non-existent resource ID.

The authorization policy is:

| Action | `clinic_user` | `clinic_admin` | `platform_admin` |
| --- | --- | --- | --- |
| View pets in an authorized clinic | Yes | Yes | Yes, across all clinics |
| Create, update, delete pets in an authorized clinic | Yes | Yes | Yes, across all clinics |
| Manage users/memberships in own clinic | No | Yes | Yes, across all clinics |
| Create, update, or deactivate clinics | No | No | Yes |
| List provisioned users | No | No | Yes |
| View own user profile and memberships (`/users/me`) | Yes | Yes | Yes |

- `clinic_user` and `clinic_admin` are clinic-scoped roles stored on `ClinicMembership`. A user may have different roles in different clinics.
- `platform_admin` is a global role stored on the `User` entity (`platformRole`).
- There is no generic global `admin` or `group_admin` role.

### Implemented Endpoints

#### Pets (`/pets`)
- `GET /pets`: Lists pets. Clinic users/admins receive pets from their authorized clinics (with optional `?clinicId=` filter). Platform admins receive pets across all clinics.
- `GET /pets/:id`: Retrieves pet by ID. Scoped to authorized clinics; returns `404` if not found or in an unauthorized clinic.
- `POST /pets`: Creates a pet. Requires `clinicId`. Caller must be a member of `clinicId` or a `platform_admin`.
- `PUT /pets/:id`: Updates a pet. Scoped to authorized clinics. If updating `clinicId`, user must have membership in the target clinic.
- `DELETE /pets/:id`: Deletes a pet. Scoped to authorized clinics.

#### Clinics (`/clinics`)
- `GET /clinics`: Lists clinics. Clinic members receive clinics they belong to; platform admins receive all clinics.
- `GET /clinics/:id`: Retrieves clinic by ID. Scoped to authorized clinics for regular staff; returns `404` for unauthorized clinics.
- `POST /clinics`: Creates a clinic. Restricted to `platform_admin`.
- `PUT /clinics/:id`: Updates a clinic. Restricted to `platform_admin`.
- `DELETE /clinics/:id`: Soft-deactivates clinic (`status = inactive`). Restricted to `platform_admin`.

#### Clinic Memberships (`/clinics/:clinicId/memberships`)
- `GET /clinics/:clinicId/memberships`: Lists memberships for clinic. Restricted to `clinic_admin` of that clinic or `platform_admin`.
- `POST /clinics/:clinicId/memberships`: Assigns membership (`userId` OR `issuer` + `subject` pair for pre-provisioning, with `role` in `[clinic_user, clinic_admin]`). Restricted to `clinic_admin` of that clinic or `platform_admin`.
- `PUT /clinics/:clinicId/memberships/:userId`: Updates membership role (`clinic_user` or `clinic_admin`). Restricted to `clinic_admin` of that clinic or `platform_admin`.
- `DELETE /clinics/:clinicId/memberships/:userId`: Revokes membership. Restricted to `clinic_admin` of that clinic or `platform_admin`.

#### Users (`/users`)
- `GET /users`: Lists all provisioned users. Restricted to `platform_admin`.
- `GET /users/me`: Returns the current authenticated user's identity and clinic memberships.

## Request validation

- Validate all client-provided path parameters, query parameters, and request bodies.
- Document accepted formats, required fields, length limits, ranges, and allowed values for each endpoint.
- Return `400 Bad Request` when request data is invalid, using the standard error format described above.
- Do not expose internal implementation details in validation error messages.

## Filtering and sorting

- Pass filters and sorting options as query parameters.
- Each endpoint documents the filters and sorting options it supports.
- Filter values use the API's documented formats and enum values.
- Use a deterministic default sort order for collection endpoints.

## Pagination

- Use cursor-based pagination for collections that may grow large.
- Accept `limit` and `cursor` as query parameters; cursors are opaque to clients.
- Return paginated collections as an object containing `items`, `nextCursor`, and `hasMore`.
- Keep pagination order stable so clients can continue through the collection reliably.

## AI-generated content

- Clearly identify content generated by AI.
- Treat AI-generated reports as informational, not as veterinary diagnosis or treatment advice.
- Do not present generated conclusions as certain facts.
