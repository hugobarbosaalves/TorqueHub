# TORQUEHUB

## Master Project Documentation

------------------------------------------------------------------------

# 1. Project Overview

TorqueHub is a SaaS platform for automotive workshop management.

The platform is designed to:

-   Enable mechanics to manage service orders via a mobile app.
-   Allow customers to access budgets and service history via web links.
-   Provide a professional, reliable, and scalable system from day one.
-   Start as a lean MVP with minimal infrastructure cost.
-   Scale progressively as adoption grows.

TorqueHub is not just a CRUD system --- it is a trust platform between
mechanic and client.

------------------------------------------------------------------------

# 2. Initial Vision (MVP)

The MVP focuses on:

-   Service order creation
-   Photo and video documentation of services
-   Customer approval via web link
-   Vehicle service history tracking
-   Simple and clean UX for mechanics

Core principle: Speed + reliability + simplicity.

------------------------------------------------------------------------

# 3. Architecture Strategy

TorqueHub follows a pragmatic Clean Architecture approach.

Goals:

-   Keep business rules isolated
-   Avoid framework coupling
-   Maintain modularity
-   Prevent technical debt early
-   Avoid overengineering

It is intentionally:

-   NOT microservices
-   NOT serverless initially
-   NOT event-driven
-   NOT over-abstracted

It is a modular monolith.

------------------------------------------------------------------------

# 4. Monorepo Strategy

The project uses a monorepo structure managed with pnpm.

Structure:

torquehub/ apps/ api/ web/ mobile/ packages/ contracts/ entities/ utils/

Why monorepo:

-   Shared types
-   Safer refactoring
-   Faster iteration
-   Single source of truth

Flutter mobile remains isolated from pnpm workspace.

------------------------------------------------------------------------

# 5. Technology Stack

Backend: - Node.js - TypeScript (strict mode) - Fastify - Clean
Architecture (pragmatic) - tsx (dev) - tsc (build)

Web: - React - Vite - TypeScript

Mobile: - Flutter - Dart

Package manager: - pnpm

Database (future): - PostgreSQL

Storage (future): - Cloud storage via presigned URLs

------------------------------------------------------------------------

# 6. Architectural Rules

Mandatory constraints:

-   Controllers do not access database directly.
-   Use cases do not depend on framework.
-   Domain does not depend on infrastructure.
-   No business logic inside controllers.
-   No use of 'any'.
-   Prefer ?? over \|\|.
-   Explicit return types required.
-   Early return pattern preferred.
-   Strict TypeScript enabled.

------------------------------------------------------------------------

# 7. Domain Philosophy

Core entities expected in system:

-   Workshop
-   Customer
-   Vehicle
-   ServiceOrder
-   Media

ServiceOrder is the heart of the MVP.

Each ServiceOrder contains:

-   Description
-   Status
-   Media attachments
-   Customer reference
-   Vehicle reference
-   Observations
-   Budget details (future phase)

------------------------------------------------------------------------

# 8. Future Growth Vision

Planned evolutions:

-   Multi-tenant architecture
-   Subscription plans
-   Role-based access control
-   Service approval workflow
-   Notifications system
-   Audit logs
-   Analytics dashboard
-   Financial tracking
-   Integration APIs

Scalability plan:

-   Start as modular monolith
-   Introduce queues when needed
-   Extract services only when necessary
-   Introduce serverless only at scale

------------------------------------------------------------------------

# 9. Product Strategy

Target market:

Small and medium automotive workshops.

Main value proposition:

-   Transparency
-   Professional image
-   Organized history
-   Digital trust
-   Reduced misunderstandings
-   Customer retention

Monetization strategy:

-   Monthly subscription
-   Tiered plans based on:
    -   Number of vehicles
    -   Storage usage
    -   Number of mechanics
    -   Advanced features

------------------------------------------------------------------------

# 10. Development Philosophy

Principles:

-   Ship fast
-   Refactor responsibly
-   Avoid premature optimization
-   Avoid unnecessary abstraction
-   Code must be readable first
-   Architecture before scale
-   Simplicity before cleverness

------------------------------------------------------------------------

# 11. Current Status

Current stage:

-   Monorepo structure created
-   Backend base structure created
-   Web base project created
-   Flutter mobile scaffold created
-   Clean Architecture structure prepared

Next logical steps:

1.  Implement domain models properly
2.  Add database layer (PostgreSQL + ORM)
3.  Implement persistence for ServiceOrder
4.  Implement customer + vehicle modules
5.  Add media upload flow
6.  Implement customer public access link
7.  Implement basic authentication

------------------------------------------------------------------------

# 12. Long-Term Technical Direction

-   Multi-tenant isolation strategy
-   Role and permission system
-   Plan-based feature gating
-   Scalable storage handling
-   Performance monitoring
-   CI/CD pipelines
-   Production-grade logging
-   Observability

------------------------------------------------------------------------

# 13. Final Strategic Intent

TorqueHub aims to become:

-   The digital backbone of small workshops.
-   A trusted automotive service registry.
-   A scalable SaaS with recurring revenue.
-   A product that prioritizes usability over complexity.

The system must always balance:

Speed + Clean Architecture + Cost Efficiency + Scalability.

------------------------------------------------------------------------

END OF DOCUMENT
