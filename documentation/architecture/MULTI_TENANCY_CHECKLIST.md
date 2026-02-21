# TorqueHub — Checklist Multi-Tenancy Implementation

> Rastreamento de todas as fases de implementação da arquitetura multi-tenancy.
> Última atualização: 2026-02-21

---

## Fase 1 — Schema + Contracts (Foundation)

- [x] Criar `documentation/architecture/MULTI_TENANCY_ARCHITECTURE.md`
- [x] Atualizar `.github/copilot-instructions.md` com regras multi-tenancy
- [x] Atualizar `TORQUEHUB_MASTER_DOCUMENTATION.md` (roles, platform info)
- [x] Migration Prisma: renomear `ADMIN` → `WORKSHOP_OWNER`, adicionar `PLATFORM_ADMIN`
- [x] Tornar `User.workshopId` nullable (para PLATFORM_ADMIN)
- [x] Atualizar `packages/contracts/src/index.ts` — UserRole, JwtPayload, UserDTO
- [x] Atualizar `apps/api/src/types/fastify.d.ts` — FastifyJWT payload types
- [x] Atualizar `apps/api/src/modules/auth/interfaces/http/auth.schemas.ts` — enum roles
- [x] Atualizar `apps/api/src/modules/auth/infrastructure/repositories/user.repository.ts` — workshopId optional
- [x] Atualizar `apps/api/src/modules/auth/application/use-cases/auth.use-case.ts` — register com role
- [x] Rodar migration + seed com PLATFORM_ADMIN user
- [x] Verificar geração do Prisma Client sem erros

---

## Fase 2 — Tenant Context + Role Guard (Security)

- [x] Criar `apps/api/src/shared/infrastructure/auth/tenant-context.ts` — middleware
- [x] Criar `apps/api/src/shared/infrastructure/auth/role-guard.ts` — requireRole()
- [x] Criar `apps/api/src/shared/infrastructure/database/scoped-prisma.ts` — Prisma Extension
- [x] Registrar tenant-context middleware em `app.ts` (após JWT verify)
- [x] Atualizar `fastify.d.ts` — adicionar `request.tenantId`
- [x] Proteger `service-order.controller.ts` com requireRole + tenantId
- [x] Proteger `customer.controller.ts` com requireRole + tenantId
- [x] Proteger `vehicle.controller.ts` com requireRole + tenantId
- [x] Proteger `media.controller.ts` com requireRole + tenantId
- [x] Atualizar `auth.controller.ts` — register restrito a WORKSHOP_OWNER+
- [ ] Testar isolamento com curl (tenant A não vê dados de tenant B)

---

## Fase 3 — Módulo Admin (PLATFORM_ADMIN only)

- [x] Criar `modules/admin/interfaces/http/admin.controller.ts`
- [x] Criar `modules/admin/interfaces/http/admin.schemas.ts`
- [x] Criar `modules/admin/application/use-cases/admin.use-cases.ts`
- [x] Criar `modules/admin/infrastructure/repositories/admin.repository.ts`
- [x] Endpoint: `GET /admin/workshops` — listar todas oficinas
- [x] Endpoint: `POST /admin/workshops` — criar oficina
- [x] Endpoint: `GET /admin/workshops/:id` — detalhe oficina
- [x] Endpoint: `PATCH /admin/workshops/:id` — editar oficina
- [x] Endpoint: `POST /admin/workshops/:id/users` — criar owner/mechanic
- [x] Endpoint: `GET /admin/metrics` — dashboard global
- [x] Registrar rotas em `app.ts` com prefix `/admin`

---

## Fase 4 — Portal Web: Login + Admin (Frontend)

- [x] Criar `apps/web/src/services/authService.ts` — login, token, role decode
- [x] Criar `apps/web/src/pages/LoginPage.tsx` — login unificado
- [x] Criar `apps/web/src/guards/RoleGuard.tsx` — redirect por role
- [x] Criar `apps/web/src/layouts/AdminLayout.tsx` — sidebar admin
- [x] Criar `apps/web/src/pages/admin/DashboardPage.tsx`
- [x] Criar `apps/web/src/pages/admin/WorkshopsPage.tsx` — lista/cria
- [x] Criar `apps/web/src/pages/admin/WorkshopDetailPage.tsx`
- [x] Criar `apps/web/src/pages/admin/SettingsPage.tsx` — perfil + troca de senha
- [x] Atualizar `App.tsx` — routing com guards

---

## Fase 5 — Portal Web: Backoffice (Frontend)

- [x] Criar `apps/web/src/layouts/BackofficeLayout.tsx` — sidebar oficina
- [x] Criar `apps/web/src/pages/backoffice/DashboardPage.tsx`
- [x] Criar `apps/web/src/pages/backoffice/MechanicsPage.tsx` — CRUD equipe
- [x] Criar `apps/web/src/pages/backoffice/OrdersPage.tsx`
- [x] Criar `apps/web/src/pages/backoffice/CustomersPage.tsx`
- [x] Criar `apps/web/src/pages/backoffice/SettingsPage.tsx` — perfil + troca de senha
- [x] Atualizar `App.tsx` — rotas /backoffice/\* com RoleGuard

---

## Fase 6 — Mobile: Adaptação por Role

- [x] Atualizar `AuthService` — decodificar role do JWT/userData
- [x] Criar `main_shell.dart` com navegação condicional por role
- [x] WORKSHOP_OWNER: BottomNav com OS, Clientes, Veículos, Equipe, Config
- [x] MECHANIC: BottomNav com Minhas OS, Config
- [x] Criar tela `team_screen.dart` — gestão de mecânicos (WORKSHOP_OWNER only)
- [x] Criar tela `settings_screen.dart` — perfil + troca de senha
- [x] Restringir ações no app conforme role (ex: mecânico não cria OS)

---

## Fase 7 — Onboarding + Email de Convite

- [x] Fluxo: PLATFORM_ADMIN cria Workshop + primeiro WORKSHOP_OWNER
- [x] Gerar senha temporária definida pelo admin (enviada por email)
- [x] Integrar envio de email (nodemailer com SMTP configurável)
- [x] Fluxo: WORKSHOP_OWNER convida MECHANICs via email
- [x] Endpoint `PATCH /auth/change-password` — troca de senha autenticada
- [x] Campo `mustChangePassword` no Prisma schema (flag de primeiro acesso)
- [x] Web: formulário de troca de senha nas páginas de configurações
- [x] Mobile: dialog de troca de senha na tela de configurações
- [x] Email service com template HTML para convites
- [x] Permissão dos endpoints de equipe ajustada (WORKSHOP_OWNER gerencia própria oficina)

---

## Notas

- **Branch de trabalho:** `develop`
- **Merge para main:** após cada fase completa e testada
- **Fases 1-3:** Backend puro — testável via curl/Swagger
- **Fases 4-5:** Frontend web — requer tokens CSS + React Router
- **Fase 6:** Mobile — requer Flutter navigation refactor
- **Fase 7:** Onboarding + email + troca de senha — implementada com nodemailer
- **Pendência:** `scoped-prisma.ts` criado mas não wired nos repositories (refactor futuro)
- **Pendência:** Migrations SQL criadas mas não aplicadas (Docker indisponível)
- **Resultados de compilação:** API ✅ | Web ✅ | Mobile ✅ (0 erros)

---

END OF CHECKLIST
