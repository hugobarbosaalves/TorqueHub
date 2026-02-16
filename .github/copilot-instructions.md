# TorqueHub — Instruções para Agentes IA (Copilot / Cursor / Cline)

> Este arquivo é carregado automaticamente pelo GitHub Copilot no VS Code.
> Qualquer agente IA DEVE seguir estas regras ao gerar ou modificar código.

---

## Pré-requisitos — Leitura Obrigatória

Antes de **qualquer** ação, leia estes dois documentos na íntegra:

1. `PROJECT_CONVENTIONS.md` — regras de código, arquitetura, naming, proibições
2. `DESIGN_SYSTEM.md` — tokens visuais, componentes, como usar cores/fontes/espaçamento
3. `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md` — contexto do produto

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
         // info.label, info.icon, info.color

Mobile → import '../theme/status_config.dart';
         final info = getStatusInfo('IN_PROGRESS');
         // info.label, info.icon, info.color

NUNCA crie mapas de status locais. Use o centralizado.
```

### Preciso criar ou alterar um COMPONENTE WEB?

```
1. Use CSS custom properties: var(--color-brand-primary), var(--space-8), etc.
2. Use classes globais quando existirem: .card, .btn, .section-title, etc.
3. Para dados de status: import { statusConfig } from '@torquehub/design-tokens'
4. Props interfaces DEVEM ter campos readonly
5. Retorno tipado como ReactNode
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

### Preciso adicionar um ENDPOINT na API?

```
Seguir estrutura de módulo:
  modules/<feature>/
  ├── domain/entities/
  ├── application/use-cases/
  ├── infrastructure/repositories/
  └── interfaces/http/ (controller + schemas)

Resposta padrão: { success: true, data: T }
Swagger obrigatório com schema documentado.
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

| NUNCA faça isto                                | Motivo                                      |
| ---------------------------------------------- | ------------------------------------------- |
| Editar `tokens.css` ou `app_tokens.dart`       | São GERADOS. Edite `tokens.json` e regenere |
| Usar `Color(0xFF...)` hardcoded no Flutter     | Use `TqTokens.*`                            |
| Usar cor hex literal no CSS                    | Use `var(--color-*)`                        |
| Criar mapa de status local                     | Use `statusConfig` centralizado             |
| Exceder 200 linhas por arquivo                 | Dividir em módulos menores                  |
| Usar `any` (TS) ou `dynamic` sem necessidade   | Tipagem obrigatória                         |
| Usar `\|\|` para default values                | Usar `??` (nullish coalescing)              |
| Usar `!` (non-null assertion)                  | Usar type guards ou `??`                    |
| Esquecer JSDoc/DartDoc em exports              | Documentação obrigatória                    |
| Hardcodar credenciais ou URLs de produção      | Usar variáveis de ambiente / AppConfig      |
| Usar `console.log` em produção                 | Usar logger estruturado                     |
| Criar comentários decorativos (`// ── ... ──`) | Usar JSDoc descritivo                       |

---

## Arquivos-Chave por Responsabilidade

| Responsabilidade               | Arquivo(s)                                             |
| ------------------------------ | ------------------------------------------------------ |
| Tokens visuais (fonte verdade) | `packages/design-tokens/tokens.json`                   |
| Geração de tokens              | `packages/design-tokens/generate.mjs`                  |
| Tokens TS para import web      | `packages/design-tokens/src/*.ts`                      |
| CSS custom properties (gerado) | `apps/web/src/styles/tokens.css`                       |
| Estilos globais web            | `apps/web/src/styles/global.css`                       |
| Tokens Dart (gerado)           | `apps/mobile/lib/theme/app_tokens.dart`                |
| Tema Material 3                | `apps/mobile/lib/theme/app_theme.dart`                 |
| Config de status (Dart)        | `apps/mobile/lib/theme/status_config.dart`             |
| Config de status (TS)          | `packages/design-tokens/src/status.ts`                 |
| DTOs compartilhados            | `packages/contracts/src/index.ts`                      |
| Regras de código               | `PROJECT_CONVENTIONS.md`                               |
| Design System completo         | `DESIGN_SYSTEM.md`                                     |
| Documentação do produto        | `documentation/idea/TORQUEHUB_MASTER_DOCUMENTATION.md` |
| Configuração do app mobile     | `apps/mobile/lib/services/app_config.dart`             |

---

## Fluxo de Trabalho Padrão

1. Ler `PROJECT_CONVENTIONS.md` + `DESIGN_SYSTEM.md`
2. Trabalhar na branch `develop`
3. Usar tokens para qualquer valor visual
4. Tipar tudo explicitamente (TS strict, Dart explicit)
5. JSDoc/DartDoc em toda função/classe exportada
6. Rodar `get_errors()` após mudanças
7. Testar endpoints com curl
8. Commit com prefixo: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
9. Push para `develop`, merge para `main` quando pronto para produção

---

## Idioma

Sempre responder em **português brasileiro (pt-BR)**.
