# TorqueHub — Cenários de Teste Manual (Multi-Tenancy)

> Guia passo a passo para validar toda a implementação multi-tenancy.
> Última atualização: 2026-02-21

---

## Pré-requisitos

### Ambiente

1. **API rodando** em `http://localhost:3333`
   ```bash
   pnpm --filter torquehub-api dev
   ```
2. **Web rodando** em `http://localhost:5173`
   ```bash
   pnpm --filter torquehub-web dev
   ```
3. **Mobile** — emulador ou dispositivo apontando para o IP da máquina
4. **Banco de dados** com seed aplicado:
   ```bash
   pnpm --filter torquehub-api prisma:seed
   ```

### Credenciais do Seed

| Usuário              | Email                    | Senha      | Role           |
| -------------------- | ------------------------ | ---------- | -------------- |
| Hugo (plataforma)    | `hugo@torquehub.com.br`  | `admin123` | PLATFORM_ADMIN |
| Admin (oficina seed) | `admin@torquehub.com.br` | `admin123` | WORKSHOP_OWNER |

### Swagger

Acesse `http://localhost:3333/docs` para testar endpoints diretamente.

---

## Legenda

- ✅ = Resultado esperado (deve acontecer)
- ❌ = Resultado que NÃO deve acontecer (erro de segurança se acontecer)
- 🔑 = Guardar valor para usar em cenários seguintes
- ⚠️ = Teste de segurança crítico

---

## BLOCO 1 — Login e Redirecionamento por Role

### 1.1 Login como PLATFORM_ADMIN (Web)

1. Abra `http://localhost:5173/login`
2. Digite: `hugo@torquehub.com.br` / `admin123`
3. Clique em **Entrar**

✅ Deve redirecionar para `/admin` (Dashboard do Admin)
✅ Sidebar deve mostrar: Dashboard, Oficinas, Configurações
❌ NÃO deve mostrar itens do backoffice (Clientes, OS, etc.)

### 1.2 Login como WORKSHOP_OWNER (Web)

1. Abra aba anônima → `http://localhost:5173/login`
2. Digite: `admin@torquehub.com.br` / `admin123`
3. Clique em **Entrar**

✅ Deve redirecionar para `/backoffice` (Dashboard do Backoffice)
✅ Sidebar deve mostrar: Dashboard, Ordens de Serviço, Clientes, Equipe, Relatórios, Configurações

### 1.3 Acesso direto a rota errada (Web)

1. Logado como WORKSHOP_OWNER, tente acessar `http://localhost:5173/admin`

✅ Deve redirecionar para `/backoffice` (ou tela de acesso negado)
❌ NÃO deve mostrar o painel admin

### 1.4 Login como PLATFORM_ADMIN (Mobile)

1. Abra o app mobile
2. Login: `hugo@torquehub.com.br` / `admin123`

✅ Bottom nav deve ter 2 tabs: **Overview** e **Config**
❌ NÃO deve mostrar Clientes, Veículos, Equipe

### 1.5 Login como WORKSHOP_OWNER (Mobile)

1. Abra o app mobile
2. Login: `admin@torquehub.com.br` / `admin123`

✅ Bottom nav deve ter 5 tabs: **Ordens**, **Clientes**, **Veículos**, **Equipe**, **Config**

---

## BLOCO 2 — Onboarding: Criar Oficina + Dono

### 2.1 PLATFORM_ADMIN cria uma nova oficina (Web)

1. Login web como `hugo@torquehub.com.br`
2. Vá em **Oficinas** no menu lateral
3. Clique em **Nova Oficina**
4. Preencha:
   - Nome: `Oficina Teste ABC`
   - CNPJ: `98765432000199`
   - Telefone: `11999998888`
   - Email: `contato@testeabc.com`
5. Salve

✅ A oficina deve aparecer na lista
🔑 Anote o **ID da oficina** (visível na URL ao clicar nela)

### 2.2 Criar o dono (WORKSHOP_OWNER) da nova oficina

1. Na lista de oficinas, clique em **Oficina Teste ABC**
2. Na seção **Equipe**, clique em **Adicionar Usuário**
3. Preencha:
   - Nome: `Carlos Dono`
   - Email: `carlos@testeabc.com`
   - Senha: `senha123`
   - Role: **WORKSHOP_OWNER**
4. Salve

