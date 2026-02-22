# TorqueHub — Instruções para Agentes IA (Copilot / Cursor / Cline)

> Este arquivo é carregado automaticamente pelo GitHub Copilot no VS Code.
> Qualquer agente IA DEVE seguir estas regras ao gerar ou modificar código.
> Última atualização: 2026-02-22

---

## Pré-requisitos — Leitura Obrigatória

Antes de **qualquer** ação, leia estes documentos na íntegra:

1. `PROJECT_CONVENTIONS.md` — regras de código, arquitetura, naming, proibições
2. `DESIGN_SYSTEM.md` — tokens visuais, componentes, como usar cores/fontes/espaçamento
3. `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md` — contexto do produto
4. `documentation/architecture/MULTI_TENANCY_ARCHITECTURE.md` — **arquitetura multi-tenancy (OBRIGATÓRIO)**

---

## Arquitetura Multi-Tenancy — Regras Fundamentais

> O TorqueHub é um SaaS multi-tenant. Cada oficina (`Workshop`) é um tenant isolado.
> TODAS as decisões de código DEVEM respeitar este modelo.

### Modelo de Papéis (UserRole) — 3 níveis

| Role             | workshopId         | Acessa                                       |
| ---------------- | ------------------ | -------------------------------------------- |
| `PLATFORM_ADMIN` | `null`             | Todas oficinas, métricas globais, onboarding |
| `WORKSHOP_OWNER` | `uuid` obrigatório | Tudo na própria oficina, cadastra mecânicos  |
| `MECHANIC`       | `uuid` obrigatório | OS atribuídas, upload de fotos               |

**NUNCA use `ADMIN` sozinho.** O enum correto é `PLATFORM_ADMIN` ou `WORKSHOP_OWNER`.

### JWT Payload — Estrutura Oficial

```typescript
interface JwtPayload {
  sub: string; // userId
  workshopId: string | null; // null SOMENTE para PLATFORM_ADMIN
  role: 'PLATFORM_ADMIN' | 'WORKSHOP_OWNER' | 'MECHANIC';
}
```

### Isolamento de Dados — Regras de Ouro

```
1. TODA query a Customer, Vehicle, ServiceOrder, User DEVE filtrar por workshopId
2. O Tenant Context Middleware (shared/infrastructure/auth/tenant-context.ts) injeta
   request.tenantId automaticamente — NUNCA ignore
3. PLATFORM_ADMIN acessa cross-tenant via query param ?workshopId=
4. WORKSHOP_OWNER e MECHANIC SEMPRE recebem workshopId do JWT — NUNCA do body/query
5. Repositories usam scopedPrisma(tenantId) — NUNCA prisma direto em rotas tenant-scoped
```

### Role Guard — Toda rota protegida DEVE declarar roles

```typescript
// ✅ CORRETO — roles explícitos
app.post('/users', {
  onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')],
  handler: createUserHandler,
});

// ❌ PROIBIDO — rota sem role guard (exceto /public/* e /auth/*)
app.post('/users', { handler: createUserHandler });
```

### Matriz de Permissões

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

## Estrutura de Módulos API — Padrão

### Módulos existentes (tenant-scoped)

```
modules/
├── auth/           → Login, register, profile (/auth/*)
├── customer/       → CRUD clientes (/customers/*)
├── vehicle/        → CRUD veículos (/vehicles/*)
├── service-order/  → CRUD OS + media + quote (/service-orders/*)
├── lookup/         → Busca oficinas (/workshops/*)
└── admin/          → CRUD oficinas + users (/admin/*) — PLATFORM_ADMIN only
```

### Criando um novo endpoint

```
1. Crie dentro de modules/<feature>/
   ├── domain/entities/      (tipos, interfaces)
   ├── application/use-cases/ (lógica de negócio)
   ├── infrastructure/repositories/ (acesso a dados)
   └── interfaces/http/      (controller + schemas)

2. Controller DEVE:
   - Usar requireRole() com roles explícitos
   - Receber tenantId via request.tenantId (NUNCA do body)
   - Usar scopedPrisma(tenantId) nos repositories
   - Ter schema Swagger documentado

3. Resposta padrão: { success: true, data: T }
4. Erros padrão: { success: false, data: null, meta: { error: string } }
```

---

## Portais Web — Estrutura de Rotas

