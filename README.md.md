# Product Lifecycle Traceability System (PLTS)

## Technical Documentation and Software Requirements Specification

**Document version:** 1.0  
**Project snapshot reviewed:** 10 August 2026  
**Repository modules:** `backend/plts` and `frontend/plts-frontend`  
**Audience:** product owners, developers, QA engineers, DevOps engineers, and reviewers

---

## 1. Purpose and scope

PLTS is a web application for recording and exposing the lifecycle of a product order across an organization and its supply-chain stakeholders. An organization creates an order, assigns it through manufacturing, quality assurance, packaging/transport, and retail, and each completed event is recorded as a timestamped lifecycle stage. A public user can look up an order number and view its traceability timeline without signing in.

The repository contains a single-page Angular frontend and a Spring Boot REST API. The backend is the source of truth for users, organizations, stakeholders, orders, lifecycle stages, notifications, OTPs, and limited audit records.

### 1.1 Implemented capabilities

- Organization registration, email verification, password plus OTP login, and JWT issuance.
- Stakeholder creation for manufacturer, QA, packaging/transport, and retailer roles. Each receives a generated ID and can use OTP login.
- Sequential order lifecycle assignment and status-update endpoints.
- Timestamped lifecycle stages, in-application notifications, and email notifications for key assignments and completions.
- Organization dashboard analytics.
- Public traceability lookup by order number.
- QR-code generation for order numbers, PDF certificate export for one order, and Excel export for an organization's orders.

### 1.2 Scope boundaries

The application records supplied document **URLs**; it does not upload or store files. It currently uses an in-memory H2 database and is therefore a development/demo configuration, not durable production storage. There is no payment, inventory, route optimization, or external ERP integration in the current codebase.

---

## 2. Architecture

```text
Browser
  |
  | Angular standalone SPA (default dev server: :4200)
  | HTTP requests; JWT bearer token added when available
  v
Spring Boot REST API (default: :8085)
  |-- Authentication: BCrypt + OTP email + JWT
  |-- Domain services: orders, stakeholders, analytics, notifications
  |-- Exports: QR / PDF / XLSX
  |-- Spring Data JPA
  v
H2 in-memory database

Supporting outbound service: SMTP server for OTP, welcome, assignment, and completion emails
```

### 2.1 Backend layers

| Layer | Location | Responsibility |
|---|---|---|
| Bootstrap | `backend/plts/.../PltsApplication.java` | Starts Spring Boot. |
| Controllers | `controller/` | Defines REST endpoints and response envelopes. |
| Services | `service/` | Implements authentication, workflow updates, exports, email, analytics, and notification behavior. |
| Repositories | `repository/` | JPA persistence operations and derived/custom queries. |
| Entities | `entity/` | Database tables and entity relationships. |
| DTOs | `dto/` | API request/response models and validation annotations. |
| Security | `security/`, `config/SecurityConfig.java` | JWT parsing, security context, password encoder, CORS, and route protection. |
| Utilities | `util/QrCodeGenerator.java` | Turns an order number into PNG/base64 QR data. |

### 2.2 Frontend layers

| Layer | Location | Responsibility |
|---|---|---|
| Bootstrap/configuration | `src/main.ts`, `src/app/app.config.ts` | Bootstraps the standalone app, router, HTTP client, and interceptor. |
| Routes | `src/app/app.routes.ts` | Maps public, authentication, organization, and stakeholder views. |
| Core services | `src/app/core/services/` | Typed HTTP access to backend API groups and browser session handling. |
| HTTP interceptor | `src/app/core/interceptors/auth.interceptor.ts` | Attaches `Authorization: Bearer <token>` to every request when a session exists. |
| Models | `src/app/core/models/plts.models.ts` | TypeScript representation of API roles, statuses, payloads, and responses. |
| Feature views | `src/app/features/` | Login, signup, public tracing, organization, and stakeholder workflow screens. |
| Shared UI | `src/app/shared/components/` | Global navbar, notifications UI, and role-aware sidebar. |

---

## 3. User roles and lifecycle

### 3.1 Roles

| Role | Identifier form | Main responsibility |
|---|---|---|
| `ORGANIZATION` | Email/password | Owns orders, maintains stakeholders, assigns the next stage, exports reports. |
| `MANUFACTURER` | `MAN-######` | Accepts/rejects manufacturing work and submits manufacturing completion details. |
| `QA` | `QA-######` | Accepts/rejects inspection work and submits a pass/fail report. |
| `PACKAGING_TRANSPORT` | `PT-######` | Accepts packaging work, records dispatch details, and confirms transport completion. |
| `RETAILER` | `RET-######` | Confirms delivery and closes the lifecycle / marks product available. |

New stakeholder IDs are generated per role from the role's current record count, then checked against existing user IDs. A stakeholder has a `User` record, is initially active and verified, and receives a welcome email containing the generated ID.

### 3.2 Intended order progression

