# AGENTS.md

## Project Overview

This project is a Medium-like publishing backend built as a **modular monolith**.

The goal is NOT to reproduce Medium's production architecture, infrastructure, traffic capacity, or internal complexity.

The goal is to build a clean, correct, maintainable MVP that provides the core product experience of a modern publishing platform while keeping the architecture simple enough for a small team to develop and operate.

When making technical decisions, optimize in this order:

1. Correctness
2. Simplicity
3. Maintainability
4. Security
5. Developer experience
6. Reasonable performance
7. Future scalability

Do not optimize for hypothetical massive scale.

Prefer code that can be refactored later over infrastructure that is unnecessary today.

---

# Tech Stack

Primary backend stack:

- Node.js
- TypeScript
- Express.js for the HTTP server
- PostgreSQL
- Prisma ORM
- REST API
- Redis
- Background job queue
- Cloudinary for image/media storage
- Docker

Authentication may support:

- Email/password
- JWT access tokens
- Refresh tokens
- OAuth/social authentication

Do not introduce major new infrastructure, databases, frameworks, ORMs, brokers, or architectural patterns without a concrete requirement.

---

# Architecture

Use a **modular monolith**.

The application is deployed as one backend system, but domain boundaries should remain explicit inside the codebase.

Prefer modules organized around business domains rather than technical layers.

Expected domains may include:

- auth
- users
- profiles
- articles
- drafts
- publications
- tags
- comments
- reactions/claps
- bookmarks
- follows
- feeds
- search
- media
- notifications

Not every domain needs to exist immediately.

Create modules when the product actually requires them.

A module should generally own its:

- routes/controllers
- service/business logic
- validation
- data access
- domain-specific types
- errors

Avoid creating artificial abstractions simply to satisfy a pattern.

---

# MVP Philosophy

This is an MVP.

Do not confuse "MVP" with "poorly engineered."

The system should have:

- clear domain boundaries
- predictable APIs
- proper validation
- secure authentication
- correct database constraints
- sensible error handling
- migrations
- logging
- configuration management

However, avoid infrastructure whose primary justification is hypothetical future traffic.

For example, do NOT introduce by default:

- microservices
- event sourcing
- CQRS
- Kafka
- Kubernetes
- distributed transactions
- multiple databases
- database sharding
- elaborate repository hierarchies
- internal service meshes
- premature read replicas
- complex caching systems

These can be introduced later if real requirements justify them.

---

# Source of Truth

PostgreSQL is the primary source of truth for persistent application data.

Redis is NOT the source of truth.

Redis should be used for appropriate ephemeral or performance-oriented workloads such as:

- caching
- rate limiting
- temporary state
- distributed locks when actually required
- background queue infrastructure

The application must continue to preserve durable business data in PostgreSQL.

Never require cached data for correctness when the underlying data can be retrieved from PostgreSQL.

---

# Prisma

Use Prisma as the primary database access layer.

Prefer straightforward Prisma queries over unnecessary wrappers.

Do not create a generic repository abstraction around Prisma unless there is a demonstrated requirement.

Use database constraints where appropriate instead of relying entirely on application code.

Examples include:

- unique usernames
- unique emails where applicable
- foreign keys
- compound uniqueness
- indexes
- required relationships

Schema changes must be represented through Prisma migrations.

Do not manually change production database structure outside the migration workflow.

Avoid N+1 query patterns.

Select only the data reasonably needed by the endpoint, especially for list/feed endpoints.

Use transactions when multiple database operations form one atomic business operation.

Keep transactions short.

---

# IDs

Use opaque IDs for externally exposed entities.

Do not make business logic depend on sequential ID ordering.

Never treat an ID supplied by a client as proof that the client is authorized to access the corresponding resource.

Authorization must always be checked separately.

---

# REST API Design

Use RESTful resource-oriented endpoints.

Prefer predictable endpoints such as:

GET /articles
GET /articles/:id
POST /article
PATCH /articles/:id
DELETE /articles/:id

Use nested routes when the relationship is meaningful, but avoid deeply nested APIs.

For example:

POST /articles/:articleId/comments
GET /articles/:articleId/comments

Keep response structures consistent.

Use appropriate HTTP status codes.

Examples:

- 200 — successful request
- 201 — resource created
- 204 — successful operation with no response body
- 400 — malformed request
- 401 — authentication required or invalid
- 403 — authenticated but not authorized
- 404 — resource does not exist
- 409 — conflict
- 422 — semantically invalid input when appropriate
- 429 — rate limited
- 500 — unexpected server error

Do not expose internal stack traces, SQL errors, Prisma errors, tokens, secrets, or infrastructure details to API clients.

---

# API Versioning

Do not introduce complicated API versioning before it is necessary.