✅ Usuário deve aparecer na lista da equipe
✅ No console da API (se SMTP não configurado), deve logar o email de convite
🔑 Credenciais: `carlos@testeabc.com` / `senha123`

### 2.3 Primeiro login do novo dono (troca de senha obrigatória)

1. Abra aba anônima → `http://localhost:5173/login`
2. Login: `carlos@testeabc.com` / `senha123`

✅ Deve redirecionar para `/backoffice/settings` com mensagem pedindo troca de senha
✅ Formulário de troca de senha deve estar visível

3. Preencha:
   - Senha atual: `senha123`
   - Nova senha: `novaSenha456`
   - Confirmar: `novaSenha456`
4. Salve

✅ Mensagem de sucesso: senha alterada

5. Faça logout e login novamente com `carlos@testeabc.com` / `novaSenha456`

✅ Deve ir direto para `/backoffice` (sem pedir troca de senha novamente)

### 2.4 Primeiro login do novo dono (Mobile — troca de senha)

1. No app mobile, login: `carlos@testeabc.com` / `senha123` (se não trocou antes, ou crie outro user)

✅ Dialog de troca de senha obrigatória deve aparecer
✅ NÃO pode fechar o dialog sem trocar a senha

---

## BLOCO 3 — Dono da Oficina Gerencia Equipe

### 3.1 WORKSHOP_OWNER cria mecânico (Web)

1. Login web como `carlos@testeabc.com` / `novaSenha456`
2. Vá em **Equipe** no menu lateral
3. Clique em **Adicionar Mecânico** (ou similar)
4. Preencha:
   - Nome: `Pedro Mecânico`
   - Email: `pedro@testeabc.com`
   - Senha: `mec12345`
5. Salve

✅ Mecânico deve aparecer na lista
✅ O role deve ser MECHANIC (dono da oficina só pode criar MECHANIC)
🔑 Credenciais: `pedro@testeabc.com` / `mec12345`

### ⚠️ 3.2 WORKSHOP_OWNER tenta criar WORKSHOP_OWNER (deve falhar)

Via Swagger ou curl, logado como Carlos:

```bash
curl -X POST http://localhost:3333/admin/workshops/{ID_OFICINA}/users \
  -H "Authorization: Bearer {TOKEN_CARLOS}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Invasor","email":"hack@test.com","password":"123456","role":"WORKSHOP_OWNER"}'
```

✅ Deve retornar erro 403 — "WORKSHOP_OWNER pode criar apenas MECHANIC"
❌ NÃO deve criar o usuário

### ⚠️ 3.3 WORKSHOP_OWNER tenta acessar outra oficina (deve falhar)

Via curl, logado como Carlos, tente listar usuários da oficina do seed:

```bash
curl http://localhost:3333/admin/workshops/{ID_OFICINA_SEED}/users \
  -H "Authorization: Bearer {TOKEN_CARLOS}"
```

✅ Deve retornar erro 403 — acesso negado (workshopId diferente do JWT)
❌ NÃO deve retornar dados de outra oficina

---

## BLOCO 4 — Mecânico: Permissões Restritas

### 4.1 Login como MECHANIC (Web)

1. Abra aba anônima → `http://localhost:5173/login`
2. Login: `pedro@testeabc.com` / `mec12345` (primeira vez: trocar senha)

✅ Deve pedir troca de senha obrigatória
✅ Após trocar, redireciona para `/backoffice`
✅ Sidebar deve mostrar APENAS: **Dashboard**, **Ordens de Serviço**, **Configurações**
❌ NÃO deve ver: Clientes, Equipe, Relatórios

### ⚠️ 4.2 MECHANIC tenta criar cliente (deve falhar)

Via curl, logado como Pedro:

```bash
curl -X POST http://localhost:3333/customers \
  -H "Authorization: Bearer {TOKEN_PEDRO}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tentativa","phone":"11999999999"}'
```

✅ Deve retornar erro 403 — role insuficiente
❌ Cliente NÃO deve ser criado

### ⚠️ 4.3 MECHANIC tenta deletar ordem de serviço (deve falhar)

Via curl:

```bash
curl -X DELETE http://localhost:3333/service-orders/{ID_OS} \
  -H "Authorization: Bearer {TOKEN_PEDRO}"
```

✅ Deve retornar erro 403
❌ OS NÃO deve ser deletada

### 4.4 MECHANIC pode ver lista de OS (Web)

1. No painel backoffice como Pedro, clique em **Ordens de Serviço**