```
apps/web/src/
├── pages/
│   ├── public/           ← Viewer de orçamento (sem auth)
│   ├── admin/            ← PLATFORM_ADMIN only
│   │   ├── DashboardPage.tsx
│   │   ├── WorkshopsPage.tsx
│   │   ├── WorkshopDetailPage.tsx
│   │   └── SettingsPage.tsx
│   └── backoffice/       ← WORKSHOP_OWNER only
│       ├── DashboardPage.tsx
│       ├── MechanicsPage.tsx
│       ├── OrdersPage.tsx
│       ├── CustomersPage.tsx
│       ├── ReportsPage.tsx
│       └── SettingsPage.tsx
├── guards/
│   └── RoleGuard.tsx     ← Redirect por JWT role
└── layouts/
    ├── AdminLayout.tsx
    └── BackofficeLayout.tsx
```

**Roteamento:**

- `/admin/*` → `RoleGuard(['PLATFORM_ADMIN'])`
- `/backoffice/*` → `RoleGuard(['WORKSHOP_OWNER'])`
- `/public/*` → sem auth
- Login unificado em `/login` → redirect por role

---

## App Mobile — Diferenciação por Role

Um único APK. Após login, a navegação muda conforme o role:

| Role           | Bottom Nav                                         |
| -------------- | -------------------------------------------------- |
| WORKSHOP_OWNER | OS · Clientes · Veículos · Equipe · Config         |
| MECHANIC       | Minhas OS · Upload                                 |
| PLATFORM_ADMIN | Dashboard overview (funcionalidades pesadas = web) |

---

## Quando e Onde Mexer — Mapa de Decisão

### Preciso alterar uma COR, FONTE, ESPAÇAMENTO ou BORDER RADIUS?

```
1. Edite APENAS → packages/design-tokens/tokens.json
2. Execute      → pnpm --filter @torquehub/design-tokens generate
3. Arquivos gerados automaticamente (NUNCA edite direto):
   - apps/web/src/styles/tokens.css
   - apps/mobile/lib/theme/app_tokens.dart
```

### Preciso renderizar um STATUS de ordem de serviço?

```
Web    → import { statusConfig } from '@torquehub/design-tokens';
         const info = statusConfig['IN_PROGRESS'];

Mobile → import '../theme/status_config.dart';
         final info = getStatusInfo('IN_PROGRESS');

NUNCA crie mapas de status locais. Use o centralizado.
```

### Preciso criar ou alterar um COMPONENTE WEB?

```
1. Use CSS custom properties: var(--color-brand-primary), var(--space-8), etc.
2. Use classes globais quando existirem: .card, .btn, .section-title, etc.
3. Para dados de status: import { statusConfig } from '@torquehub/design-tokens'
4. Props interfaces DEVEM ter campos readonly
5. Retorno tipado como ReactNode
6. ÍCONES — sempre import de 'components/icons' (nunca emoji/Unicode)
7. ESTILOS — sempre via className + CSS classes (nunca style={{ }} inline)
```

### Ícones no Web — Regras Obrigatórias (lucide-react)

```
1. Biblioteca: lucide-react (já instalada)
2. Importar SEMPRE de: import { NomeIcon } from '../components/icons'
   - Este módulo centraliza e re-exporta todos os ícones usados no projeto
   - Para adicionar um ícone novo: adicione o export em components/icons.ts
3. NUNCA usar emojis (📊, 📋, 🔧, ❌, ✅) como ícones de UI
4. NUNCA importar direto de 'lucide-react' — usar o módulo centralizado
5. Para ícones de status de OS: import { getStatusIcon } from '../components/statusIcons'
   - Retorna o LucideIcon component correspondente ao status
6. Tamanhos padrão de ícone:
   - Inline em texto / botão: size={16}
   - Em nav items / labels: size={18}
   - Em cards / destaques: size={20} a size={28}
   - Hero / destaque grande: size={48}
7. Quando o ícone aparece junto com texto, o container DEVE ter:
   display: flex; align-items: center; gap: var(--space-2);
```

### Estilos no Web — NUNCA usar inline styles