```text
CREATED
  -> MANUFACTURER_ASSIGNED -> MANUFACTURING -> MANUFACTURING_COMPLETED
  -> QA_ASSIGNED           -> QA_IN_PROGRESS -> QA_COMPLETED
  -> PACKAGING_ASSIGNED    -> PACKAGING_IN_PROGRESS -> PACKAGING_COMPLETED
  -> TRANSPORT_COMPLETED   -> RETAILER_ASSIGNED -> DELIVERED -> COMPLETED

Any stakeholder rejection, or a failed QA report, can set the order to REJECTED.
```

| Actor | Action parameter | Status written | Important data recorded |
|---|---|---|---|
| Organization | create order | `CREATED` | Initial lifecycle stage and order-created audit record. |
| Organization | assign manufacturer | `MANUFACTURER_ASSIGNED` | Manufacturer, assignment remarks, lifecycle stage, notification/email. |
| Manufacturer | `ACCEPT` | `MANUFACTURING` | Manufacturing-start stage. |
| Manufacturer | `REJECT` | `REJECTED` | Rejection stage; optional notes. |
| Manufacturer | `COMPLETE` | `MANUFACTURING_COMPLETED` | Completion notes/document URL and organization notification/email. |
| Organization | assign QA | `QA_ASSIGNED` | QA stakeholder, stage, notification/email. |
| QA | `ACCEPT` | `QA_IN_PROGRESS` | QA-in-progress stage. |
| QA | `REJECT` | `REJECTED` | Rejection stage. |
| QA | `SUBMIT_REPORT` with `passed=true` | `QA_COMPLETED` | QA remarks/report URL; organization notification. |
| QA | `SUBMIT_REPORT` with `passed=false` | `REJECTED` | QA remarks/report URL; failure notification. |
| Organization | assign packaging/transport | `PACKAGING_ASSIGNED` | Stakeholder, stage, notification/email. |
| Packaging/transport | `ACCEPT` | `PACKAGING_IN_PROGRESS` | Packaging-start stage. |
| Packaging/transport | `DISPATCH` | `PACKAGING_COMPLETED` | Tracking number, vehicle details, estimated delivery. |
| Packaging/transport | `MARK_TRANSPORT_COMPLETE` | `TRANSPORT_COMPLETED` | Transport-complete stage and organization notification. |
| Organization | assign retailer | `RETAILER_ASSIGNED` | Retailer, stage, notification/email. |
| Retailer | `CONFIRM_DELIVERY` | `DELIVERED` | Delivery-confirmed stage. |
| Retailer | `CLOSE_LIFECYCLE` or `MARK_AVAILABLE` | `COMPLETED` | Final stage and organization notification/email. |

Every status-changing service method adds a `LifecycleStage`, which is the ordered timeline returned to the organization and public user.

---

## 4. Data model

All entity timestamps are generated in application code with `LocalDateTime`. Hibernate is configured with `ddl-auto: update`; table creation and changes are inferred from these entities during development.

| Entity/table | Key fields | Relationships and purpose |
|---|---|---|
| `User` / `users` | email (unique), BCrypt password for organization users, role, generated user ID (unique), verified, active | One organization user or one stakeholder user; subject used by JWT/security. |
| `Organization` / `organizations` | name, email (unique), phone, address, GST number, company registration number | One-to-one with `User`; owns stakeholders and orders. |
| `Stakeholder` / `stakeholders` | generated ID, role, company name/email, person in charge, contact details, active | Many-to-one organization; one-to-one user; may be assigned to orders by role. |
| `Order` / `orders` | order number (unique), product details, quantity, priority, status, shipping/QA/manufacturing fields, optimistic-lock `version` | Many-to-one organization; optional many-to-one reference to each stage stakeholder; one-to-many lifecycle stages. |
| `LifecycleStage` / `lifecycle_stages` | status, title, responsible company/role, remarks, attachment URL, performer, timestamp | Many-to-one order; preserves each lifecycle event. |
| `Notification` / `notifications` | recipient, title, message, type, read flag, related order ID, timestamp | Many-to-one user; supplies the notification dropdown. |
| `OtpToken` / `otp_tokens` | identifier, code, purpose, expiry, used flag | Stores one-time codes for registration, organization login, and stakeholder login. Tokens expire after 10 minutes. |
| `AuditLog` / `audit_logs` | action, performer, role, resource, details, timestamp | Presently records organization order creation and stakeholder creation. |

### 4.1 Enumerations