✅ Deve listar as OS da oficina (se houver)
✅ Pode visualizar detalhes de uma OS

### 4.5 MECHANIC pode fazer upload de mídia

Via curl ou app mobile, logado como Pedro:

```bash
curl -X POST http://localhost:3333/service-orders/{ID_OS}/media \
  -H "Authorization: Bearer {TOKEN_PEDRO}" \
  -F "file=@foto_teste.jpg" \
  -F "caption=Detalhe do motor"
```

✅ Upload deve funcionar (mecânico pode enviar fotos)

### 4.6 Login como MECHANIC (Mobile)

1. No app mobile, login como `pedro@testeabc.com` / nova senha

✅ Bottom nav deve ter 2 tabs: **Minhas OS** e **Config**
❌ NÃO deve ver Clientes, Veículos, Equipe

---

## BLOCO 5 — Isolamento de Dados (Multi-Tenancy)

> ⚠️ Este é o bloco MAIS IMPORTANTE. Garante que dados de uma oficina não vazam para outra.

### 5.1 Preparar dados em duas oficinas diferentes

**Oficina A** (seed) — logado como `admin@torquehub.com.br`:

1. Criar cliente: `Maria da Oficina A` / CPF `11111111111`
2. Criar veículo para Maria: Fiat Uno 2020, Placa `AAA-1111`
3. Criar OS para o veículo de Maria

🔑 Anote o ID do cliente, veículo e OS da Oficina A

**Oficina B** (Teste ABC) — logado como `carlos@testeabc.com`:

1. Criar cliente: `José da Oficina B` / CPF `22222222222`
2. Criar veículo para José: VW Gol 2019, Placa `BBB-2222`
3. Criar OS para o veículo de José

🔑 Anote o ID do cliente, veículo e OS da Oficina B

### ⚠️ 5.2 Oficina A NÃO vê dados da Oficina B

Logado como `admin@torquehub.com.br` (Oficina A):

```bash
# Listar clientes
curl http://localhost:3333/customers \
  -H "Authorization: Bearer {TOKEN_OFICINA_A}"
```

✅ Deve retornar APENAS `Maria da Oficina A` (e João Silva do seed)
❌ NÃO deve aparecer `José da Oficina B`

```bash
# Tentar acessar cliente da Oficina B pelo ID
curl http://localhost:3333/customers/{ID_JOSE} \
  -H "Authorization: Bearer {TOKEN_OFICINA_A}"
```

✅ Deve retornar 404 (não encontrado — pois o filtro de tenant exclui)
❌ NÃO deve retornar dados de José

### ⚠️ 5.3 Oficina B NÃO vê dados da Oficina A

Logado como `carlos@testeabc.com` (Oficina B):

```bash
curl http://localhost:3333/customers \
  -H "Authorization: Bearer {TOKEN_OFICINA_B}"
```

✅ Deve retornar APENAS `José da Oficina B`
❌ NÃO deve aparecer Maria ou João Silva

### ⚠️ 5.4 Veículos isolados entre oficinas

Logado como Oficina B:

```bash
curl http://localhost:3333/vehicles \
  -H "Authorization: Bearer {TOKEN_OFICINA_B}"
```

✅ Deve retornar APENAS `VW Gol BBB-2222`
❌ NÃO deve mostrar `Honda Civic ABC-1234` (da Oficina A)

### ⚠️ 5.5 Ordens de serviço isoladas entre oficinas

Logado como Oficina B:

```bash
curl http://localhost:3333/service-orders \
  -H "Authorization: Bearer {TOKEN_OFICINA_B}"
```

✅ Deve retornar APENAS OS da Oficina B
❌ NÃO deve mostrar OS da Oficina A

### ⚠️ 5.6 PLATFORM_ADMIN vê tudo (cross-tenant)

Logado como `hugo@torquehub.com.br`:

```bash
# Métricas globais
curl http://localhost:3333/admin/metrics \
  -H "Authorization: Bearer {TOKEN_HUGO}"
```

✅ `totalWorkshops` ≥ 2, `totalCustomers` deve contar TODAS as oficinas

```bash
# Listar todas oficinas
curl http://localhost:3333/admin/workshops \
  -H "Authorization: Bearer {TOKEN_HUGO}"
```

✅ Deve listar `Auto Center TorqueHub` e `Oficina Teste ABC`

---