```
1. PROIBIDO: style={{ fontSize: 14, padding: '8px', color: '#fff' }}
2. OBRIGATÓRIO: className="minha-classe" + definição em global.css
3. Cores dinâmicas (ex: status color do backend) são a ÚNICA exceção:
   style={{ backgroundColor: info.color }} — quando o valor vem de dados
4. Todas as classes DEVEM usar CSS custom properties (tokens):
   - Cores: var(--color-brand-primary), var(--color-neutral-400), etc.
   - Espaçamento: var(--space-2), var(--space-4), etc.
   - Tipografia: var(--font-size-sm), var(--font-weight-bold), etc.
   - Bordas: var(--radius-md), var(--radius-xl), etc.
5. NUNCA usar cores hex literais (#fff, #94a3b8) — usar tokens
6. Classes utilitárias disponíveis em global.css:
   - Layout: .card, .section-title, .table-wrapper, .data-table
   - Tabela: .th-center, .th-right, .td-center, .td-right, .td-bold
   - Status: .status-banner, .status-banner-icon, .status-banner-label
   - Veículo: .vehicle-row, .vehicle-name, .vehicle-details, .vehicle-plate
   - Histórico: .history-list, .history-entry, .history-entry-header, etc.
   - Formulário: .form-group, .form-input, .form-select, .form-textarea
```

### Preciso criar ou alterar um WIDGET FLUTTER?

```
1. Cores        → TqTokens.primary, TqTokens.success, TqTokens.neutral200...
2. Font sizes   → TqTokens.fontSizeLg, TqTokens.fontSizeXs...
3. Font weights → TqTokens.fontWeightSemibold, TqTokens.fontWeightBold...
4. Espaçamento  → TqTokens.space4, TqTokens.space8, TqTokens.space12...
5. Border radius→ TqTokens.radiusXl, TqTokens.radiusMd...
6. Status       → getStatusInfo(status).color / .label / .icon
7. SnackBar     → backgroundColor: TqTokens.success (ok) ou TqTokens.danger (erro)
8. Tema         → AppTheme.light (já aplicado no main.dart)
```

### Preciso adicionar uma TELA no mobile?

```
Arquivo: apps/mobile/lib/screens/<nome>_screen.dart
Import tema: import '../theme/app_tokens.dart';
Import status (se precisar): import '../theme/status_config.dart';
O tema global (AppTheme.light) já configura Card, Button, Input, etc.
```

---

## Proibições Absolutas

| NUNCA faça isto                                  | Motivo                                        |
| ------------------------------------------------ | --------------------------------------------- |
| Editar `tokens.css` ou `app_tokens.dart`         | São GERADOS. Edite `tokens.json` e regenere   |
| Usar `Color(0xFF...)` hardcoded no Flutter       | Use `TqTokens.*`                              |
| Usar cor hex literal no CSS                      | Use `var(--color-*)`                          |
| Criar mapa de status local                       | Use `statusConfig` centralizado               |
| Exceder 200 linhas por arquivo                   | Dividir em módulos menores                    |
| Usar `any` (TS) ou `dynamic` sem necessidade     | Tipagem obrigatória                           |
| Usar `\|\|` para default values                  | Usar `??` (nullish coalescing)                |
| Usar `!` (non-null assertion)                    | Usar type guards ou `??`                      |
| Esquecer JSDoc/DartDoc em exports                | Documentação obrigatória                      |
| Hardcodar credenciais ou URLs de produção        | Usar variáveis de ambiente / AppConfig        |
| Usar `console.log` em produção                   | Usar logger estruturado                       |
| Criar comentários decorativos (`// ── ... ──`)   | Usar JSDoc descritivo                         |
| Usar magic strings/números hardcodados           | Extrair para constantes em arquivos dedicados |
| Usar nomes abreviados em callbacks (`m`, `x`)    | Usar nomes descritivos (`media`, `order`)     |
| Usar role `ADMIN` sozinho                        | Use `PLATFORM_ADMIN` ou `WORKSHOP_OWNER`      |
| Acessar dados sem filtrar workshopId             | Use `scopedPrisma(tenantId)`                  |
| Criar rota sem `requireRole()`                   | Exceto `/public/*` e `/auth/*`                |
| Aceitar workshopId do body em rotas autenticadas | Use `request.tenantId` do middleware          |
| Usar emojis como ícones na UI web                | Use `lucide-react` via `components/icons.ts`  |
| Importar lucide-react diretamente                | Use o módulo centralizado `components/icons`  |
| Usar `style={{ }}` inline em componentes web     | Use `className` + CSS classes em `global.css` |
| Usar cores hardcoded (`#fff`, `#94a3b8`)         | Use CSS tokens: `var(--color-*)`              |

---

## Magic Strings e Nomes Descritivos — Regras Obrigatórias

### NUNCA hardcodar strings ou valores mágicos inline

Todo valor literal que represente um tipo, status, configuração ou classificação
**DEVE** ser extraído para uma constante nomeada em um arquivo auxiliar ou global.

