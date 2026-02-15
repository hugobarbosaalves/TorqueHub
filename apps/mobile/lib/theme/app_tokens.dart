// AUTO-GENERATED — do not edit manually.
// Source: packages/design-tokens/tokens.json
// Run: pnpm --filter @torquehub/design-tokens generate

import 'package:flutter/material.dart';

/// Design tokens — single source of truth for TorqueHub.
/// @see packages/design-tokens/tokens.json
abstract final class TqTokens {
  // ── Brand Colors ──
  static const Color primary = Color(0xFF1A1A2E);
  static const Color primaryLight = Color(0xFF16213E);
  static const Color accent = Color(0xFF3B82F6);

  // ── Semantic Colors ──
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ── Neutral Colors ──
  static const Color neutral50 = Color(0xFFF8FAFC);
  static const Color neutral100 = Color(0xFFF1F5F9);
  static const Color neutral200 = Color(0xFFE2E8F0);
  static const Color neutral300 = Color(0xFFCBD5E1);
  static const Color neutral400 = Color(0xFF94A3B8);
  static const Color neutral500 = Color(0xFF64748B);
  static const Color neutral600 = Color(0xFF475569);
  static const Color neutral700 = Color(0xFF334155);
  static const Color neutral800 = Color(0xFF1E293B);
  static const Color neutral900 = Color(0xFF0F172A);

  // ── Surface Colors ──
  static const Color background = Color(0xFFF8FAFC);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE2E8F0);
  static const Color whatsapp = Color(0xFF25D366);

  // ── Status Colors ──
  static const Map<String, Color> statusColors = {
    'DRAFT': Color(0xFF94A3B8),
    'PENDING_APPROVAL': Color(0xFFF59E0B),
    'APPROVED': Color(0xFF3B82F6),
    'IN_PROGRESS': Color(0xFF8B5CF6),
    'COMPLETED': Color(0xFF22C55E),
    'CANCELLED': Color(0xFFEF4444),
  };

  // ── Font Sizes ──
  static const double fontSizeXs = 12;
  static const double fontSizeSm = 13;
  static const double fontSizeBase = 14;
  static const double fontSizeMd = 15;
  static const double fontSizeLg = 16;
  static const double fontSizeXl = 18;
  static const double fontSize2xl = 20;
  static const double fontSize3xl = 22;
  static const double fontSize4xl = 24;
  static const double fontSize5xl = 32;

  // ── Font Weights ──
  static const FontWeight fontWeightNormal = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightExtrabold = FontWeight.w800;

  // ── Spacing ──
  static const double space0 = 0.0;
  static const double space1 = 2.0;
  static const double space2 = 4.0;
  static const double space3 = 6.0;
  static const double space4 = 8.0;
  static const double space5 = 10.0;
  static const double space6 = 12.0;
  static const double space8 = 16.0;
  static const double space10 = 20.0;
  static const double space12 = 24.0;
  static const double space14 = 28.0;
  static const double space16 = 32.0;
  static const double space20 = 40.0;
  static const double space24 = 48.0;

  // ── Border Radius ──
  static const double radiusSm = 6.0;
  static const double radiusMd = 8.0;
  static const double radiusLg = 10.0;
  static const double radiusXl = 12.0;
  static const double radiusPill = 20.0;
  static const double radiusFull = 9999.0;
}
