# 🚗 TorqueHub

Plataforma de gestão de manutenção automotiva.

**Mecânicos** usam o app mobile para criar ordens de serviço, registrar fotos/vídeos e gerenciar histórico veicular.
**Clientes** acessam um portal web para visualizar orçamentos, aprovar serviços e acompanhar o histórico.

---

## 📦 Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Monorepo | pnpm workspace | 10.29.3 |
| Backend | Node.js + Fastify + TypeScript | Node 24.13.1 / Fastify 5.7.4 / TS 5.9.3 |
| Web | React + Vite + TypeScript | React 19.2.4 / Vite 7.3.1 |
| Mobile | Flutter | 3.41.0 |
| Linting | ESLint + Prettier | ESLint 9.28.0 / Prettier 3.8.1 |

---

## 📁 Estrutura do Projeto

```
torquehub/
├── apps/
│   ├── api/              # torquehub-api (Fastify)
│   ├── web/              # torquehub-web (React + Vite)
│   └── mobile/           # torquehub-mobile (Flutter - isolado)
├── packages/
│   ├── contracts/        # Tipos compartilhados (DTOs, interfaces)
│   ├── entities/         # BaseEntity, ValueObject, DomainError
│   └── utils/            # Helpers puros (isDefined, assert, etc.)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── .prettierrc
├── .editorconfig
├── .gitignore
└── README.md
```

---

## 🚀 Como Rodar

### Pré-requisitos

- Node.js >= 24.x
- pnpm >= 10.x
- Flutter >= 3.41.0 _(apenas para mobile)_

### Instalar dependências

```bash
pnpm install
```

### API (Backend)

```bash
pnpm dev:api
# Roda em http://localhost:3333
```

### Web (Frontend)

```bash
pnpm dev:web
# Roda em http://localhost:5173
```

### Mobile (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## 🏗 Arquitetura

O backend segue **Clean Architecture pragmática** como monolito modular:

```
modules/{module}/
  domain/
    entities/          # Entidades de domínio
  application/
    use-cases/         # Casos de uso (lógica de negócio)
  infrastructure/
    repositories/      # Acesso a dados
  interfaces/
    http/              # Controllers (Fastify routes)
```

### Regras Arquiteturais

- Controller **NÃO** acessa banco diretamente
- UseCase **NÃO** depende de Fastify
- Domain **NÃO** depende de infraestrutura
- Sem lógica de negócio no controller
- Sempre usar early return
- Preferir `??` ao invés de `||`
- Nunca usar `any`
- Sempre tipar retorno explicitamente
- Separar DTO de entidade de domínio

---

## 📦 Como Criar Novo Módulo

1. Crie a pasta em `apps/api/src/modules/{module-name}/`
2. Siga a estrutura:
   ```
   domain/entities/
   application/use-cases/
   infrastructure/repositories/
   interfaces/http/
   ```
3. Registre as rotas em `apps/api/src/app.ts`

---

## 📦 Como Adicionar Novo Package

1. Crie a pasta em `packages/{package-name}/`
2. Adicione `package.json` com nome `@torquehub/{package-name}`
3. Adicione `tsconfig.json` estendendo de `../../tsconfig.base.json`
4. Atualize `tsconfig.base.json` com o novo path mapping
5. Execute `pnpm install`

---

## 🧹 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev:api` | Inicia API em modo desenvolvimento |
| `pnpm dev:web` | Inicia Web em modo desenvolvimento |
| `pnpm build` | Build de todos os projetos |
| `pnpm lint` | Lint de todos os projetos |
| `pnpm format` | Formata código com Prettier |

---

## 📌 Filosofia

- **Modular** — cada domínio é um módulo isolado
- **Simples** — sem overengineering, sem CQRS/Event Sourcing
- **Escalável** — pronto para crescer de monolito para microserviços
- **Profissional** — Clean Architecture pragmática desde o dia 1
- **MVP First** — foco em entregar valor rápido
