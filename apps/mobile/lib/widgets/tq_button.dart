/// Reusable button component with consistent visual hierarchy.
///
/// Provides four variants following modern design patterns (Nubank, iFood):
/// - [TqButtonVariant.primary] — main CTA, filled with brand color
/// - [TqButtonVariant.secondary] — secondary action, subtle filled
/// - [TqButtonVariant.ghost] — low-emphasis, transparent background
/// - [TqButtonVariant.danger] — destructive action, red tones
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Visual variants for [TqButton].
enum TqButtonVariant {
  /// High emphasis — filled with brand primary color.
  primary,

  /// Medium emphasis — subtle grey fill, dark text.
  secondary,

  /// Low emphasis — transparent, with subtle text color.
  ghost,

  /// Destructive — red tones for dangerous actions.
  danger,
}

/// Padronizado, reutilizável, com hierarquia visual consistente.
class TqButton extends StatelessWidget {
  /// Texto exibido no botão.
  final String label;

  /// Ícone opcional à esquerda do texto.
  final IconData? icon;

  /// Callback quando pressionado. Null desabilita o botão.
  final VoidCallback? onPressed;

  /// Variante visual.
  final TqButtonVariant variant;

  /// Se true, exibe um [CircularProgressIndicator] e desabilita interação.
  final bool loading;

  /// Se true, ocupa a largura total disponível.
  final bool expand;

  const TqButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.variant = TqButtonVariant.primary,
    this.loading = false,
    this.expand = true,
  });

  /// Atalho para variante primária.
  const TqButton.primary({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
    this.expand = true,
  }) : variant = TqButtonVariant.primary;

  /// Atalho para variante secundária.
  const TqButton.secondary({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
    this.expand = true,
  }) : variant = TqButtonVariant.secondary;

  /// Atalho para variante ghost.
  const TqButton.ghost({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
    this.expand = true,
  }) : variant = TqButtonVariant.ghost;

  /// Atalho para variante danger.
  const TqButton.danger({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
    this.expand = true,
  }) : variant = TqButtonVariant.danger;

  @override
  Widget build(BuildContext context) {
    final style = _resolveStyle();
    final effectiveOnPressed = loading ? null : onPressed;

    Widget child;
    if (loading) {
      child = SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: style.foreground,
        ),
      );
    } else if (icon != null) {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: style.foreground),
          const SizedBox(width: TqTokens.space4),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                color: style.foreground,
                fontSize: TqTokens.fontSizeMd,
                fontWeight: TqTokens.fontWeightSemibold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    } else {
      child = Text(
        label,
        style: TextStyle(
          color: style.foreground,
          fontSize: TqTokens.fontSizeMd,
          fontWeight: TqTokens.fontWeightSemibold,
        ),
      );
    }

    final button = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: effectiveOnPressed,
        borderRadius: BorderRadius.circular(TqTokens.radiusXl),
        child: Ink(
          decoration: BoxDecoration(
            color: effectiveOnPressed == null
                ? style.background.withAlpha(120)
                : style.background,
            borderRadius: BorderRadius.circular(TqTokens.radiusXl),
            border: style.borderColor != null
                ? Border.all(color: style.borderColor!)
                : null,
          ),
          padding: const EdgeInsets.symmetric(
            vertical: TqTokens.space6,
            horizontal: TqTokens.space10,
          ),
          child: Center(child: child),
        ),
      ),
    );

    if (expand) return button;

    return IntrinsicWidth(child: button);
  }

  _ButtonStyle _resolveStyle() {
    switch (variant) {
      case TqButtonVariant.primary:
        return const _ButtonStyle(
          background: TqTokens.primary,
          foreground: Colors.white,
        );
      case TqButtonVariant.secondary:
        return const _ButtonStyle(
          background: Color(0xFFF1F5F9),
          foreground: TqTokens.neutral800,
        );
      case TqButtonVariant.ghost:
        return const _ButtonStyle(
          background: TqTokens.card,
          foreground: TqTokens.neutral600,
          borderColor: TqTokens.neutral200,
        );
      case TqButtonVariant.danger:
        return const _ButtonStyle(
          background: Color(0xFFFEF2F2),
          foreground: TqTokens.danger,
          borderColor: Color(0xFFFECACA),
        );
    }
  }
}

class _ButtonStyle {
  final Color background;
  final Color foreground;
  final Color? borderColor;

  const _ButtonStyle({
    required this.background,
    required this.foreground,
    this.borderColor,
  });
}
