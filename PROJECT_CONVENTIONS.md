# TorqueHub — Project Conventions & AI Internal Protocol

> **MANDATORY**: Any AI agent or human developer MUST read this file AND
> `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md` before writing any code.

---

## 1. Architecture Overview

| Layer           | Responsibility                              | Allowed Dependencies         |
|----------------|---------------------------------------------|------------------------------|
| **Domain**      | Entities, Value Objects, Domain Errors      | Only `@torquehub/entities`   |
| **Application** | Use Cases (orchestration only)              | Domain + Repository ports    |
| **Infrastructure** | Prisma repos, HTTP adapters, external services | Application + Domain     |
| **Interfaces**  | Controllers (HTTP routes), DTOs             | Application + contracts      |

### Dependency Rule

```
Interfaces → Application → Domain
              ↑
        Infrastructure
```

**Never** import from `interfaces/` or `infrastructure/` inside `domain/` or `application/`.

---

## 2. Platform Responsibilities

| Platform       | Target User | Purpose                             |
|---------------|-------------|-------------------------------------|
| `apps/api`    | Both        | REST API (Fastify), business logic  |
| `apps/web`    | Customer    | Public portal — order lookup only   |
| `apps/mobile` | Mechanic    | Full CRUD workshop management tool  |

> **CRITICAL**: The web app is a **customer portal** (token lookup).
> All mechanic/workshop features belong in **mobile only**.

---

## 3. Code Standards

### 3.1 File Size
- **Maximum 200 lines per file** — no exceptions
- If a file grows beyond 200 lines, split into smaller, well-named modules

### 3.2 Naming Conventions

| Artifact           | Convention                    | Example                          |
|-------------------|-------------------------------|----------------------------------|
| Files             | `kebab-case`                  | `customer.controller.ts`         |
| Classes           | `PascalCase`                  | `CreateCustomerUseCase`          |
| Interfaces/Types  | `PascalCase`                  | `CustomerDTO`, `ApiResponse`     |
| Functions         | `camelCase`                   | `customerRoutes`, `toDTO`        |
| Constants         | `UPPER_SNAKE_CASE`            | `STATUS_LABELS`, `MAX_RETRIES`   |
| Folders           | `kebab-case`                  | `service-order/`, `use-cases/`   |
| Dart files        | `snake_case`                  | `api_service.dart`               |
| Dart classes      | `PascalCase`                  | `OrdersScreen`                   |

### 3.3 Module Structure (Backend)

Every feature module follows this structure:

```
modules/<feature>/
├── domain/
│   └── entities/<feature>.ts          # Domain entity
├── application/
│   └── use-cases/<feature>.use-cases.ts  # All use cases
├── infrastructure/
│   └── repositories/<feature>.repository.ts  # Prisma repo
└── interfaces/
    └── http/<feature>.controller.ts   # Fastify route handler
```

### 3.4 TypeScript Rules
- Strict mode always (`"strict": true`)
- No `any` — use `unknown` + type guards
- No non-null assertions (`!`) — use proper guards
- Always `await` in `try/catch` return statements
- Use `type` imports: `import type { X } from '...'`
- Route handler registration functions are NOT `async` (they register, not run)
- Top-level `await` preferred over `main().catch()` patterns
- Use `globalThis` instead of `window` in web code
- Use `.replaceAll()` instead of `.replace()` for global replacements

### 3.5 Dart/Flutter Rules
- Use `const` constructors where possible
- All public APIs must have DartDoc comments (`///`)
- Screen files go in `lib/screens/`
- Service files go in `lib/services/`
- Prefer `StatelessWidget` unless state is really needed

---

## 4. Shared Packages

| Package                  | Purpose                                   |
|-------------------------|-------------------------------------------|
| `@torquehub/contracts`  | DTOs, request/response types, API shapes  |
| `@torquehub/entities`   | `BaseEntity`, `ValueObject`, `DomainError`|
| `@torquehub/utils`      | `formatCurrency`, `slugify`, `generateId` |

### Import Rules
- Backend modules import `@torquehub/contracts` for DTOs
- Backend domain imports `@torquehub/entities` for base classes
- Shared packages **never** import from `apps/*`

---

## 5. API Design

### 5.1 Response Format
All API responses follow this structure:

```typescript
// Success
{ "success": true, "data": T }

// Success with metadata
{ "success": true, "data": T, "meta": { "total": 42 } }

// Error
{ "success": false, "data": undefined, "meta": { "error": "message" } }
```

### 5.2 REST Conventions

| Action        | Method   | Path               | Status |
|--------------|----------|--------------------|--------|
| Create        | `POST`   | `/resources`       | 201    |
| List all      | `GET`    | `/resources`       | 200    |
| Get by ID     | `GET`    | `/resources/:id`   | 200    |
| Update        | `PUT`    | `/resources/:id`   | 200    |
| Partial update| `PATCH`  | `/resources/:id`   | 200    |
| Delete        | `DELETE` | `/resources/:id`   | 200    |

### 5.3 Swagger
All endpoints MUST be documented in Swagger with:
- Request body schemas
- Response schemas (success + error)
- Path parameters
- Query parameter descriptions
- Tag grouping by module

---

## 6. Database

- **ORM**: Prisma 7.x with `@prisma/adapter-pg` driver adapter
- **DB**: PostgreSQL 17 (Docker)
- **Migrations**: Descriptive names (`init_domain_models`, `add_media_table`)
- **Environment**: `DATABASE_URL` env var **required** (no hardcoded credentials)
- **Seed**: `prisma/seed.ts` — must use `await` at top level

---

## 7. Documentation Requirements

### 7.1 Backend
- **JSDoc** on every exported function, class, and interface
- **Swagger** annotations on all route handlers
- **TypeDoc** generation via `pnpm docs:api`

### 7.2 Frontend (Web)
- Component-level JSDoc for React components
- **TypeDoc** generation via `pnpm docs:web`

### 7.3 Mobile (Flutter)
- DartDoc (`///`) on all public classes, methods, and widgets
- Generated docs via `dart doc`

### 7.4 Master Documentation
- `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md` is the single source of truth
- Update it when adding new modules or changing architecture

---

## 8. Git Workflow

- **main**: production-ready code only
- **develop**: integration branch (all features merge here first)
- **feature/***: one branch per feature/issue
- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Always commit from `develop` branch during active development

---

## 9. Environment Setup

```bash
# Prerequisites: Node.js 24+, pnpm 10+, Docker Desktop
docker compose up -d        # Start PostgreSQL + Redis
pnpm install                # Install all workspace deps
pnpm --filter api db:push   # Push Prisma schema to DB
pnpm --filter api db:seed   # Seed test data
pnpm --filter api dev       # Start API server (port 3333)
pnpm --filter web dev       # Start web portal (port 5173)
cd apps/mobile && flutter run # Start mobile app
```

---

## 10. AI Agent Instructions

When working on this project as an AI coding assistant:

1. **Always read** this file AND the master documentation first
2. **Consult** existing code patterns before creating new files
3. **Never exceed** 200 lines per file
4. **Follow** the module structure exactly
5. **Run** `get_errors()` after making changes to verify
6. **Test** endpoints with curl after implementing
7. **Update documentation** when adding new features
8. **Use `develop` branch** for all work
9. **Never hardcode** credentials — use environment variables
10. **Kill processes surgically** — never batch-kill `node.exe` or `dart.exe`
