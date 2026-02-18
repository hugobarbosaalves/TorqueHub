/// Small pill badge for status, tags, or labels.
///
/// Renders a tinted pill with optional leading icon, using the
/// provided [color] for both background tint and text/icon.
///
/// ```dart
/// TqBadgePill(label: 'Aprovado', color: TqTokens.success)
/// TqBadgePill(label: 'Rascunho', color: TqTokens.neutral400, icon: Icons.edit)
/// ```
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Pill badge reutilizável com cor e ícone opcional.
class TqBadgePill extends StatelessWidget {
  /// Texto do badge.
  final String label;

  /// Cor principal (usada para fundo tintado, texto e ícone).
  final Color color;

  /// Ícone opcional exibido antes do label.
  final IconData? icon;

  /// Tamanho da fonte. Padrão: [TqTokens.fontSizeXs].
  final double? fontSize;

  const TqBadgePill({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: TqTokens.space5,
        vertical: TqTokens.space1,
      ),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(TqTokens.radiusPill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, color: color, size: 13),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: fontSize ?? TqTokens.fontSizeXs,
              fontWeight: TqTokens.fontWeightSemibold,
            ),
          ),
        ],
      ),
    );
  }
}
