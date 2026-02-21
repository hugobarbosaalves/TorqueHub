# TorqueHub — Arquitetura Multi-Tenancy

> **Documento normativo.** Todo código gerado por IA ou humano DEVE seguir esta arquitetura.
> Última atualização: 2026-02-21

---

## 1. Visão Geral

TorqueHub é um SaaS multi-tenant para gestão de oficinas mecânicas.
Cada oficina (`Workshop`) é um **tenant isolado**. O sistema suporta 200+ oficinas
simultâneas com total autonomia e isolamento de dados entre elas.

**Princípio central:** Um único app mobile, uma única API, um único banco de dados,
com isolamento garantido por `workshopId` em nível de linha (Row-Level Isolation).

---

## 2. Modelo de Papéis (UserRole)

```
┌──────────────────────────────────────────────────────┐
│                   PLATFORM_ADMIN                      │
│  Dono do SaaS (Hugo)                                 │
│  workshopId: NULL                                     │
│  Acessa: todas as oficinas, métricas, onboarding     │
├──────────────────────────────────────────────────────┤
│                   WORKSHOP_OWNER                      │
│  Dono/gestor de cada oficina                         │
│  workshopId: uuid obrigatório                        │
│  Acessa: tudo dentro da própria oficina              │
│  Pode: cadastrar mecânicos, ver relatórios           │
├──────────────────────────────────────────────────────┤
│                     MECHANIC                          │
│  Mecânico operacional                                │
│  workshopId: uuid obrigatório                        │
│  Acessa: OS atribuídas, upload de fotos              │
│  Não pode: gerenciar equipe, ver financeiro          │
└──────────────────────────────────────────────────────┘
```

### 2.1 Enum Prisma

```prisma
enum UserRole {
  PLATFORM_ADMIN
  WORKSHOP_OWNER
  MECHANIC
  @@map("user_role")
}
```

### 2.2 Model User (atualizado)

```prisma
model User {
  id           String    @id @default(uuid())
  workshopId   String?   @map("workshop_id")   // NULL para PLATFORM_ADMIN
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  @default(MECHANIC)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  workshop Workshop? @relation(fields: [workshopId], references: [id])
  @@map("users")
}
```

---

## 3. Padrão de Tenancy: Shared Schema + Row-Level Isolation

| Decisão              | Escolha | Motivo                                           |
| -------------------- | ------- | ------------------------------------------------ |
| Banco por tenant?    | **NÃO** | 200 tenants não justifica — custo e complexidade |
| Schema por tenant?   | **NÃO** | Migrations se tornam inviáveis                   |
| Row-Level Isolation? | **SIM** | workshopId como filtro sistêmico                 |

### 3.1 Tenant Context Middleware

Toda request autenticada passa por um middleware que injeta `request.tenantId`:

```typescript
// shared/infrastructure/auth/tenant-context.middleware.ts

app.addHook('onRequest', async (request) => {
  if (!request.user) return; // rota pública

  const { role, workshopId } = request.user;

  if (role === 'PLATFORM_ADMIN') {
    // Admin da plataforma pode acessar qualquer oficina via query param
    request.tenantId = (request.query as Record<string, string>).workshopId ?? null;
  } else {
    // Usuário vinculado — SEMPRE forçado ao tenant do JWT
    request.tenantId = workshopId;
  }
});
```

### 3.2 Prisma Scoped Client

Use cases e repositories recebem um Prisma Client com escopo automático:

```typescript
function scopedPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allOperations({ args, query, model }) {
        // Modelos que NÃO têm workshopId (ex: Workshop) são ignorados
        const TENANT_MODELS = ['Customer', 'Vehicle', 'ServiceOrder', 'User'];
        if (TENANT_MODELS.includes(model ?? '') && 'where' in (args ?? {})) {
          (args as any).where = { ...(args as any).where, workshopId: tenantId };
        }
        return query(args);
      },
    },
  });
}
```

---

## 4. Camada de Autorização — Role Guard

```typescript
// shared/infrastructure/auth/role-guard.ts

import type { UserRole } from '@torquehub/contracts';

function requireRole(...allowed: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user?.role;
    if (!userRole || !allowed.includes(userRole as UserRole)) {
      return reply.status(403).send({
        success: false,
        data: null,
        meta: { error: 'Forbidden — insufficient role' },
      });
    }
  };
}
```

### 4.1 Matriz de Permissões

| Recurso                | PLATFORM_ADMIN | WORKSHOP_OWNER |   MECHANIC    |
| ---------------------- | :------------: | :------------: | :-----------: |
| Ver todas oficinas     |       ✅       |       ❌       |      ❌       |
| Criar oficina + owner  |       ✅       |       ❌       |      ❌       |
| Métricas globais       |       ✅       |       ❌       |      ❌       |
| Cadastrar mecânico     |       ✅       |       ✅       |      ❌       |
| CRUD clientes/veículos |       ✅       |       ✅       |  🔶 Leitura   |
| CRUD ordens de serviço |       ✅       |       ✅       | 🔶 Atribuídas |
| Upload fotos/vídeos    |       ✅       |       ✅       |      ✅       |
| Gerar orçamento PDF    |       ✅       |       ✅       |      ❌       |
| Config da oficina      |       ✅       |       ✅       |      ❌       |

---

## 5. JWT Payload

```typescript
interface JwtPayload {
  sub: string; // userId
  workshopId: string | null; // null para PLATFORM_ADMIN
  role: 'PLATFORM_ADMIN' | 'WORKSHOP_OWNER' | 'MECHANIC';
}
```

Token expira em 7 dias. `workshopId` null é válido SOMENTE para `PLATFORM_ADMIN`.

---

## 6. Portais Web

