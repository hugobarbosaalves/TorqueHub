/// Compact icon + text row for card detail lines.
///
/// Renders a leading icon with a text label, consistently sized
/// and colored for use inside [TqCardShell] or any list context.
///
/// ```dart
/// TqInfoRow(icon: Icons.person_outline, text: 'João Silva')
/// TqInfoRow(icon: Icons.email_outlined, text: 'joao@email.com')
/// ```
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Linha de informação com ícone para uso em cards.
class TqInfoRow extends StatelessWidget {
  /// Ícone exibido à esquerda.
  final IconData icon;

  /// Texto principal.
  final String text;

  /// Cor do ícone. Padrão: [TqTokens.neutral400].
  final Color? iconColor;

  /// Cor do texto. Padrão: [TqTokens.neutral600].
  final Color? textColor;

  /// Tamanho do ícone. Padrão: 15.
  final double iconSize;

  /// Tamanho da fonte. Padrão: [TqTokens.fontSizeSm].
  final double? fontSize;

  /// Peso da fonte. Padrão: [TqTokens.fontWeightNormal].
  final FontWeight? fontWeight;

  /// Widget opcional renderizado à direita (trailing).
  final Widget? trailing;

  const TqInfoRow({
    super.key,
    required this.icon,
    required this.text,
    this.iconColor,
    this.textColor,
    this.iconSize = 15,
    this.fontSize,
    this.fontWeight,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: iconSize,
          color: iconColor ?? TqTokens.neutral400,
        ),
        const SizedBox(width: TqTokens.space3),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: fontSize ?? TqTokens.fontSizeSm,
              color: textColor ?? TqTokens.neutral600,
              fontWeight: fontWeight ?? TqTokens.fontWeightNormal,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (trailing != null) ...[
          const SizedBox(width: TqTokens.space4),
          trailing!,
        ],
      ],
    );
  }
}