## BLOCO 6 — Fluxo Completo de OS (Workflow)

### 6.1 Criar OS completa (Web)

1. Login web como `admin@torquehub.com.br`
2. Vá em **Ordens de Serviço** → **Nova OS**
3. Selecione cliente: João Silva
4. Selecione veículo: Honda Civic ABC-1234
5. Descrição: `Revisão completa 50.000 km`
6. Adicione itens:
   - `Troca de óleo` — R$ 150,00
   - `Filtro de ar` — R$ 80,00
   - `Alinhamento` — R$ 120,00
7. Salve

✅ OS criada com status **DRAFT** (Rascunho)
✅ Deve aparecer na lista de OS
🔑 Anote o ID da OS

### 6.2 Transição de status da OS

Via Web ou curl, mude o status sequencialmente:

```bash
# DRAFT → PENDING_APPROVAL
curl -X PATCH http://localhost:3333/service-orders/{ID_OS}/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"PENDING_APPROVAL"}'
```

✅ Status deve mudar para PENDING_APPROVAL

Repita para:

- `PENDING_APPROVAL` → `APPROVED`
- `APPROVED` → `IN_PROGRESS`
- `IN_PROGRESS` → `COMPLETED`

✅ Cada transição deve funcionar
✅ Na lista de OS, o badge de status deve atualizar cor e label

### 6.3 Editar OS só funciona em DRAFT

1. Mude uma OS para `IN_PROGRESS`
2. Tente editar (PUT) a OS

```bash
curl -X PUT http://localhost:3333/service-orders/{ID_OS} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"description":"Tentativa de edição"}'
```

✅ Deve retornar erro — edição só permitida em DRAFT
❌ Descrição NÃO deve ser alterada

---

## BLOCO 7 — Orçamento Público (Quote Link)

### 7.1 Gerar link público da OS

1. Com uma OS criada e com itens, pegue o `publicToken` da OS
   (visível na resposta do GET da OS ou na interface)

🔑 Anote o `publicToken`

### 7.2 Acessar orçamento sem login

1. Em aba anônima (sem login), acesse:
   ```
   http://localhost:5173/order/{publicToken}
   ```

✅ Deve mostrar o orçamento com dados do veículo, itens e valores
✅ NÃO deve exigir login
❌ NÃO deve mostrar informações sensíveis do workshop (usuários, etc.)

### 7.3 API pública do orçamento

```bash
# Sem token JWT — acesso público
curl http://localhost:3333/public/orders/{publicToken}
```

✅ Deve retornar dados da OS
✅ Deve incluir itens, valores, dados do veículo

```bash
curl http://localhost:3333/public/orders/{publicToken}/pdf
```

✅ Deve retornar o PDF do orçamento (ou erro se funcionalidade ainda não gerada)

---

## BLOCO 8 — Upload de Mídia (Fotos/Vídeos)

### 8.1 Upload pelo app mobile (como mecânico)

1. Login mobile como `pedro@testeabc.com`
2. Abra uma OS da lista
3. Toque no botão de adicionar foto
4. Tire uma foto ou selecione da galeria
5. Adicione legenda: `Motor antes do serviço`

✅ Foto deve aparecer na galeria da OS
✅ Legenda deve ser visível

### 8.2 Upload pelo curl (teste direto)

```bash
curl -X POST http://localhost:3333/service-orders/{ID_OS}/media \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@C:/caminho/foto.jpg" \
  -F "caption=Teste de upload"
```

✅ Deve retornar 201 com dados da mídia
✅ `GET /service-orders/{ID}/media` deve listar a mídia enviada

### ⚠️ 8.3 Mecânico NÃO pode deletar mídia

```bash
curl -X DELETE http://localhost:3333/service-orders/{ID_OS}/media/{MEDIA_ID} \
  -H "Authorization: Bearer {TOKEN_PEDRO}"
```

✅ Deve retornar 403 — apenas WORKSHOP_OWNER e PLATFORM_ADMIN podem deletar

---

## BLOCO 9 — Troca de Senha

### 9.1 Troca de senha voluntária (Web — Backoffice)

1. Login como `admin@torquehub.com.br`
2. Vá em **Configurações** no menu lateral
3. Preencha o formulário "Alterar Senha":
   - Senha atual: `admin123`
   - Nova senha: `novaAdmin456`
   - Confirmar: `novaAdmin456`
4. Salve

