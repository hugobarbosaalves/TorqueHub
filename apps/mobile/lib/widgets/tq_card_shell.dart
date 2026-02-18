/// Premium card container with optional accent bar.
///
/// Wraps content in a Material card with consistent design:
/// rounded corners, subtle border, optional colored accent bar,
/// and [InkWell] tap support.
///
/// ```dart
/// TqCardShell(
///   accentColor: TqTokens.accent,
///   onTap: () => navigateToDetail(),
///   child: Column(children: [ ... ]),
/// )
/// ```
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Card premium reutilizável com barra de acento colorida.
class TqCardShell extends StatelessWidget {
  /// Cor da barra decorativa no topo do card.
  /// Se `null`, nenhuma barra é exibida.
  final Color? accentColor;

  /// Callback ao tocar no card.
  final VoidCallback? onTap;

  /// Conteúdo interno do card.
  final Widget child;

  /// Espaçamento interno do conteúdo.
  /// Padrão: `EdgeInsets.fromLTRB(space8, space6, space8, space8)`.
  final EdgeInsetsGeometry? padding;

  const TqCardShell({
    super.key,
    this.accentColor,
    this.onTap,
    this.padding,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final contentPadding = padding ??
        const EdgeInsets.fromLTRB(
          TqTokens.space8,
          TqTokens.space6,
          TqTokens.space8,
          TqTokens.space8,
        );

    return Material(
      color: TqTokens.card,
      borderRadius: BorderRadius.circular(TqTokens.radiusXl),
      child: InkWell(
        borderRadius: BorderRadius.circular(TqTokens.radiusXl),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(TqTokens.radiusXl),
            border: Border.all(color: TqTokens.neutral200, width: 0.8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (accentColor != null)
                Container(
                  height: 3,
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  decoration: BoxDecoration(
                    color: accentColor,
                    borderRadius: const BorderRadius.vertical(
                      bottom: Radius.circular(3),
                    ),
                  ),
                ),
              Padding(padding: contentPadding, child: child),
            ],
          ),
        ),
      ),
    );
  }
}