If versioning is required, prefer a simple convention such as:

/api/v1/...

Do not maintain multiple versions until the product actually needs backward compatibility.

---

# Validation

Treat all client input as untrusted.

Validate:

- request bodies
- query parameters
- route parameters
- uploaded media metadata
- pagination parameters
- enum values

Reject unexpected or malformed input early.

Validation belongs at the API boundary.

Business rules belong in the service/domain layer.

Do not rely on TypeScript types as runtime validation.

---

# Authentication

Authentication must be implemented securely even during MVP development.

Support the authentication methods required by the product without coupling business modules directly to authentication implementation details.

For password authentication:

- never store plaintext passwords
- use a proven password hashing algorithm/library
- never log passwords
- never return password hashes

For token authentication:

- access tokens should be short-lived
- refresh tokens should have a controlled lifecycle
- validate token expiration and signatures
- support revocation/rotation where required
- never log raw tokens

For OAuth:

- use established OAuth/OIDC libraries
- validate provider responses correctly
- do not trust profile information without validation
- correctly handle account linking

Authentication answers:

"Who is this user?"

Authorization answers:

"Is this user allowed to perform this action?"

Keep those concepts separate.

---

# Authorization

Every operation that modifies or accesses protected resources must perform explicit authorization.

Examples:

- only an article author may edit their draft unless another role is explicitly permitted
- users may manage only their own bookmarks
- private/unpublished drafts must not leak through public endpoints
- moderation/admin operations require appropriate permissions

Never rely on hidden UI controls for authorization.

The backend is responsible for enforcing permissions.

---

# Articles and Drafts

Treat article lifecycle explicitly.

A useful initial model may include states such as:

- DRAFT
- PUBLISHED
- ARCHIVED

Do not expose drafts through public article endpoints.

Publishing should validate that required article data exists.

Store timestamps such as:

- createdAt
- updatedAt
- publishedAt

Do not derive critical publication state solely from whether a timestamp happens to be null.

Keep lifecycle rules explicit.

---

# Slugs

Human-readable article URLs may use slugs.

Slugs must not be treated as immutable database identities.

If slug history or redirects are not required by the MVP, keep the implementation simple.

Handle slug collisions deterministically.

Never assume two users cannot choose identical article titles.

---

# Content

Do not blindly trust rendered article content.

If HTML or rich-text content is accepted, sanitize it appropriately before it can become an XSS vector.

Keep the canonical article content format explicit.

Do not introduce multiple content representations unless needed.

---

# Images and Cloudinary

Cloudinary is responsible for image/media storage and delivery.

Do not store large image binaries directly in PostgreSQL.

PostgreSQL may store metadata such as:

- Cloudinary public ID
- URL
- width
- height
- format
- owner
- related entity
- timestamps

Validate uploads.

Restrict:

- accepted file types
- file sizes
- allowed upload behavior

Do not trust file extensions alone.

When replacing or deleting media, consider cleanup of the corresponding Cloudinary asset.

Do not allow arbitrary client-controlled Cloudinary identifiers to delete assets without ownership/authorization checks.

---

# Redis

Redis should solve specific problems rather than being inserted into every request path.

Appropriate uses may include:

- rate limiting
- short-lived caching
- feed caching if later necessary
- queue infrastructure
- temporary verification state

Start without caching unless an endpoint actually benefits from it.

When caching is introduced, define:

- cache key
- TTL
- invalidation strategy
- fallback behavior

Every cache must have an intentional expiration/invalidation strategy.

Prefer slightly stale non-critical data over complicated distributed cache coordination.

---

# Background Jobs

Use background jobs for work that:

- does not need to block the HTTP response
- may take significant time
- benefits from retries
- interacts with slower external systems

Possible jobs include:

- email delivery
- image processing
- notification fan-out
- cleanup
- indexing
- analytics/event processing

Do not queue simple database work merely because a queue exists.

Jobs should be idempotent whenever practical.

Assume a job may execute more than once.

Configure retry limits and failure handling intentionally.

Do not create infinite retry loops.

---

# Feed

Start with the simplest feed implementation that satisfies product requirements.

A first version can query PostgreSQL using followed users/publications, publication state, ordering, and pagination.

Do NOT build a complex precomputed fan-out architecture for the MVP.

Do not introduce feed fan-out-on-write, distributed ranking infrastructure, or specialized feed databases until actual usage demonstrates the need.

Feed ranking can initially be simple and deterministic.

Examples:

- chronological
- recent followed authors
- simple popularity signals

Sophisticated recommendation systems are outside MVP scope unless explicitly requested.

---

# Search

Start simple.

If PostgreSQL search capabilities satisfy the MVP, use them.