✅ Mensagem de sucesso
✅ Faça logout e login com a nova senha → deve funcionar
✅ Login com a senha antiga → deve falhar

> **Lembrete:** Após o teste, troque de volta para `admin123` se quiser manter o seed funcional.

### 9.2 Troca de senha voluntária (Web — Admin)

1. Login como `hugo@torquehub.com.br`
2. Vá em **Configurações**
3. Altere a senha

✅ Mesmo comportamento do 9.1

### 9.3 Troca de senha voluntária (Mobile)

1. Login no app mobile
2. Vá na tab **Config**
3. Toque em **Alterar Senha**
4. Preencha os campos e confirme

✅ Dialog de sucesso
✅ Nova senha funciona no próximo login

---

## BLOCO 10 — Relatórios (Web Backoffice)

### 10.1 Acessar página de relatórios

1. Login web como WORKSHOP_OWNER
2. Clique em **Relatórios** no menu lateral

✅ Deve carregar a página com estatísticas
✅ Deve mostrar total de OS, valor total, valor médio
✅ Tabela de resumo por status com badges coloridos

### 10.2 MECHANIC NÃO vê Relatórios no menu

1. Login web como MECHANIC

✅ Menu lateral NÃO mostra "Relatórios"

2. Tente acessar diretamente: `http://localhost:5173/backoffice/reports`

✅ A página pode carregar (a rota existe), mas os dados devem ser filtrados pelo workshopId do token

---

## BLOCO 11 — Segurança JWT e Tokens

### ⚠️ 11.1 Requisição sem token

```bash
curl http://localhost:3333/customers
```

✅ Deve retornar 401 — Unauthorized

### ⚠️ 11.2 Token inválido/expirado

```bash
curl http://localhost:3333/customers \
  -H "Authorization: Bearer token_completamente_falso_12345"
```

✅ Deve retornar 401 — Unauthorized

### ⚠️ 11.3 Token de uma oficina acessando recurso de outra

```bash
# Token da Oficina A tentando acessar endpoint com dados da Oficina B
# O middleware de tenant context injeta workshopId do JWT
# Mesmo que tente passar workshopId diferente no body, o middleware ignora
```

✅ Dados retornados SEMPRE correspondem ao workshopId do JWT
❌ NUNCA retorna dados de outro tenant

---

## BLOCO 12 — Painel Admin (PLATFORM_ADMIN)

### 12.1 Dashboard com métricas

1. Login web como `hugo@torquehub.com.br`
2. Dashboard deve mostrar cards com:

✅ Total de oficinas cadastradas
✅ Total de usuários
✅ Total de ordens de serviço
✅ Total de clientes

### 12.2 Listar oficinas

1. Vá em **Oficinas**

✅ Deve listar todas as oficinas do sistema
✅ Deve mostrar nome, documento, quantidade de usuários

### 12.3 Ver detalhes de uma oficina

1. Clique em uma oficina da lista

✅ Deve mostrar dados da oficina
✅ Deve mostrar a equipe (usuários) vinculada
✅ Botão para adicionar usuário deve funcionar

### 12.4 Editar oficina

1. Nos detalhes da oficina, edite o telefone
2. Salve

✅ Dado deve ser atualizado
✅ Ao voltar para a lista, dado atualizado deve aparecer

---

## BLOCO 13 — Testes de Borda

### 13.1 Criar cliente com dados duplicados

1. Logado como WORKSHOP_OWNER
2. Tente criar um cliente com o mesmo CPF de um existente

✅ Deve dar erro de conflito (409) ou validação
❌ NÃO deve criar duplicata

### 13.2 Deletar cliente que tem veículos vinculados

1. Tente deletar um cliente que possui veículos cadastrados

✅ Deve dar erro ou avisar sobre dependências
❌ NÃO deve criar registros órfãos

### 13.3 Criar OS sem itens

```bash
curl -X POST http://localhost:3333/service-orders \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"...","vehicleId":"...","description":"Sem itens","items":[]}'
```

✅ Deve retornar erro de validação — items mínimo 1

### 13.4 Cancelar uma OS completada

```bash
curl -X PATCH http://localhost:3333/service-orders/{ID_OS_COMPLETED}/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"CANCELLED"}'
```

✅ Verificar se a transição é permitida ou bloqueada (depende das regras de negócio)

---

## Checklist de Execução

Use esta tabela para marcar os testes conforme os executa:

| #    | Cenário                                 | Resultado | Observação |
| ---- | --------------------------------------- | --------- | ---------- |
| 1.1  | Login PLATFORM_ADMIN (Web)              | ⬜        |            |
| 1.2  | Login WORKSHOP_OWNER (Web)              | ⬜        |            |
| 1.3  | Acesso rota errada (Web)                | ⬜        |            |
| 1.4  | Login PLATFORM_ADMIN (Mobile)           | ⬜        |            |
| 1.5  | Login WORKSHOP_OWNER (Mobile)           | ⬜        |            |
| 2.1  | Criar oficina (Admin Web)               | ⬜        |            |
| 2.2  | Criar dono da oficina                   | ⬜        |            |
| 2.3  | Primeiro login — troca senha (Web)      | ⬜        |            |
| 2.4  | Primeiro login — troca senha (Mobile)   | ⬜        |            |
| 3.1  | Owner cria mecânico                     | ⬜        |            |
| 3.2  | ⚠️ Owner NÃO cria OWNER                 | ⬜        |            |
| 3.3  | ⚠️ Owner NÃO acessa outra oficina       | ⬜        |            |
| 4.1  | Login MECHANIC (Web)                    | ⬜        |            |
| 4.2  | ⚠️ Mecânico NÃO cria cliente            | ⬜        |            |
| 4.3  | ⚠️ Mecânico NÃO deleta OS               | ⬜        |            |
| 4.4  | Mecânico vê lista de OS                 | ⬜        |            |
| 4.5  | Mecânico faz upload de mídia            | ⬜        |            |
| 4.6  | Login MECHANIC (Mobile)                 | ⬜        |            |
| 5.1  | Preparar dados em 2 oficinas            | ⬜        |            |
| 5.2  | ⚠️ Oficina A NÃO vê dados da B          | ⬜        |            |
| 5.3  | ⚠️ Oficina B NÃO vê dados da A          | ⬜        |            |
| 5.4  | ⚠️ Veículos isolados                    | ⬜        |            |
| 5.5  | ⚠️ OS isoladas                          | ⬜        |            |
| 5.6  | PLATFORM_ADMIN vê tudo                  | ⬜        |            |
| 6.1  | Criar OS completa                       | ⬜        |            |
| 6.2  | Transições de status                    | ⬜        |            |
| 6.3  | Edição só em DRAFT                      | ⬜        |            |
| 7.1  | Gerar link público                      | ⬜        |            |
| 7.2  | Acessar orçamento sem login             | ⬜        |            |
| 7.3  | API pública do orçamento                | ⬜        |            |
| 8.1  | Upload mobile (mecânico)                | ⬜        |            |
| 8.2  | Upload via curl                         | ⬜        |            |
| 8.3  | ⚠️ Mecânico NÃO deleta mídia            | ⬜        |            |
| 9.1  | Troca senha voluntária (Web backoffice) | ⬜        |            |
| 9.2  | Troca senha voluntária (Web admin)      | ⬜        |            |
| 9.3  | Troca senha voluntária (Mobile)         | ⬜        |            |
| 10.1 | Página de relatórios (Owner)            | ⬜        |            |
| 10.2 | Mecânico NÃO vê relatórios              | ⬜        |            |
| 11.1 | ⚠️ Requisição sem token → 401           | ⬜        |            |
| 11.2 | ⚠️ Token inválido → 401                 | ⬜        |            |
| 11.3 | ⚠️ Token cross-tenant → isolado         | ⬜        |            |
| 12.1 | Dashboard admin métricas                | ⬜        |            |
| 12.2 | Listar oficinas                         | ⬜        |            |
| 12.3 | Detalhes da oficina                     | ⬜        |            |
| 12.4 | Editar oficina                          | ⬜        |            |
| 13.1 | Cliente CPF duplicado                   | ⬜        |            |
| 13.2 | Deletar cliente com veículos            | ⬜        |            |
| 13.3 | OS sem itens                            | ⬜        |            |
| 13.4 | Cancelar OS completada                  | ⬜        |            |

---

## Dica: Como Obter o Token JWT

Para testes via curl/Swagger, primeiro faça login e copie o token:

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hugo@torquehub.com.br","password":"admin123"}'
```

A resposta terá:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "role": "PLATFORM_ADMIN", ... }
  }
}
```

Use o valor de `token` em: `Authorization: Bearer {TOKEN}`