### 6.1 Estratégia: App Único com Route Guards

```
apps/web/src/
├── pages/
│   ├── public/           ← Viewer de orçamento (já existe)
│   ├── admin/            ← Portal PLATFORM_ADMIN
│   │   ├── DashboardPage.tsx
│   │   ├── WorkshopsPage.tsx
│   │   ├── WorkshopDetailPage.tsx
│   │   └── SettingsPage.tsx
│   └── backoffice/       ← Portal WORKSHOP_OWNER
│       ├── DashboardPage.tsx
│       ├── MechanicsPage.tsx
│       ├── OrdersPage.tsx
│       ├── CustomersPage.tsx
│       ├── ReportsPage.tsx
│       └── SettingsPage.tsx
├── guards/
│   └── RoleGuard.tsx
└── layouts/
    ├── AdminLayout.tsx
    └── BackofficeLayout.tsx
```

### 6.2 Roteamento

```
/login            → Tela única de login
/admin/*          → RoleGuard(['PLATFORM_ADMIN'])
/backoffice/*     → RoleGuard(['WORKSHOP_OWNER'])
/public/*         → Sem autenticação
```

Após login, JWT decodificado define o redirect:

- `PLATFORM_ADMIN` → `/admin`
- `WORKSHOP_OWNER` → `/backoffice`

---

## 7. App Mobile — Diferenciação por Role

Um único APK. Após login, a navegação muda conforme o role:

| Role           | Bottom Nav                                 |
| -------------- | ------------------------------------------ |
| WORKSHOP_OWNER | OS · Clientes · Veículos · Equipe · Config |
| MECHANIC       | Minhas OS · Upload                         |
| PLATFORM_ADMIN | Dashboard leve (ou redirect web)           |

---

## 8. Onboarding de Nova Oficina

```
PLATFORM_ADMIN (portal web)
  ├── 1. Cria Workshop (CNPJ, nome, endereço)
  ├── 2. Cria User com role WORKSHOP_OWNER
  └── 3. Envia credenciais ao cliente

WORKSHOP_OWNER (backoffice web ou app mobile)
  ├── 1. Login com credenciais recebidas
  ├── 2. Configura oficina
  └── 3. Cadastra mecânicos (User role MECHANIC)

MECHANIC (app mobile)
  └── 1. Login → vê apenas suas OS
```

---

## 9. Endpoints da API — Novos

| Método   | Rota                         | Role Mínimo     | Finalidade            |
| -------- | ---------------------------- | --------------- | --------------------- |
| `GET`    | `/admin/workshops`           | PLATFORM_ADMIN  | Listar todas oficinas |
| `POST`   | `/admin/workshops`           | PLATFORM_ADMIN  | Criar oficina         |
| `GET`    | `/admin/workshops/:id`       | PLATFORM_ADMIN  | Detalhe oficina       |
| `PATCH`  | `/admin/workshops/:id`       | PLATFORM_ADMIN  | Editar oficina        |
| `GET`    | `/admin/metrics`             | PLATFORM_ADMIN  | Dashboard global      |
| `POST`   | `/admin/workshops/:id/users` | PLATFORM_ADMIN  | Criar owner/mechanic  |
| `GET`    | `/users?workshopId=`         | WORKSHOP_OWNER+ | Listar equipe         |
| `POST`   | `/users`                     | WORKSHOP_OWNER+ | Adicionar mecânico    |
| `DELETE` | `/users/:id`                 | WORKSHOP_OWNER+ | Remover mecânico      |
| `PATCH`  | `/workshops/settings`        | WORKSHOP_OWNER+ | Config da oficina     |

---

## 10. Fases de Implementação

| Fase  | Escopo                                                        | Prioridade |
| ----- | ------------------------------------------------------------- | ---------- |
| **1** | Migration UserRole, workshopId nullable, contracts/JwtPayload | 🔴 Crítica |
| **2** | Tenant Context Middleware + Role Guard                        | 🔴 Crítica |
| **3** | Módulo admin (CRUD workshops + users)                         | 🟠 Alta    |
| **4** | Portal Web — Login + Routing + Admin pages                    | 🟡 Média   |
| **5** | Portal Web — Backoffice pages                                 | 🟡 Média   |
| **6** | Mobile — Navigation por role, tela de equipe                  | 🟡 Média   |
| **7** | Onboarding flow + email de convite                            | 🟢 Baixa   |

---

## 11. Diagrama de Contexto

```
                    ┌──────────────────────────┐
                    │    Portal Web Unificado   │
                    │  /admin    /backoffice    │
                    │  /public                  │
                    └────────────┬─────────────┘
                                 │ HTTPS
┌──────────────┐                 │              ┌──────────────┐
│  App Mobile  │────── HTTPS ────┼───── HTTPS ──│   CDN (fotos)│
│  (Flutter)   │                 │              └──────────────┘
└──────────────┘                 │
                    ┌────────────▼─────────────┐
                    │       Fastify API         │
                    │  ┌─────────────────────┐  │
                    │  │ JWT Verify           │  │
                    │  │ Tenant Context MW    │  │
                    │  │ Role Guard           │  │
                    │  ├─────────────────────┤  │
                    │  │ /admin/*  (PLAT_ADM) │  │
                    │  │ /auth/*   (público)  │  │
                    │  │ /service-orders/*    │  │
                    │  │ /customers/*         │  │
                    │  │ /vehicles/*          │  │
                    │  │ /public/*  (público) │  │
                    │  └─────────────────────┘  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   PostgreSQL (Render)     │
                    │  Schema único, RLS por    │
                    │  workshopId em todas      │
                    │  as queries               │
                    └──────────────────────────┘
```

---

END OF DOCUMENT
