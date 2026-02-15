# TorqueHub — Project Conventions & AI Internal Protocol

> **OBRIGATÓRIO**: Qualquer agente IA ou desenvolvedor DEVE ler este arquivo,
> `DESIGN_SYSTEM.md` E `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md`
> ANTES de escrever qualquer código.

---

## 1. Arquitetura

| Camada             | Responsabilidade                              | Dependências Permitidas       |
| ------------------ | --------------------------------------------- | ----------------------------- |
| **Domain**         | Entidades, Value Objects, Erros de Domínio    | Apenas `@torquehub/entities`  |
| **Application**    | Use Cases (orquestração apenas)               | Domain + portas de Repository |
| **Infrastructure** | Repos Prisma, adaptadores HTTP, serviços ext. | Application + Domain          |
| **Interfaces**     | Controllers (rotas HTTP), DTOs                | Application + contracts       |

### Regra de Dependência

```
Interfaces → Application → Domain
              ↑
        Infrastructure
```

**Nunca** importe de `interfaces/` ou `infrastructure/` dentro de `domain/` ou `application/`.

---

## 2. Responsabilidades das Plataformas

| Plataforma    | Usuário Alvo | Propósito                             |
| ------------- | ------------ | ------------------------------------- |
| `apps/api`    | Ambos        | REST API (Fastify), lógica de negócio |
| `apps/web`    | Cliente      | Portal público — consulta por token   |
| `apps/mobile` | Mecânico     | CRUD completo de oficina              |

> **CRÍTICO**: O web app é **portal do cliente** (consulta por token).
> Todas as funcionalidades de mecânico/oficina pertencem **apenas ao mobile**.

---

## 3. Regras Absolutas (Todas as Stacks)

Estas regras são **invioláveis** em qualquer stack do projeto.

### 3.1 Proibições Universais

| Regra                                                              | Motivo                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------- | --------------------------------- | --- | --------------------------------- |
| **NUNCA** usar `any` (TS) ou evitar `dynamic` desnecessário (Dart) | Segurança de tipos é obrigatória                         |
| **NUNCA** usar `                                                   |                                                          | ` para valores default | Usar `??` (nullish coalescing). ` |     | ` só em condições booleanas puras |
| **NUNCA** usar `!` (non-null assertion)                            | Usar type guards, early return ou `??`                   |
| **NUNCA** usar `as` cast sem validação                             | Usar type guards + `unknown`                             |
| **NUNCA** hardcodar credenciais                                    | Usar variáveis de ambiente                               |
| **NUNCA** exceder 200 linhas por arquivo                           | Dividir em módulos menores                               |
| **NUNCA** usar comentários decorativos                             | Nada de `// ── GET /path ──────` — usar JSDoc descritivo |
| **NUNCA** deixar `console.log` em prod                             | Usar logger estruturado                                  |
| **NUNCA** ignorar erros silenciosamente                            | Sempre tratar ou relançar                                |

### 3.2 Obrigações Universais

| Regra                                    | Aplicação                                  |
| ---------------------------------------- | ------------------------------------------ |
| **Sempre** tipar retornos explicitamente | Funções, métodos, variáveis complexas      |
| **Sempre** documentar com JSDoc/DartDoc  | Toda função/classe/interface exportada     |
| **Sempre** usar early return             | Evitar aninhamento profundo                |
| **Sempre** validar inputs                | Nunca confiar em dados externos            |
| **Sempre** usar `const` quando possível  | TS: `as const`, Dart: `const` constructors |

---

## 4. TypeScript — Regras Específicas

### 4.1 Operadores

```typescript
// ❌ ERRADO — || para default values
const port = process.env.PORT || 3333;
const name = user.name || 'Anônimo';

// ✅ CORRETO — ?? para nullish coalescing
const port = Number(process.env['PORT'] ?? 3333);
const name = user.name ?? 'Anônimo';

// ✅ OK — || em condições booleanas puras
if (!workshopId || !name) { return reply.status(400)... }
if (loading || disabled) { ... }
```

