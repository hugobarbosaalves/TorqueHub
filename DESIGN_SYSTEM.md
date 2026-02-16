# TorqueHub — Design System

> **Fonte única de verdade** para estilos visuais do TorqueHub.
> Leia este arquivo ANTES de criar ou modificar qualquer componente UI.
> Leia também `PROJECT_CONVENTIONS.md` para regras de código e
> `.github/copilot-instructions.md` para o mapa de decisão completo.

---

## 1. Visão Geral

O Design System do TorqueHub garante consistência visual entre:

| Plataforma | Stack          | Arquivo de Tokens                       |
| ---------- | -------------- | --------------------------------------- |
| Web        | React + CSS    | `apps/web/src/styles/tokens.css`        |
| Mobile     | Flutter / Dart | `apps/mobile/lib/theme/app_tokens.dart` |
| Ambos      | JSON canônico  | `packages/design-tokens/tokens.json`    |

### Fluxo de Atualização

```
tokens.json  ──→  generate.mjs  ──→  tokens.css (Web)
                                 ──→  app_tokens.dart (Mobile)
```

**Comando**: `pnpm --filter @torquehub/design-tokens generate`

> Altere APENAS `tokens.json` e regenere. Nunca edite os arquivos gerados.

---

## 2. Paleta de Cores

### 2.1 Brand

| Token        | Hex       | Uso                             | CSS                          | Dart                    |
| ------------ | --------- | ------------------------------- | ---------------------------- | ----------------------- |
| primary      | `#1A1A2E` | Header, botão principal, totais | `--color-brand-primary`      | `TqTokens.primary`      |
| primaryLight | `#16213E` | Gradiente do header             | `--color-brand-primaryLight` | `TqTokens.primaryLight` |
| accent       | `#3B82F6` | Links, destaques, focus states  | `--color-brand-accent`       | `TqTokens.accent`       |

### 2.2 Semantic

| Token   | Hex       | Uso                      | CSS               | Dart               |
| ------- | --------- | ------------------------ | ----------------- | ------------------ |
| success | `#22C55E` | Confirmação, SnackBar OK | `--color-success` | `TqTokens.success` |
| warning | `#F59E0B` | Alertas, pendentes       | `--color-warning` | `TqTokens.warning` |
| danger  | `#EF4444` | Erros, cancelamento      | `--color-danger`  | `TqTokens.danger`  |
| info    | `#3B82F6` | Informativos             | `--color-info`    | `TqTokens.info`    |

### 2.3 Neutral (Escala de cinza)

| Step | Hex       | Uso                       | CSS                   | Dart                  |
| ---- | --------- | ------------------------- | --------------------- | --------------------- |
| 50   | `#F8FAFC` | Background, rows          | `--color-neutral-50`  | `TqTokens.neutral50`  |
| 200  | `#E2E8F0` | Bordas, separadores       | `--color-neutral-200` | `TqTokens.neutral200` |
| 400  | `#94A3B8` | Texto muted, ícones leves | `--color-neutral-400` | `TqTokens.neutral400` |
| 500  | `#64748B` | Texto secundário          | `--color-neutral-500` | `TqTokens.neutral500` |
| 800  | `#1E293B` | Texto principal           | `--color-neutral-800` | `TqTokens.neutral800` |

### 2.4 Surface

| Token      | Hex       | CSS                  | Dart                  |
| ---------- | --------- | -------------------- | --------------------- |
| background | `#F8FAFC` | `--color-background` | `TqTokens.background` |
| card       | `#FFFFFF` | `--color-card`       | `TqTokens.card`       |
| border     | `#E2E8F0` | `--color-border`     | `TqTokens.border`     |

### 2.5 Status (Ordem de Serviço)

| Status           | Cor       | Label                |
| ---------------- | --------- | -------------------- |
| DRAFT            | `#94A3B8` | Rascunho             |
| PENDING_APPROVAL | `#F59E0B` | Aguardando Aprovação |
| APPROVED         | `#3B82F6` | Aprovada             |
| IN_PROGRESS      | `#8B5CF6` | Em Andamento         |
| COMPLETED        | `#22C55E` | Concluído            |
| CANCELLED        | `#EF4444` | Cancelada            |

**Web**: `import { statusConfig } from '@torquehub/design-tokens'`
**Dart**: `import '../theme/status_config.dart'; getStatusInfo(status)`

---

## 3. Tipografia

### 3.1 Font Family

- **Web**: `var(--font-sans)` → `'Segoe UI', system-ui, -apple-system, sans-serif`
- **Mobile**: Usa a fonte padrão do sistema (Roboto/SF Pro)

### 3.2 Font Sizes

