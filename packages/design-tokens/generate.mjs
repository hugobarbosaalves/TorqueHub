/**
 * generate.mjs — Reads tokens.json and generates:
 *   1. apps/web/src/styles/tokens.css  (CSS custom properties)
 *   2. apps/mobile/lib/theme/app_tokens.dart  (Dart constants)
 *
 * Usage: node packages/design-tokens/generate.mjs
 *        pnpm --filter @torquehub/design-tokens generate
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const tokens = JSON.parse(readFileSync(resolve(HERE, 'tokens.json'), 'utf-8'));

/* ── helpers ──────────────────────────────────────────────── */

/** Convert hex (#RRGGBB) to 0xAARRGGBB int for Dart. */
function hexToDartInt(hex) {
  return '0xFF' + hex.replace('#', '').toUpperCase();
}

/** camelCase to SCREAMING_SNAKE for Dart constants. */
function toScreamingSnake(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

/* ── CSS generation ───────────────────────────────────────── */

function generateCss() {
  const lines = [
    '/* AUTO-GENERATED — do not edit manually. */',
    '/* Source: packages/design-tokens/tokens.json */',
    '/* Run: pnpm --filter @torquehub/design-tokens generate */',
    '',
    ':root {',
  ];

  const addGroup = (prefix, obj) => {
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        lines.push(`  --${prefix}-${key}: ${val};`);
      }
    }
  };

  lines.push('  /* Brand */');
  addGroup('color-brand', tokens.color.brand);
  lines.push('');
  lines.push('  /* Semantic */');
  addGroup('color', tokens.color.semantic);
  lines.push('');
  lines.push('  /* Neutral */');
  addGroup('color-neutral', tokens.color.neutral);
  lines.push('');
  lines.push('  /* Surface */');
  addGroup('color', tokens.color.surface);
  lines.push(`  --color-whatsapp: ${tokens.color.whatsapp};`);
  lines.push('');
  lines.push('  /* Status */');
  addGroup('color-status', tokens.color.status);
  lines.push('');
  lines.push('  /* Typography */');
  lines.push(`  --font-sans: ${tokens.typography.fontFamily.sans};`);
  for (const [k, v] of Object.entries(tokens.typography.fontSize)) {
    lines.push(`  --font-size-${k}: ${v}px;`);
  }
  for (const [k, v] of Object.entries(tokens.typography.fontWeight)) {
    lines.push(`  --font-weight-${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(tokens.typography.lineHeight)) {
    lines.push(`  --line-height-${k}: ${v};`);
  }
  lines.push('');
  lines.push('  /* Spacing */');
  for (const [k, v] of Object.entries(tokens.spacing)) {
    lines.push(`  --space-${k}: ${v}px;`);
  }
  lines.push('');
  lines.push('  /* Radius */');
  for (const [k, v] of Object.entries(tokens.radius)) {
    lines.push(`  --radius-${k}: ${v}px;`);
  }
  lines.push('');
  lines.push('  /* Shadow */');
  for (const [k, v] of Object.entries(tokens.shadow)) {
    lines.push(`  --shadow-${k}: ${v};`);
  }

  lines.push('}');
  return lines.join('\n') + '\n';
}

/* ── Dart generation ──────────────────────────────────────── */

function generateDart() {
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: packages/design-tokens/tokens.json',
    '// Run: pnpm --filter @torquehub/design-tokens generate',
    '',
    "import 'package:flutter/material.dart';",
    '',
    '/// Design tokens — single source of truth for TorqueHub.',
    '/// @see packages/design-tokens/tokens.json',
    'abstract final class TqTokens {',
    '  // ── Brand Colors ──',
  ];

  const addColor = (name, hex) => {
    lines.push(`  static const Color ${name} = Color(${hexToDartInt(hex)});`);
  };

  addColor('primary', tokens.color.brand.primary);
  addColor('primaryLight', tokens.color.brand.primaryLight);
  addColor('accent', tokens.color.brand.accent);

  lines.push('');
  lines.push('  // ── Semantic Colors ──');
  for (const [k, v] of Object.entries(tokens.color.semantic)) {
    addColor(k, v);
  }

  lines.push('');
  lines.push('  // ── Neutral Colors ──');
  for (const [k, v] of Object.entries(tokens.color.neutral)) {
    addColor(`neutral${k}`, v);
  }

  lines.push('');
  lines.push('  // ── Surface Colors ──');
  for (const [k, v] of Object.entries(tokens.color.surface)) {
    addColor(k, v);
  }
  addColor('whatsapp', tokens.color.whatsapp);

  lines.push('');
  lines.push('  // ── Status Colors ──');
  lines.push('  static const Map<String, Color> statusColors = {');
  for (const [k, v] of Object.entries(tokens.color.status)) {
    lines.push(`    '${k}': Color(${hexToDartInt(v)}),`);
  }
  lines.push('  };');

  lines.push('');
  lines.push('  // ── Font Sizes ──');
  for (const [k, v] of Object.entries(tokens.typography.fontSize)) {
    const dartKey = /^\d/.test(k) ? k : k[0].toUpperCase() + k.slice(1);
    lines.push(`  static const double fontSize${dartKey} = ${v};`);
  }

  lines.push('');
  lines.push('  // ── Font Weights ──');
  for (const [k, v] of Object.entries(tokens.typography.fontWeight)) {
    lines.push(`  static const FontWeight fontWeight${k[0].toUpperCase()}${k.slice(1)} = FontWeight.w${v};`);
  }

  lines.push('');
  lines.push('  // ── Spacing ──');
  for (const [k, v] of Object.entries(tokens.spacing)) {
    lines.push(`  static const double space${k} = ${Number(v).toFixed(1)};`);
  }

  lines.push('');
  lines.push('  // ── Border Radius ──');
  for (const [k, v] of Object.entries(tokens.radius)) {
    lines.push(`  static const double radius${k[0].toUpperCase()}${k.slice(1)} = ${Number(v).toFixed(1)};`);
  }

  lines.push('}');
  return lines.join('\n') + '\n';
}

/* ── Write outputs ────────────────────────────────────────── */

const cssPath = resolve(ROOT, 'apps/web/src/styles/tokens.css');
const dartPath = resolve(ROOT, 'apps/mobile/lib/theme/app_tokens.dart');

mkdirSync(dirname(cssPath), { recursive: true });
mkdirSync(dirname(dartPath), { recursive: true });

writeFileSync(cssPath, generateCss(), 'utf-8');
writeFileSync(dartPath, generateDart(), 'utf-8');

console.log(`✅ CSS  → ${cssPath}`);
console.log(`✅ Dart → ${dartPath}`);