### 4.2 Tipagem

```typescript
// ❌ ERRADO
const data: any = await response.json();
const items = result as Item[];
const where: Record<string, any> = {};

// ✅ CORRETO
const data: unknown = await response.json();
const items = isItemArray(data) ? data : [];
const where: Record<string, string> = {};
```

### 4.3 Imports

```typescript
// ❌ ERRADO
import { FastifyInstance } from 'fastify';

// ✅ CORRETO — type imports para tipos
import type { FastifyInstance } from 'fastify';
```

### 4.4 Outras Regras TS

- Strict mode obrigatório (`"strict": true`)
- Usar `.replaceAll()` em vez de `.replace()` para substituições globais
- Usar `globalThis` em vez de `window` no código web
- Top-level `await` em vez de `main().catch()` patterns
- Funções de registro de rotas **NÃO** são `async` (registram, não executam)
- Sempre `await` em `return` dentro de `try/catch`

---

## 5. Dart/Flutter — Regras Específicas

### 5.1 Tipagem

```dart
// ❌ EVITAR — dynamic sem necessidade
dynamic result = await fetchData();
var items = someList;

// ✅ CORRETO — tipos explícitos
final Map<String, Object?> result = await fetchData();
final List<String> items = someList;

// ✅ ACEITÁVEL — dynamic apenas para JSON decode (sem modelo tipado)
final Map<String, dynamic> json = jsonDecode(response.body);
// Justificativa: jsonDecode retorna dynamic por design do Dart
```

### 5.2 Outras Regras Dart

- `const` constructors sempre que possível
- DartDoc (`///`) em toda classe, método e widget público
- Screen files em `lib/screens/`, services em `lib/services/`
- Preferir `StatelessWidget` a menos que estado seja necessário
- Nunca usar `print()` em produção — usar logger

---

## 6. React/Web — Regras Específicas

- `useEffect` para side effects, **NUNCA** `useState` com callback de inicialização
- `globalThis` em vez de `window`
- Props tipadas via interface, nunca `any`
- Componentes documentados com JSDoc
- `??` para fallbacks, `||` apenas em boolean JSX (`disabled={loading || !token}`)

---

## 7. Documentação de Código

### 7.1 Padrão de Comentários — Rotas API

```typescript
// ❌ PROIBIDO — comentários decorativos sem valor
// ── GET /workshops/:workshopId/vehicles ─────────────────────────────────
app.get(...)

// ✅ CORRETO — JSDoc descritivo antes do handler
/** Lista veículos de uma oficina, com filtro opcional por cliente. */
app.get<{ Params: { workshopId: string }; Querystring: { customerId?: string } }>(...)
```

### 7.2 Padrão Geral

```typescript
// ❌ PROIBIDO
// This function creates a customer
export function createCustomer() {}

// ✅ CORRETO
/** Cria um novo cliente vinculado a uma oficina. */
export function createCustomer() {}
```

### 7.3 Requisitos por Stack

| Stack   | Ferramenta      | Comando                      |
| ------- | --------------- | ---------------------------- |
| Backend | JSDoc + TypeDoc | `pnpm docs:api`              |
| Web     | JSDoc + TypeDoc | `pnpm docs:packages`         |
| Mobile  | DartDoc         | `cd apps/mobile && dart doc` |
| Swagger | Schema objects  | Automático via `/docs`       |

---

## 8. Naming Conventions

| Artefato         | Convenção          | Exemplo                        |
| ---------------- | ------------------ | ------------------------------ |
| Arquivos TS      | `kebab-case`       | `customer.controller.ts`       |
| Classes          | `PascalCase`       | `CreateCustomerUseCase`        |
| Interfaces/Types | `PascalCase`       | `CustomerDTO`, `ApiResponse`   |
| Funções          | `camelCase`        | `customerRoutes`, `toDTO`      |
| Constantes       | `UPPER_SNAKE_CASE` | `STATUS_LABELS`, `MAX_RETRIES` |
| Pastas           | `kebab-case`       | `service-order/`, `use-cases/` |
| Arquivos Dart    | `snake_case`       | `api_service.dart`             |
| Classes Dart     | `PascalCase`       | `OrdersScreen`                 |