| Token | px  | Uso                         | CSS                | Dart                    |
| ----- | --- | --------------------------- | ------------------ | ----------------------- |
| xs    | 12  | Badges, datas, rodapé       | `--font-size-xs`   | `TqTokens.fontSizeXs`   |
| sm    | 13  | Subtítulos, hints           | `--font-size-sm`   | `TqTokens.fontSizeSm`   |
| base  | 14  | Texto base, itens de tabela | `--font-size-base` | `TqTokens.fontSizeBase` |
| md    | 15  | Botões menores              | `--font-size-md`   | `TqTokens.fontSizeMd`   |
| lg    | 16  | Títulos de card, botões     | `--font-size-lg`   | `TqTokens.fontSizeLg`   |
| xl    | 18  | Títulos de seção            | `--font-size-xl`   | `TqTokens.fontSizeXl`   |
| 2xl   | 20  | Headings                    | `--font-size-2xl`  | `TqTokens.fontSize2xl`  |
| 3xl   | 22  | Valor total destacado       | `--font-size-3xl`  | `TqTokens.fontSize3xl`  |
| 4xl   | 24  | Header principal            | `--font-size-4xl`  | `TqTokens.fontSize4xl`  |
| 5xl   | 32  | Ícones grandes (emoji)      | `--font-size-5xl`  | `TqTokens.fontSize5xl`  |

### 3.3 Font Weights

| Token     | Valor | Uso                     | CSS                       | Dart                           |
| --------- | ----- | ----------------------- | ------------------------- | ------------------------------ |
| normal    | 400   | Texto corrido           | `--font-weight-normal`    | `TqTokens.fontWeightNormal`    |
| medium    | 500   | Itens de lista          | `--font-weight-medium`    | `TqTokens.fontWeightMedium`    |
| semibold  | 600   | Títulos de card, botões | `--font-weight-semibold`  | `TqTokens.fontWeightSemibold`  |
| bold      | 700   | Headings, totais        | `--font-weight-bold`      | `TqTokens.fontWeightBold`      |
| extrabold | 800   | Valor total grand-total | `--font-weight-extrabold` | `TqTokens.fontWeightExtrabold` |

---

## 4. Spacing

Escala baseada em múltiplos de 2px.

| Token | px  | Uso comum                    | CSS          | Dart               |
| ----- | --- | ---------------------------- | ------------ | ------------------ |
| 1     | 2   | Micro-espaçamento            | `--space-1`  | `TqTokens.space1`  |
| 2     | 4   | Gap entre ícone e texto      | `--space-2`  | `TqTokens.space2`  |
| 4     | 8   | Espaço entre itens de grid   | `--space-4`  | `TqTokens.space4`  |
| 6     | 12  | Padding interno de badge     | `--space-6`  | `TqTokens.space6`  |
| 8     | 16  | **Espaçamento padrão**       | `--space-8`  | `TqTokens.space8`  |
| 12    | 24  | Padding de card, separadores | `--space-12` | `TqTokens.space12` |
| 16    | 32  | Espaço antes de botões       | `--space-16` | `TqTokens.space16` |
| 24    | 48  | Espaço generoso (formulário) | `--space-24` | `TqTokens.space24` |

---

## 5. Border Radius

| Token | px   | Uso                | CSS             | Dart                  |
| ----- | ---- | ------------------ | --------------- | --------------------- |
| sm    | 6    | Badges, tags       | `--radius-sm`   | `TqTokens.radiusSm`   |
| md    | 8    | Inputs, thumbnails | `--radius-md`   | `TqTokens.radiusMd`   |
| lg    | 10   | Total row, itens   | `--radius-lg`   | `TqTokens.radiusLg`   |
| xl    | 12   | Cards, banners     | `--radius-xl`   | `TqTokens.radiusXl`   |
| pill  | 20   | Status badge pill  | `--radius-pill` | `TqTokens.radiusPill` |
| full  | 9999 | Círculos           | `--radius-full` | `TqTokens.radiusFull` |

---

## 6. Sombras

| Token | CSS           | Dart (usar manualmente)                                                              |
| ----- | ------------- | ------------------------------------------------------------------------------------ |
| sm    | `--shadow-sm` | `BoxShadow(blurRadius: 3, color: Colors.black.withAlpha(25))`                        |
| md    | `--shadow-md` | `BoxShadow(blurRadius: 12, offset: Offset(0, 4), color: Colors.black.withAlpha(25))` |
| lg    | `--shadow-lg` | `BoxShadow(blurRadius: 32, offset: Offset(0, 8), color: Colors.black.withAlpha(38))` |

---

## 7. Componentes Web (React)

### 7.1 Componentes Disponíveis