| Enum | Values |
|---|---|
| `Role` | `ORGANIZATION`, `MANUFACTURER`, `QA`, `PACKAGING_TRANSPORT`, `RETAILER` |
| `OrderPriority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `OrderStatus` | `CREATED`, `MANUFACTURER_ASSIGNED`, `MANUFACTURING`, `MANUFACTURING_COMPLETED`, `QA_ASSIGNED`, `QA_IN_PROGRESS`, `QA_COMPLETED`, `PACKAGING_ASSIGNED`, `PACKAGING_IN_PROGRESS`, `PACKAGING_COMPLETED`, `TRANSPORT_COMPLETED`, `RETAILER_ASSIGNED`, `DELIVERED`, `COMPLETED`, `REJECTED` |
| `NotificationType` | `SYSTEM`, `OTP`, `STAKEHOLDER_ADDED`, `ORDER_ASSIGNED`, `ORDER_UPDATED`, `STAGE_COMPLETED`, `LIFECYCLE_COMPLETED` |

---

## 5. API contract

### 5.1 Common conventions

- Base backend URL in the frontend: `http://localhost:8085`.
- Versioned API prefix: `/api/v1`.
- Except for file downloads, successful responses use the following envelope:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {},
  "timestamp": "2026-08-10T12:34:56"
}
```

- Validation errors return HTTP 400 with `success: false`, `message: "Validation failed"`, and a map of field errors in `data`. Illegal arguments/state return HTTP 400. Other unhandled errors return HTTP 500.
- `/api/v1/auth/**` and `/api/v1/public/**` are public. All other API routes require a valid bearer JWT under the current configuration.
- Values marked as optional may be omitted or sent as `null` unless the endpoint-level validation rules state otherwise.

### 5.2 Authentication endpoints

| Method and path | Request body | Result |
|---|---|---|
| `POST /api/v1/auth/register-org` | `name`, `email`, `password`, `companyRegistrationNumber`; optional `phone`, `address`, `gstNumber` | Creates an unverified organization and sends verification OTP. |
| `POST /api/v1/auth/verify-org-otp` | `identifier` (email), `otp` | Verifies registration OTP and returns an auth response with JWT. |
| `POST /api/v1/auth/login-org` | `email`, `password` | Validates credentials and sends a login OTP. |
| `POST /api/v1/auth/verify-org-login-otp` | `identifier` (email), `otp` | Verifies login OTP and returns a JWT. |
| `POST /api/v1/auth/send-stakeholder-otp` | `generatedUserId` | Sends login OTP to stakeholder company email. |
| `POST /api/v1/auth/verify-stakeholder-otp` | `identifier` (generated user ID), `otp` | Verifies OTP and returns stakeholder JWT/session profile. |

`AuthResponse` contains `token`, `tokenType` (`Bearer`), `userId`, `email`, optional `generatedUserId`, `role`, `name`, `companyName`, `organizationId`, and `verified`.

### 5.3 Stakeholder endpoints

| Method and path | Authentication | Body/query | Result |
|---|---|---|---|
| `POST /api/v1/organizations/{orgId}/stakeholders` | Required | `companyName`, `companyEmail`, `personInCharge`, `role`; optional phone, address, notes | Creates a stakeholder and generated login ID. |
| `GET /api/v1/organizations/{orgId}/stakeholders` | Required | Optional `role` | Returns all, or role-filtered, stakeholders for an organization. |
| `GET /api/v1/stakeholders/{id}` | Required | — | Returns one stakeholder. |

### 5.4 Order and workflow endpoints

| Method and path | Body/query | Result |
|---|---|---|
| `POST /api/v1/orders/org/{orgId}` | `productName`, `quantity`, `priority`; optional description, expected delivery date, remarks | Creates order. Quantity must be at least 1; expected date must be today/future when provided. |
| `GET /api/v1/orders/org/{orgId}` | — | Lists organization orders. |
| `GET /api/v1/orders/stakeholder/{stakeholderId}?role={role}` | role required | Lists orders assigned to a stakeholder ID in the supplied role. |
| `GET /api/v1/orders/stakeholder/user/{userId}?role={role}` | role required | Finds the stakeholder profile for the user, confirms its role, then lists assigned orders. |
| `GET /api/v1/orders/{id}` | — | Returns an order, all assigned stakeholders, and lifecycle stages. |
| `POST /api/v1/orders/{id}/assign-manufacturer` | `stakeholderId`, optional `remarks` | Assigns a stakeholder with role `MANUFACTURER`. |
| `POST /api/v1/orders/{id}/manufacturer-status?action={ACCEPT|REJECT|COMPLETE}` | For completion/rejection: optional `notes`, `documentUrl` | Updates manufacturing stage. |
| `POST /api/v1/orders/{id}/assign-qa` | `stakeholderId`, optional `remarks` | Assigns QA stakeholder. |
| `POST /api/v1/orders/{id}/qa-status?action={ACCEPT|REJECT|SUBMIT_REPORT}` | For report: `qaRemarks`, `passed`, optional `qaReportUrl` | Updates QA stage; a failed report rejects the order. |
| `POST /api/v1/orders/{id}/assign-packaging` | `stakeholderId`, optional `remarks` | Assigns packaging/transport stakeholder. |
| `POST /api/v1/orders/{id}/packaging-status?action={ACCEPT|DISPATCH|MARK_TRANSPORT_COMPLETE}` | Dispatch: `trackingNumber`, `vehicleDetails`, optional `estimatedDelivery` | Updates packaging/transport stage. |
| `POST /api/v1/orders/{id}/assign-retailer` | `stakeholderId`, optional `remarks` | Assigns retailer stakeholder. |
| `POST /api/v1/orders/{id}/retailer-status?action={CONFIRM_DELIVERY|CLOSE_LIFECYCLE|MARK_AVAILABLE}` | — | Updates retailer/completion stage. |
| `GET /api/v1/orders/{id}/qr-code` | — | Returns order number and a `data:image/png;base64,...` QR image. |
| `GET /api/v1/orders/{id}/export-pdf` | — | Downloads `application/pdf` lifecycle certificate. |
| `GET /api/v1/orders/org/{orgId}/export-excel` | — | Downloads XLSX order report. |

### 5.5 Analytics, notifications, and public traceability

| Method and path | Authentication | Purpose |
|---|---|---|
| `GET /api/v1/analytics/org/{orgId}?userId={optional}` | Required | Counts stakeholder types, total/completed/pending orders, unread notifications for supplied user ID, and orders by status. |
| `GET /api/v1/notifications/user/{userId}` | Required | Lists user notifications, newest first. |
| `GET /api/v1/notifications/user/{userId}/unread-count` | Required | Returns unread count. |
| `PUT /api/v1/notifications/{id}/read` | Required | Marks one notification read. |
| `PUT /api/v1/notifications/user/{userId}/read-all` | Required | Marks all user notifications read. |
| `DELETE /api/v1/notifications/{id}` | Required | Deletes one notification. |
| `GET /api/v1/public/traceability/{orderNumber}` | Public | Returns product/order details and the lifecycle timeline suitable for public display. |

### 5.6 Important implementation note: access control

Authentication is enforced for protected routes, but the controllers currently do **not** compare the JWT identity/role with `orgId`, `userId`, stakeholder ID, order ownership, or notification recipient. Treat role/ownership authorization as a required production hardening item; the SRS specifies the intended rule in section 11.

---

## 6. Frontend behavior and routes

| Route | Component | Behavior |
|---|---|---|
| `/traceability` | `PublicTraceabilityComponent` | Public order-number search and timeline. Supports `?orderId=...` from navbar search. |
| `/signup` | `AuthSignupComponent` | Organization registration and OTP verification flow. |
| `/login` | `AuthLoginComponent` | Organization password/OTP flow and stakeholder ID/OTP flow. |
| `/org/dashboard` | `OrgDashboardComponent` | Organization analytics and recent-order summary. |
| `/org/stakeholders` | `OrgStakeholdersComponent` | Role filter and stakeholder creation. |
| `/org/orders` | `OrgOrdersComponent` | Create orders, assign next role, view status, and download PDF/XLSX exports. |
| `/org/notifications` | `OrgOrdersComponent` | Currently mapped to the orders component rather than a distinct notifications page. |
| `/stakeholder/dashboard` | `StakeholderDashboardComponent` | Role-specific task actions, manufacturing completion, QA report, and dispatch dialogs. |

The root route redirects to `/traceability`; unknown routes do the same. The navbar exposes public search and the logged-in notification/user menu. Session data (`plts_token`, `plts_user`) is held in browser `localStorage`; Angular signals maintain the in-memory session state.

There are currently no Angular route guards. A user can navigate directly to protected UI paths, although API calls should fail without a token.

---

## 7. Dependencies and libraries

Versions below are the direct dependency declarations in `pom.xml` and `package.json`. Spring Boot manages the versions of its starter transitive dependencies. `package-lock.json` pins the complete npm dependency tree for reproducible frontend installs; it should be used with `npm ci` in CI.

### 7.1 Backend platform and direct dependencies

| Dependency / tool | Version | Scope | Purpose in PLTS |
|---|---:|---|---|
| Java | 21 | Runtime/build | Java language/runtime target. |
| Maven Wrapper (`mvnw`) | repository-provided | Build | Reproducible Maven invocation without a globally installed Maven. |
| Spring Boot parent | 3.3.0 | Build/dependency management | Configures compatible Spring, logging, test, and plugin versions. |
| `spring-boot-starter-web` | managed by Boot | Runtime | Spring MVC REST controllers, JSON serialization, embedded web server. |
| `spring-boot-starter-security` | managed by Boot | Runtime | Security filter chain, authentication integration, BCrypt encoder. |
| `spring-boot-starter-validation` | managed by Boot | Runtime | Jakarta Bean Validation used by `@Valid`, `@NotBlank`, `@Email`, etc. |
| `spring-boot-starter-mail` | managed by Boot | Runtime | SMTP email delivery through `JavaMailSender`. |
| `spring-boot-starter-data-jpa` | managed by Boot | Runtime | JPA/Hibernate ORM and Spring Data repositories. |
| H2 | managed by Boot | runtime | Embedded in-memory relational database for the configured development profile. |
| JJWT: `jjwt-api` | 0.12.5 | compile | JWT creation/parsing API. |
| JJWT: `jjwt-impl` | 0.12.5 | runtime | JWT implementation. |
| JJWT: `jjwt-jackson` | 0.12.5 | runtime | Jackson JSON support for JWT claims. |
| Lombok | 1.18.40 | provided + annotation processor | Generates getters, setters, builders, constructors, logging fields, and DTO boilerplate at compile time. |
| MapStruct | 1.5.5.Final | compile + annotation processor | Mapping-code generator included in build; no mapper interfaces currently use it. |
| `lombok-mapstruct-binding` | 0.2.0 | annotation processor | Coordinates Lombok and MapStruct annotation processing. |
| ZXing `core` | 3.5.3 | compile | QR matrix encoding. |
| ZXing `javase` | 3.5.3 | compile | Writes QR matrix to PNG stream. |
| Apache POI `poi-ooxml` | 5.2.5 | compile | Creates the organization Excel/XLSX lifecycle report. |
| OpenPDF | 1.3.30 | compile | Creates order lifecycle PDF certificate. |
| springdoc OpenAPI WebMVC UI | 2.5.0 | runtime | Publishes OpenAPI JSON and Swagger UI. |
| Spring Boot DevTools | managed by Boot | optional runtime | Development restart/reload support; not intended as a production dependency. |
| `spring-boot-starter-test` | managed by Boot | test | JUnit/Spring testing support. |
| `spring-security-test` | managed by Boot | test | Security-focused test helpers. |
| `spring-boot-maven-plugin` | managed by Boot | build | Packages/runs executable Spring Boot application. |
| `maven-compiler-plugin` | 3.13.0 | build | Compiles Java 21 source and configures annotation processors. |

### 7.2 Frontend runtime dependencies

| Dependency | Declared version | Purpose in PLTS |
|---|---:|---|
| `@angular/core` | `^21.2.0` | Component model, dependency injection, signals, bootstrap configuration. |
| `@angular/common` | `^21.2.0` | Common directives/pipes and HTTP support imports. |
| `@angular/compiler` | `^21.2.0` | Compiles Angular templates. |
| `@angular/forms` | `^21.2.0` | Template-driven forms and `ngModel` used by login and workflow dialogs. |
| `@angular/platform-browser` | `^21.2.0` | Browser application bootstrap. |
| `@angular/router` | `^21.2.0` | SPA routes, links, redirects, and query parameters. |
| `rxjs` | `~7.8.0` | Observable-based `HttpClient` responses and operators such as `tap`. |
| `tslib` | `^2.3.0` | TypeScript runtime helpers. |
| `zone.js` | `^0.16.2` | Angular async change-detection integration; loaded from `main.ts`. |

### 7.3 Frontend development dependencies

| Dependency | Declared version | Purpose |
|---|---:|---|
| `@angular/build` | `^21.2.19` | Application build and development server builders. |
| `@angular/cli` | `^21.2.19` | `ng` scaffolding, serve, build, and test commands. |
| `@angular/compiler-cli` | `^21.2.0` | Angular ahead-of-time compilation tooling. |
| TypeScript | `~5.9.2` | Type checking and JavaScript transpilation. |
| Vitest | `^4.0.8` | Unit-test runner used by Angular's test builder. |
| jsdom | `^28.0.0` | Browser-like DOM environment for tests. |
| Prettier | `^3.8.1` | Optional source-code formatter; no formatting script is defined. |

### 7.4 CSS, icon, and font dependencies loaded at runtime

These dependencies are not listed in `package.json`, but `src/index.html` loads them from third-party CDNs at browser runtime.

| External resource | Version | Purpose and implication |
|---|---:|---|
| Tailwind CSS CDN (`cdn.tailwindcss.com`) | Unpinned | Supplies the utility classes used extensively in component templates and accepts the inline brand/dark-mode configuration. It is a production dependency even though it is not an npm dependency. Pin or self-host a compiled Tailwind build for reproducible, CSP-friendly production releases. |
| Google Fonts: Inter and Outfit | Provider-managed | Provides the body and heading font families configured in the Tailwind theme. |
| Google Material Symbols Outlined | Provider-managed | Provides the icon glyphs used in navigation, buttons, status cards, and dialogs. |
| Local CSS | Repository source | `src/styles.css` adds custom gradients, glass-card utilities, scrollbar styling, transitions, and Material Symbol alignment. |

---

## 8. Configuration, development, and operations

### 8.1 Runtime defaults

| Setting | Current default | Notes |
|---|---|---|
| Backend port | `8085` | Set in `backend/plts/src/main/resources/application.yml`. |
| Frontend dev port | `4200` | Angular CLI standard dev-server port. |
| Database | H2 memory database `pltsdb` | Resets when process stops; `DB_CLOSE_DELAY=-1` only retains data while JVM lives. |
| H2 console | `/h2-console` | Enabled and frame access allowed in current configuration. |
| Swagger UI | `/swagger-ui.html` | Springdoc UI. |
| OpenAPI JSON | `/v3/api-docs` | Generated OpenAPI document. |
| JWT lifetime | 86,400,000 ms (24 hours) | Configured under `app.jwt.expiration-ms`. |
| OTP lifetime | 10 minutes | Defined in `AuthService`. |

### 8.2 Environment configuration

Spring optionally imports `backend/plts/.env` when the backend is started from its module directory. Environment variables take precedence. Configure these values per environment; do not commit real credentials or private JWT signing keys.

| Property / environment variable | Purpose |
|---|---|
| `SPRING_MAIL_HOST` / `spring.mail.host` | SMTP server hostname. |
| `SPRING_MAIL_PORT` / `spring.mail.port` | SMTP port. |
| `SPRING_MAIL_USERNAME` / `spring.mail.username` | SMTP account name. |
| `SPRING_MAIL_PASSWORD` / `spring.mail.password` | SMTP password or provider app password. |
| `SPRING_MAIL_SMTP_AUTH` | Enable SMTP authentication. |
| `SPRING_MAIL_STARTTLS_ENABLE`, `SPRING_MAIL_STARTTLS_REQUIRED` | Enable/require STARTTLS. |
| `SPRING_MAIL_SSL_ENABLE` | Enable implicit SMTP SSL. |
| `MAIL_FROM` / `app.mail.from` | Sender address. |
| `app.jwt.secret` | JWT signing secret; inject a long random secret through secure environment configuration in deployment. |
| `spring.datasource.*` | Database URL/driver/credentials; replace H2 settings with a durable production database configuration. |

### 8.3 Local setup

Prerequisites: JDK 21, Node.js compatible with Angular 21 (the resolved Angular tooling requires Node 20.19+, 22.12+, or newer), and an SMTP account if email flows are to be tested.

```bash
# Terminal 1 — backend
cd backend/plts
./mvnw spring-boot:run

# Terminal 2 — frontend
cd frontend/plts-frontend
npm ci
npm start
```

Then open `http://localhost:4200`. Use `./mvnw test` for backend tests, `npm run build` for a production frontend build, and `npm test`/`ng test` for frontend tests.

### 8.4 Build outputs and test posture

- Maven builds an executable backend JAR under `backend/plts/target/`.
- Angular builds files under `frontend/plts-frontend/dist/`.
- The backend test suite currently contains an application-context smoke test only.
- The frontend contains the generated application test scaffold; feature/API behavior needs broader unit and end-to-end coverage.

---

## 9. Security and production-readiness notes

This section documents the code as it exists and the controls needed before a production release.

1. **Remove and rotate repository secrets.** Mail credentials and a JWT secret must never be embedded in tracked configuration or examples. Revoke any exposed credentials, store new values in a secret manager/CI environment, and keep only placeholders in examples.
2. **Enforce authorization, not only authentication.** Implement role and ownership checks for organization IDs, order mutations, stakeholder task updates, analytics, and notification reads/writes. The current filter authenticates requests but controllers do not enforce these relationships.
3. **Use a durable database and migrations.** Replace in-memory H2 and `ddl-auto: update` with a managed database plus Flyway or Liquibase migrations, backups, and schema review.
4. **Restrict browser and developer access.** Replace wildcard CORS with an allow-list of trusted frontend origins; disable H2 console and Swagger UI (or protect them) outside development.
5. **Harden tokens and browser storage.** Keep signing keys outside source control, use HTTPS, select a short access-token lifetime/refresh strategy, and consider HttpOnly secure cookies rather than `localStorage` to reduce XSS token exposure.
6. **Validate workflow transitions server-side.** Confirm order's current status, required assignee, active status, and caller identity before every action. The service currently maps recognized action strings to statuses without a finite-state transition guard.
7. **Protect OTP authentication.** Hash OTPs at rest, rate-limit send/verify requests, throttle repeated failures, record security events, and avoid account enumeration in error messages.
8. **Make order IDs collision-safe.** The number combines date and random four-digit suffix. Its database uniqueness constraint prevents duplicates but a collision produces an error; replace it with retry/sequence/UUID-based generation.
9. **Treat document URLs as untrusted input.** Validate allowed schemes/domains and add signed object storage, malware scanning, retention, and authorization if file upload is introduced.
10. **Improve auditing and observability.** Record every assignment/status change with authenticated actor, preserve logs externally, add structured monitoring, health checks, and alerting.

---

## 10. Software Requirements Specification (SRS)

### 10.1 Introduction

**Product name:** Product Lifecycle Traceability System (PLTS)  
**Objective:** give an organization and its authorized supply-chain stakeholders a reliable, traceable record of an order from creation through retail availability, while offering an appropriately limited public verification view.

The requirements below use `shall` for required behavior. They reflect the intended product. Section 12 highlights places where the current implementation does not fully meet them.

### 10.2 Stakeholders

| Stakeholder | Interest |
|---|---|
| Organization administrator | Onboards organization, creates orders, manages counterparties, monitors and advances workflow. |
| Manufacturer | Receives manufacturing work and records production completion/rejection. |
| QA inspector | Receives inspection work and records pass/fail evidence. |
| Packaging/transport operator | Records packaging, dispatch, shipment details, and transport completion. |
| Retailer | Confirms receipt and product availability. |
| Public consumer/auditor | Verifies an order's non-sensitive lifecycle history by order number/QR code. |
| System administrator/DevOps | Operates, secures, monitors, backs up, and deploys the system. |

### 10.3 Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall let an organization register with name, email, password, and company registration number, and shall reject duplicate email or registration number. | Must |
| FR-02 | The system shall require a time-limited email OTP before an organization account becomes verified. | Must |
| FR-03 | The system shall require a valid organization password and a second time-limited OTP before issuing an organization session token. | Must |
| FR-04 | The system shall generate a unique role-prefixed ID for each stakeholder and shall support OTP login using that ID. | Must |
| FR-05 | The organization shall be able to create, list, filter, and view stakeholders belonging only to itself. | Must |
| FR-06 | The organization shall be able to create an order with product name, positive quantity, priority, optional description, optional current/future expected date, and remarks. | Must |
| FR-07 | The system shall generate a unique, immutable public order number for every order. | Must |
| FR-08 | The organization shall be able to assign only an active stakeholder of the required role for the next permissible lifecycle stage. | Must |
| FR-09 | The system shall enforce the state transitions defined in section 3.2 and shall reject out-of-order or terminal-state updates. | Must |
| FR-10 | Only the stakeholder assigned to an order and holding the appropriate role shall be able to accept, reject, or complete that stakeholder's task. | Must |
| FR-11 | Every assignment, status transition, report, rejection, and delivery confirmation shall create an immutable, chronologically ordered lifecycle event containing actor, role, timestamp, and relevant remarks/evidence reference. | Must |
| FR-12 | A QA report shall require a pass/fail outcome and remarks. A failed report shall move the order to a rejection/exception state. | Must |
| FR-13 | Dispatch shall require tracking number and vehicle details; estimated delivery shall be supported. | Must |
| FR-14 | The system shall notify the assignee when an order is assigned and notify the organization when a stage completes, fails, or the lifecycle completes. | Should |
| FR-15 | Authorized users shall be able to view their notifications, mark them read, mark all read, and delete their own notifications. | Must |
| FR-16 | The organization dashboard shall show stakeholder counts by role, total/completed/pending orders, unread notifications, and orders grouped by current status. | Should |
| FR-17 | The system shall provide a public read-only traceability lookup by order number and QR code without revealing credentials, private contact details, or internal-only data. | Must |
| FR-18 | The organization shall be able to download a PDF certificate for an order and an XLSX report for its orders. | Should |
| FR-19 | The API shall provide consistent success/error response formats, input validation errors, and stable versioned endpoints. | Must |
| FR-20 | Authorized operations shall be recorded in an audit trail that can be queried by authorized administrators. | Must |

### 10.4 Authorization matrix

| Capability | Organization | Assigned stakeholder | Other authenticated user | Public user |
|---|---:|---:|---:|---:|
| Register/login | Own account | Own account | Own account | — |
| Create/manage organization stakeholders | Yes, own organization | No | No | No |
| Create/list own orders | Yes | Assigned orders read-only | No | No |
| Assign next lifecycle stakeholder | Yes, own orders | No | No | No |
| Update assigned workflow task | No | Yes, own assigned task only | No | No |
| Read notification / mark/delete | Own only | Own only | No | No |
| Download own organization reports | Yes | No | No | No |
| Public traceability read | Optional | Optional | Optional | Yes, sanitized only |

### 10.5 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 Security | All non-public traffic shall require authenticated HTTPS sessions. Authorization shall be enforced server-side for role, organization, order, and notification ownership. |
| NFR-02 Secrets | Credentials, SMTP passwords, private keys, and JWT secrets shall be held outside source control in a managed secret store. |
| NFR-03 Data integrity | Database constraints, transactions, optimistic locking, and validated state transitions shall prevent duplicate or conflicting lifecycle updates. |
| NFR-04 Availability/durability | Production order, lifecycle, audit, and notification data shall use persistent storage with backups and recovery procedures. |
| NFR-05 Performance | For normal operations, standard list/detail/traceability calls should complete within 2 seconds at the 95th percentile under the agreed load profile; exports may use asynchronous processing for large data sets. |
| NFR-06 Privacy | Public views shall expose only approved traceability fields. Personally identifiable contact data and internal remarks shall not be public by default. |
| NFR-07 Accessibility | Frontend screens shall support keyboard operation, semantic labels, visible focus states, responsive layouts, and WCAG 2.1 AA contrast/interaction targets. |
| NFR-08 Compatibility | The frontend shall support currently supported evergreen browsers. The build environment shall use a Node.js version supported by the locked Angular toolchain and Java 21 for backend build/runtime. |
| NFR-09 Observability | Production service shall emit structured logs, metrics, health endpoints, audit events, and alerts for authentication, mail delivery, database, and workflow failures. |
| NFR-10 Testability | Automated tests shall cover validation, authorization, state transitions, email failure behavior, exports, and public data redaction. |
| NFR-11 Maintainability | API schemas shall be documented in OpenAPI, database migrations shall be versioned, and all externally visible behavior shall have changelog/release notes. |

### 10.6 Data requirements

- `orderNumber`, organization email, user email, and stakeholder generated ID shall be unique according to their applicable scopes.
- Quantity shall be a positive integer; priority shall be one of the supported enum values.
- Expected delivery date, when present at order creation, shall be today or later.
- OTPs shall be single-use, expire after a configurable duration, and be rate-limited.
- Lifecycle events shall be append-only. If an error must be corrected, the system shall retain the original event and create a corrective event rather than rewrite history.
- The public traceability projection shall never include password hashes, OTPs, personal phone/address/email data, internal documents without authorization, or private notes unless explicitly approved by privacy policy.

### 10.7 External interfaces

| Interface | Requirement |
|---|---|
| Web UI | Angular SPA over HTTPS. |
| REST API | JSON over HTTPS under versioned `/api/v1` paths; bearer JWT for protected endpoints. |
| Email | SMTP or managed email provider for OTP and workflow messages. Delivery failures shall be logged and surfaced/retried under defined policy. |
| Database | Relational, transaction-capable production database with managed migrations. |
| QR | QR payload shall be an opaque, resolvable public traceability identifier; avoid embedding sensitive business data. |
| File evidence (future) | Authenticated object storage with signed access, validation/scanning, retention, and audit controls. |

### 10.8 Acceptance criteria

1. A new organization can register, receive an OTP, verify, and receive a valid JWT; duplicate registrations are rejected.
2. An organization can create one stakeholder of each operational role and each receives a unique generated ID.
3. A stakeholder can authenticate by generated ID and valid OTP, then sees only its own assigned tasks.
4. An order can progress through the full successful route from `CREATED` to `COMPLETED`, creating one or more ordered lifecycle stages for every event.
5. A QA failure changes the order to `REJECTED`, includes report remarks, and notifies the organization.
6. Attempts to assign an incorrect role, make an out-of-order transition, or modify another party's resource receive an authorization/validation error and do not change the order.
7. Public lookup returns the expected sanitized timeline for a valid order number and does not disclose internal/private fields.
8. PDF and Excel exports contain values corresponding to the requesting organization's data only.
9. Email/notification events are created for assignment and milestone completion, and delivery failure is observable without corrupting the order transaction.
10. Automated test suite exercises all critical paths above in CI.

---

## 11. Recommended API payload examples

Create an order:

```json
{
  "productName": "Temperature Sensor",
  "description": "Industrial sensor, batch A",
  "quantity": 250,
  "expectedDeliveryDate": "2026-09-15",
  "priority": "HIGH",
  "remarks": "Handle as a calibrated batch"
}
```

Assign a stakeholder:

```json
{
  "stakeholderId": 42,
  "remarks": "Complete by the agreed delivery target"
}
```

Submit QA report:

```json
{
  "passed": true,
  "qaRemarks": "Sample checks passed within tolerance.",
  "qaReportUrl": "https://approved-document-store.example/reports/ORD-..."
}
```

Dispatch shipment:

```json
{
  "trackingNumber": "TRK-000123",
  "vehicleDetails": "Sealed vehicle / carrier reference",
  "estimatedDelivery": "2026-09-12"
}
```

---

## 12. Implementation alignment and backlog

The following table prevents the SRS from being mistaken for a claim that every required control has already been implemented.

| Area | Present implementation | Work needed to meet production SRS |
|---|---|---|
| Login/OTP/JWT | Implemented; six-digit OTP and 10-minute expiry, BCrypt organization password. | Hash OTPs, rate limit, monitor failures, harden account-enumeration behavior. |
| API authentication | Protected routes require JWT except auth/public/developer routes. | Add endpoint-level RBAC and resource-ownership checks. |
| Lifecycle persistence | Order status and timestamped stages are written transactionally. | Enforce a formal state machine, assignee/caller validation, exception/rework path, and append-only protections. |
| Audit logs | Created for order and stakeholder creation. | Audit every protected create/update/read-as-needed action and provide secured audit search/export. |
| Data persistence | H2 in-memory database; JPA schema update. | Production RDBMS, migrations, backups, retention, and disaster recovery. |
| API validation | Registration and order creation use `@Valid`. | Apply `@Valid` consistently to assignment/progress requests and validate all semantic rules. |
| Notifications | Database notifications and direct synchronous SMTP messages. | Retry/outbox/queue, delivery status, templates/configuration per environment. |
| Public traceability | Public endpoint returns current stage and timeline. | Explicit field-redaction policy, anti-enumeration/rate limits, QR URL/opaque token design. |
| Frontend routing | Routes and role-aware presentation exist. | Add route guards, API error UX, loading/error states, accessibility review, and configuration-based API URL. |
| Testing | Backend context smoke test; frontend scaffold. | Unit, integration, security, export, browser E2E, performance, and CI tests. |

---

## 13. Maintenance guide

When modifying this project:

1. Update DTO validation, service logic, OpenAPI documentation, frontend TypeScript model, and SRS requirements together for any API change.
2. Add a database migration rather than relying on automatic Hibernate schema changes in deployed environments.
3. Add or update automated tests before changing a lifecycle transition or authorization decision.
4. Review the dependency lockfile (`package-lock.json`) and Maven dependency tree after upgrades; patch vulnerable dependencies promptly.
5. Keep this document synchronized with endpoint, configuration, and role-policy changes. Update the snapshot date and document version with each release.