---

## 9. Estrutura de Módulo (Backend)

```
modules/<feature>/
├── domain/
│   └── entities/<feature>.ts
├── application/
│   └── use-cases/<feature>.use-cases.ts
├── infrastructure/
│   └── repositories/<feature>.repository.ts
└── interfaces/
    └── http/
        ├── <feature>.controller.ts
        └── <feature>.schemas.ts
```

---

## 10. Shared Packages

| Package                | Propósito                                   |
| ---------------------- | ------------------------------------------- |
| `@torquehub/contracts` | DTOs, tipos de request/response, API shapes |
| `@torquehub/entities`  | `BaseEntity`, `ValueObject`, `DomainError`  |
| `@torquehub/utils`     | `formatCurrency`, `slugify`, `generateId`   |
| `@torquehub/design-tokens` | Tokens de design (cores, fontes, espaçamento) |

- Shared packages **nunca** importam de `apps/*`
- Para UI: **Sempre** use tokens do design system (`DESIGN_SYSTEM.md`)

---

## 11. API Design

### Response Format

```typescript
{ "success": true, "data": T }
{ "success": true, "data": T, "meta": { "total": 42 } }
{ "success": false, "data": undefined, "meta": { "error": "mensagem" } }
```

### REST Conventions

| Ação              | Método   | Path             | Status |
| ----------------- | -------- | ---------------- | ------ |
| Criar             | `POST`   | `/resources`     | 201    |
| Listar            | `GET`    | `/resources`     | 200    |
| Buscar por ID     | `GET`    | `/resources/:id` | 200    |
| Atualizar         | `PUT`    | `/resources/:id` | 200    |
| Atualizar parcial | `PATCH`  | `/resources/:id` | 200    |
| Deletar           | `DELETE` | `/resources/:id` | 200    |

### Swagger

Todos os endpoints DEVEM ter schemas documentados com:

- Body, params, querystring e responses (sucesso + erro)
- Tags por módulo

---

## 12. Database

- **ORM**: Prisma 7.x com `@prisma/adapter-pg`
- **DB**: PostgreSQL 17 (Docker)
- **Migrations**: Nomes descritivos (`init_domain_models`, `add_media_table`)
- **Env**: `DATABASE_URL` **obrigatória** (nunca hardcodar)
- **Seed**: `prisma/seed.ts` com `await` no top level

---

## 13. Git Workflow

- **main**: código pronto para produção
- **develop**: branch de integração
- **feature/\***: uma branch por feature/issue
- Mensagens: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Sempre commitar a partir da branch `develop`

---

## 14. Environment Setup

```bash
docker compose up -d
pnpm install
pnpm --filter torquehub-api db:push
pnpm --filter torquehub-api db:seed
pnpm dev:api         # API na porta 3333
pnpm dev:web         # Web na porta 5173
cd apps/mobile && flutter run
```

---

## 15. Instruções para Agentes IA

Ao trabalhar neste projeto como assistente de código IA:

1. **Ler** este arquivo E a documentação master ANTES de qualquer ação
2. **Consultar** padrões existentes no código antes de criar novos arquivos
3. **Nunca** exceder 200 linhas por arquivo
4. **Seguir** a estrutura de módulos exatamente
5. **Executar** `get_errors()` após mudanças para verificar
6. **Testar** endpoints com curl após implementação
7. **Atualizar** documentação ao adicionar features
8. **Usar** branch `develop` para todo trabalho
9. **Nunca** hardcodar credenciais
10. **Nunca** batch-kill `node.exe` ou `dart.exe` — encerrar processos cirurgicamente
11. **Nunca** usar `any`, `||` para defaults, `!`, ou comentários decorativos
12. **Sempre** responder em português brasileiro
13. **Sempre** usar JSDoc descritivo, não comentários de linha decorativos
14. **Nunca** criar arquivos desnecessários — só o essencial para a task