Do not introduce Elasticsearch/OpenSearch solely because large publishing platforms use dedicated search infrastructure.

A dedicated search engine can be introduced later if requirements such as ranking quality, typo tolerance, indexing scale, or query complexity justify it.

---

# Pagination

List endpoints must use bounded pagination.

Never return an unbounded collection.

For simple administrative or low-volume endpoints, offset pagination is acceptable.

For feeds and high-growth ordered datasets, prefer cursor-based pagination when practical.

Define stable ordering.

Do not paginate using an unstable sort.

---

# Comments

Comments should belong to a user and an article.

If nested replies are supported, keep the initial model simple.

Avoid designing an arbitrarily complicated comment tree system before it is needed.

Authorization must apply to editing/deleting comments.

Deletion behavior should be explicitly defined.

For example:

- hard delete
- soft delete
- tombstone while preserving replies

Choose based on actual product requirements.

---

# Reactions / Claps

Model reactions according to actual product behavior.

If implementing Medium-style claps where one user can clap multiple times, represent that intentionally.

If the MVP only requires like/unlike behavior, use a unique user-resource relationship instead.

Do not copy Medium behavior merely because Medium has it.

Choose the simplest behavior that satisfies the product requirement.

---

# Follows

Following should use explicit relationships.

Examples may include:

- user follows user
- user follows publication
- user follows tag

Prevent duplicate relationships with database constraints.

Do not maintain follower/following counts as manually synchronized values unless performance actually requires denormalization.

Start by deriving counts from the database when reasonable.

---

# Bookmarks

Bookmarks should normally use a unique relationship between:

user + article

Repeated bookmark requests should not create duplicate records.

Prefer idempotent behavior where practical.

---

# Tags

Normalize tags enough to avoid obvious duplicates.

Define how tag uniqueness works.

For example, normalized lowercase names may be unique while preserving a display name separately if needed.

Do not create a complicated taxonomy system for the MVP.

---

# Notifications

Start with persistent in-app notifications only if the product needs them.

Do not build a large real-time notification architecture initially.

Background jobs may generate notifications asynchronously.

WebSockets should only be introduced when actual real-time behavior is required.

Polling is acceptable for an MVP when the experience permits it.

---

# Database Performance

Indexes should be driven by real query patterns.

Common candidates may include:

- username
- email
- article slug
- article author
- publication status
- publishedAt
- createdAt
- foreign keys
- follow relationships
- bookmark relationships
- tag relationships

Do not add indexes blindly.

Remember that indexes improve reads but increase storage and write cost.

When adding an index, understand which query it supports.

---

# Avoid Premature Denormalization

Prefer normalized relational data initially.

Do not duplicate data across tables merely to avoid joins.

Denormalization is acceptable when:

1. a real performance problem exists,
2. the read pattern is understood,
3. consistency behavior is explicitly defined.

---

# Error Handling

Use centralized error handling.

Distinguish expected application errors from unexpected internal errors.

Expected errors may include:

- validation failures
- unauthorized requests
- forbidden operations
- missing resources
- conflicts
- rate limits

Unexpected errors should be logged with enough context to debug them.

Never leak sensitive internal details to clients.

---

# Logging

Use structured logging.

Useful context may include:

- request ID
- user ID when available and safe
- route
- HTTP method
- response status
- duration
- job ID
- error information

Never log:

- passwords
- access tokens
- refresh tokens
- OAuth secrets
- database credentials
- private keys
- complete sensitive request payloads

---

# Configuration

Environment-specific configuration must come from environment variables or an appropriate secret-management mechanism.

Never commit secrets.

Provide an `.env.example` containing required variable names with safe placeholder values.

Validate required configuration during application startup.

Fail early when critical configuration is missing.

---

# Docker

The application should run consistently through Docker for local/deployment environments where Docker is used.

Keep containers simple.

Do not treat Docker Compose as production orchestration.

Development may include services such as:

- API
- PostgreSQL
- Redis
- queue worker

Do not add infrastructure containers without a concrete requirement.

---

# Security

Security is not optional because this is an MVP.

At minimum consider:

- secure password hashing
- authentication validation
- authorization
- input validation
- SQL injection protection
- XSS prevention
- CORS configuration
- rate limiting
- secure cookies when cookies are used
- CSRF protection when applicable
- upload validation
- OAuth state/PKCE where applicable
- secret management
- dependency vulnerabilities

Use established libraries for security-sensitive functionality.

Do not implement custom cryptography.

---

# Rate Limiting

Apply rate limits based on abuse risk rather than applying the same limit everywhere.

Higher-risk endpoints include:

- login
- signup
- password reset
- email verification
- OAuth callbacks where appropriate
- publishing/commenting
- media uploads

Redis
