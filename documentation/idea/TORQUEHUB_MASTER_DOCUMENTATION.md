# TorqueHub — Master Project Documentation

> **Single source of truth** for the TorqueHub platform.
> Read `PROJECT_CONVENTIONS.md` in the repo root for coding standards and AI agent instructions.

---

## 1. Project Overview

TorqueHub is a **SaaS platform for automotive workshop management**. It connects mechanics and customers through a transparent, digital workflow for service orders, vehicle history, and media documentation.

**Core value proposition:**

- Mechanics manage orders, customers, and vehicles via **mobile app**
- Customers track budgets and service history via **web link** (read-only)
- Professional image, organized history, digital trust

TorqueHub is not just a CRUD system — it is a **trust platform** between mechanic and client.

---

## 2. Architecture

### 2.1 Strategy: Pragmatic Clean Architecture

```
┌─────────────────────────────────────────────┐
│  Interfaces (Controllers / HTTP Routes)      │
├─────────────────────────────────────────────┤
│  Application (Use Cases)                     │
├─────────────────────────────────────────────┤
│  Domain (Entities, Value Objects)            │
├─────────────────────────────────────────────┤
│  Infrastructure (Prisma Repos, Adapters)     │
└─────────────────────────────────────────────┘
```

**Dependency rule:** outer layers depend on inner layers, never the reverse.

### 2.2 Modular Monolith

| Decision          | Rationale                              |
| ----------------- | -------------------------------------- |
| NOT microservices | Too early — team of 1                  |
| NOT serverless    | Cost predictability matters for MVP    |
| NOT event-driven  | Synchronous flows are sufficient today |
| Modular monolith  | Easy to extract services later         |

---

## 3. Monorepo Structure

```
torquehub/
├── apps/
│   ├── api/          # Fastify REST API (backend)
│   ├── web/          # React customer portal (Vite)
│   └── mobile/       # Flutter mechanic app
├── packages/
│   ├── contracts/    # Shared DTOs and API types
│   ├── entities/     # BaseEntity, ValueObject, DomainError
│   └── utils/        # formatCurrency, slugify, generateId
├── documentation/    # Master docs and project specs
├── PROJECT_CONVENTIONS.md  # AI agent protocol
├── docker-compose.yml
└── tsconfig.base.json
```

Managed with **pnpm workspaces**. Flutter is isolated from pnpm.

---

## 4. Platform Responsibilities

| Platform      | Target User  | Purpose                                         |
| ------------- | ------------ | ----------------------------------------------- |
| `apps/api`    | System       | REST API, business logic, data persistence      |
| `apps/web`    | **Customer** | Public read-only portal — order lookup by token |
| `apps/mobile` | **Mechanic** | Full CRUD: orders, customers, vehicles          |

> **CRITICAL**: Web = customer portal only. All mechanic features = mobile only.

---

## 5. Technology Stack

### 5.1 Backend (`apps/api`)

| Technology       | Version        | Purpose                    |
| ---------------- | -------------- | -------------------------- |
| Node.js          | 24.x LTS       | Runtime                    |
| TypeScript       | 5.9.x (strict) | Language                   |
| Fastify          | 5.7.x          | HTTP framework             |
| Prisma           | 7.4.x          | ORM (with pg adapter)      |
| PostgreSQL       | 17 Alpine      | Database (Docker)          |
| Redis            | 7 Alpine       | Cache (Docker, future use) |
| @fastify/swagger | latest         | OpenAPI docs               |
| @fastify/jwt     | latest         | JWT authentication         |
| bcryptjs         | latest         | Password hashing           |
| TypeDoc          | latest         | Code documentation         |

### 5.2 Web (`apps/web`)

| Technology | Version | Purpose      |
| ---------- | ------- | ------------ |
| React      | 19.x    | UI framework |
| Vite       | 7.x     | Build tool   |
| TypeScript | 5.9.x   | Language     |

### 5.3 Mobile (`apps/mobile`)

| Technology | Version | Purpose      |
| ---------- | ------- | ------------ |
| Flutter    | 3.41.x  | UI framework |
| Dart       | 3.11.x  | Language     |
| http       | 1.6.x   | HTTP client         |
| shared_preferences | 2.5.x | Local token storage |

---

## 6. Domain Model

### 6.1 Core Entities

```
Workshop ──┬── Customer ──── Vehicle
           │
           ├── User (ADMIN | MECHANIC)
           │
           └── ServiceOrder ──── ServiceOrderItem
                    │
                    └── Media
```

### 6.2 ServiceOrder Status Flow

```
DRAFT → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED
                                                  ↘ CANCELLED
```

### 6.3 Database Schema (Prisma)

| Model            | Key Fields                                                                           |
| ---------------- | ------------------------------------------------------------------------------------ |
| Workshop         | id, name, document, phone, email                                                     |
| Customer         | id, workshopId, name, document, phone, email                                         |
| Vehicle          | id, workshopId, customerId, plate, brand, model, year, color, mileage                |
| ServiceOrder     | id, workshopId, customerId, vehicleId, description, status, totalAmount, publicToken |
| ServiceOrderItem | id, serviceOrderId, description, quantity, unitPrice                                 |
| Media            | id, serviceOrderId, type, url, caption                                               |
| User             | id, workshopId, name, email, passwordHash, role (ADMIN/MECHANIC)                     |

---

## 7. API Endpoints

Base URL: `http://localhost:3333`
Swagger UI: `http://localhost:3333/docs`