```typescript
// ❌ PROIBIDO — magic string inline
const photos = order.media.filter((m) => m.type === 'PHOTO');
if (status === 'IN_PROGRESS') { ... }
const maxRetries = 3;

// ✅ CORRETO — constantes nomeadas em arquivo dedicado
export const MEDIA_TYPE = { PHOTO: 'PHOTO', VIDEO: 'VIDEO' } as const;
export const MAX_RETRIES = 3;

const photos = order.media.filter((media) => media.type === MEDIA_TYPE.PHOTO);
if (status === ORDER_STATUS.IN_PROGRESS) { ... }
```

```dart
// ❌ PROIBIDO — magic string inline no Dart
final photos = media.where((m) => m.type == 'PHOTO');

// ✅ CORRETO — constante nomeada
class MediaType {
  static const photo = 'PHOTO';
  static const video = 'VIDEO';
}
final photos = media.where((media) => media.type == MediaType.photo);
```

**Onde colocar as constantes:**

| Escopo              | Localização                                       |
| ------------------- | ------------------------------------------------- |
| Global (todas apps) | `packages/contracts/src/constants.ts`             |
| Módulo (API)        | `modules/<feature>/domain/constants.ts`           |
| Mobile (Dart)       | `lib/utils/constants.dart` ou no módulo relevante |
| Web                 | `src/utils/constants.ts`                          |

### NUNCA usar nomes abreviados em callbacks e parâmetros

```typescript
// ❌ PROIBIDO
orders.filter((o) => o.status === 'OPEN');
media.map((m) => m.url);

// ✅ CORRETO
orders.filter((order) => order.status === ORDER_STATUS.OPEN);
media.map((mediaItem) => mediaItem.url);
```

---

## Arquivos-Chave por Responsabilidade

| Responsabilidade               | Arquivo(s)                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| Tokens visuais (fonte verdade) | `packages/design-tokens/tokens.json`                        |
| Geração de tokens              | `packages/design-tokens/generate.mjs`                       |
| Tokens TS para import web      | `packages/design-tokens/src/*.ts`                           |
| CSS custom properties (gerado) | `apps/web/src/styles/tokens.css`                            |
| Estilos globais web            | `apps/web/src/styles/global.css`                            |
| Ícones centralizados (web)     | `apps/web/src/components/icons.ts`                          |
| Ícones de status OS (web)      | `apps/web/src/components/statusIcons.ts`                    |
| Tokens Dart (gerado)           | `apps/mobile/lib/theme/app_tokens.dart`                     |
| Tema Material 3                | `apps/mobile/lib/theme/app_theme.dart`                      |
| Config de status (Dart)        | `apps/mobile/lib/theme/status_config.dart`                  |
| Config de status (TS)          | `packages/design-tokens/src/status.ts`                      |
| DTOs compartilhados            | `packages/contracts/src/index.ts`                           |
| Regras de código               | `PROJECT_CONVENTIONS.md`                                    |
| Design System completo         | `DESIGN_SYSTEM.md`                                          |
| Documentação do produto        | `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md`      |
| **Arquitetura multi-tenancy**  | `documentation/architecture/MULTI_TENANCY_ARCHITECTURE.md`  |
| Configuração do app mobile     | `apps/mobile/lib/services/app_config.dart`                  |
| Tenant Context Middleware      | `apps/api/src/shared/infrastructure/auth/tenant-context.ts` |
| Role Guard                     | `apps/api/src/shared/infrastructure/auth/role-guard.ts`     |
| Auth Plugin (JWT)              | `apps/api/src/shared/infrastructure/auth/auth.plugin.ts`    |

---

## Fluxo de Trabalho Padrão

1. Ler `PROJECT_CONVENTIONS.md` + `DESIGN_SYSTEM.md` + `MULTI_TENANCY_ARCHITECTURE.md`
2. Trabalhar na branch `develop`
3. Usar tokens para qualquer valor visual
4. Tipar tudo explicitamente (TS strict, Dart explicit)
5. Toda rota API deve ter `requireRole()` e usar `request.tenantId`
6. JSDoc/DartDoc em toda função/classe exportada
7. Rodar `get_errors()` após mudanças
8. Testar endpoints com curl
9. Commit com prefixo: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
10. Push para `develop`, merge para `main` quando pronto para produção

---

## Idioma

Sempre responder em **português brasileiro (pt-BR)**.