| Componente       | Arquivo                         | Descrição                 |
| ---------------- | ------------------------------- | ------------------------- |
| `StatusBanner`   | `components/StatusBanner.tsx`   | Banner colorido de status |
| `VehicleInfo`    | `components/VehicleInfo.tsx`    | Card de veículo + placa   |
| `OrderItems`     | `components/OrderItems.tsx`     | Tabela de itens + total   |
| `MediaGallery`   | `components/MediaGallery.tsx`   | Grid de fotos + lightbox  |
| `VehicleHistory` | `components/VehicleHistory.tsx` | Timeline de serviços      |

### 7.2 Classes CSS Globais

| Classe           | Uso                                 |
| ---------------- | ----------------------------------- |
| `.container`     | Max-width 720px centralizado        |
| `.card`          | Container com fundo branco e sombra |
| `.card-body`     | Padding interno do card             |
| `.header`        | Header gradiente escuro             |
| `.footer`        | Rodapé cinza centralizado           |
| `.btn`           | Base de botão com hover/disabled    |
| `.btn-primary`   | Botão principal (fundo primary)     |
| `.section-title` | Título de seção com ícone           |
| `.media-grid`    | Grid responsivo de thumbnails       |
| `.lightbox`      | Overlay de visualização de imagem   |
| `.spinner`       | Indicador de carregamento circular  |

### 7.3 Exemplo de Uso

```tsx
import { statusConfig } from '@torquehub/design-tokens';

function MyComponent({ status }: { readonly status: string }): ReactNode {
  const info = statusConfig[status];
  return (
    <div className="card">
      <div className="card-body">
        <p className="section-title">
          {info?.icon} {info?.label}
        </p>
      </div>
    </div>
  );
}
```

---

## 8. Componentes Mobile (Flutter)

### 8.1 Tema

O `MaterialApp` usa `AppTheme.light` definido em `lib/theme/app_theme.dart`.
Inclui configurações de: `CardTheme`, `ElevatedButtonTheme`, `InputDecorationTheme`,
`NavigationBarTheme`, `SnackBarTheme`, `DividerTheme`.

### 8.2 Status Config

```dart
import '../theme/status_config.dart';

final info = getStatusInfo('IN_PROGRESS');
// info.label → 'Em Andamento'
// info.icon  → Icons.build
// info.color → Color(0xFF8B5CF6)
```

### 8.3 Usando Tokens em Widgets

```dart
import '../theme/app_tokens.dart';

Container(
  padding: const EdgeInsets.all(TqTokens.space8),
  decoration: BoxDecoration(
    color: TqTokens.card,
    borderRadius: BorderRadius.circular(TqTokens.radiusXl),
    border: Border.all(color: TqTokens.border),
  ),
  child: Text(
    'R\$ 150,00',
    style: const TextStyle(
      fontSize: TqTokens.fontSize3xl,
      fontWeight: TqTokens.fontWeightExtrabold,
      color: TqTokens.primary,
    ),
  ),
);
```

### 8.4 SnackBar Padrão

```dart
// Sucesso
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(msg), backgroundColor: TqTokens.success),
);

// Erro
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(msg), backgroundColor: TqTokens.danger),
);
```

---

## 9. Estrutura de Arquivos

```
packages/design-tokens/
├── tokens.json          ← FONTE ÚNICA DE VERDADE
├── generate.mjs         ← Script de geração CSS + Dart
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts         ← Re-exports para consumo TS
    ├── colors.ts        ← Constantes de cores
    ├── typography.ts    ← Font sizes, weights, line heights
    ├── spacing.ts       ← Escala de espaçamento
    ├── surfaces.ts      ← Border radius + shadows
    └── status.ts        ← Config de status (label, icon, color)

apps/web/src/styles/
├── tokens.css           ← GERADO — CSS custom properties
└── global.css           ← Estilos globais que importam tokens.css

apps/mobile/lib/theme/
├── app_tokens.dart      ← GERADO — constantes Dart
├── app_theme.dart       ← ThemeData Material 3
└── status_config.dart   ← Mapa de status com labels e ícones
```

---

## 10. Instruções para Agentes IA

1. **Sempre** leia este arquivo E `PROJECT_CONVENTIONS.md` antes de criar UI
2. **Sempre** use tokens ao invés de valores hardcoded
3. **Web**: Importe `@torquehub/design-tokens` para TS, use `var(--token)` no CSS
4. **Mobile**: Importe `app_tokens.dart` para cores/espaçamento, `status_config.dart` para status
5. **Nunca** edite `tokens.css` ou `app_tokens.dart` diretamente — são gerados
6. **Sempre** rode `pnpm --filter @torquehub/design-tokens generate` após alterar `tokens.json`
7. **Nunca** duplique mapas de cores de status — use `statusConfig` centralizado
8. **Sempre** use `TqTokens.*` para cores, espaçamento, fontes no Flutter
9. **Sempre** use `var(--*)` CSS variables no web para valores do token
10. **Preferir** classes CSS globais (`.card`, `.btn`, etc.) a estilos inline no web

---

END OF DOCUMENT