### 7.1 Auth

| Method | Path             | Auth     | Description                              |
| ------ | ---------------- | -------- | ---------------------------------------- |
| POST   | `/auth/login`    | Public   | Authenticate with email + password (JWT) |
| POST   | `/auth/register` | Public   | Register a new user                      |
| GET    | `/auth/me`       | Required | Get authenticated user profile           |

> All non-public routes require `Authorization: Bearer <token>` header.
> Public prefixes: `/health`, `/auth/`, `/public/`, `/docs`, `/uploads/`

### 7.2 Health

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

### 7.3 Workshops (Lookup)

| Method | Path                               | Description                 |
| ------ | ---------------------------------- | --------------------------- |
| GET    | `/workshops`                       | List all workshops          |
| GET    | `/workshops/:workshopId/customers` | List customers for workshop |
| GET    | `/workshops/:workshopId/vehicles`  | List vehicles for workshop  |

### 7.4 Customers

| Method | Path                     | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | `/customers`             | Create customer            |
| GET    | `/customers?workshopId=` | List customers by workshop |
| GET    | `/customers/:id`         | Get customer by ID         |
| PUT    | `/customers/:id`         | Update customer            |
| DELETE | `/customers/:id`         | Delete customer            |

### 7.5 Vehicles

| Method | Path                                      | Description       |
| ------ | ----------------------------------------- | ----------------- |
| POST   | `/vehicles`                               | Create vehicle    |
| GET    | `/vehicles?workshopId=` or `?customerId=` | List vehicles     |
| GET    | `/vehicles/:id`                           | Get vehicle by ID |
| PUT    | `/vehicles/:id`                           | Update vehicle    |
| DELETE | `/vehicles/:id`                           | Delete vehicle    |

### 7.6 Service Orders

| Method | Path                          | Description             |
| ------ | ----------------------------- | ----------------------- |
| POST   | `/service-orders`             | Create order with items |
| GET    | `/service-orders?workshopId=` | List orders             |
| GET    | `/service-orders/:id`         | Get order by ID         |
| PATCH  | `/service-orders/:id/status`  | Update status           |
| DELETE | `/service-orders/:id`         | Delete order            |

### 7.7 Media

| Method | Path                                 | Description          |
| ------ | ------------------------------------ | -------------------- |
| POST   | `/service-orders/:id/media`          | Upload photo/video   |
| GET    | `/service-orders/:id/media`          | List media for order |
| DELETE | `/service-orders/:id/media/:mediaId` | Delete a media file  |

### 7.8 Public (Acesso do Cliente)

| Method | Path                                    | Description                 |
| ------ | --------------------------------------- | --------------------------- |
| GET    | `/public/orders/:token`                 | Get order by public token   |
| GET    | `/public/orders/:token/vehicle-history` | Get vehicle service history |

---

## 8. Development Checklist

| #   | Task                                 | Status     |
| --- | ------------------------------------ | ---------- |
| 1   | Domain models (entities, types)      | ✅ Done    |
| 2   | Database layer (Prisma + PostgreSQL) | ✅ Done    |
| 3   | ServiceOrder CRUD persistence        | ✅ Done    |
| 4   | Customer + Vehicle modules           | ✅ Done    |
| 5   | Media upload flow                    | ✅ Done    |
| 6   | Customer public access link (web)    | ✅ Done    |
| 7   | Basic authentication                 | ✅ Done    |
| 8   | Swagger + TypeDoc + Conventions      | ✅ Done    |

---

## 9. Documentation & Tooling

| Tool        | Command                       | Output                   |
| ----------- | ----------------------------- | ------------------------ |
| Swagger UI  | Start API, visit `/docs`      | Interactive API docs     |
| TypeDoc     | `pnpm docs`                   | `documentation/typedoc/` |
| Dart Doc    | `cd apps/mobile && dart doc`  | `doc/api/`               |
| Conventions | Read `PROJECT_CONVENTIONS.md` | Coding standards         |

---

## 10. Environment Setup

```bash
# Prerequisites: Node.js 24+, pnpm 10+, Docker Desktop, Flutter 3.41+
docker compose up -d              # PostgreSQL + Redis
pnpm install                      # Install deps
pnpm --filter torquehub-api db:push   # Push schema
pnpm --filter torquehub-api db:seed   # Seed data
pnpm dev:api                      # API on :3333
pnpm dev:web                      # Web on :5173
cd apps/mobile && flutter run     # Mobile app
```

### Environment Variables (`apps/api/.env`)

```
DATABASE_URL=postgresql://torquehub:torquehub123@localhost:5432/torquehub
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
```

---

## 11. Future Roadmap

| Phase        | Features                                               |
| ------------ | ------------------------------------------------------ |
| MVP+         | Media upload, customer approval workflow, public links |
| Auth         | JWT authentication, role-based access                  |
| Multi-tenant | Workshop isolation, subscription plans                 |
| Scale        | Queues, caching, CDN for media                         |
| Analytics    | Dashboard, financial tracking, audit logs              |
| Enterprise   | API integrations, white-label, notifications           |

---

## 12. Strategic Intent

TorqueHub aims to become:

- The **digital backbone** of small workshops
- A **trusted automotive service registry**
- A **scalable SaaS** with recurring revenue
- A product that prioritizes **usability over complexity**

Balance: Speed + Clean Architecture + Cost Efficiency + Scalability.

---

END OF DOCUMENT
