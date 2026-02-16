/// Reusable section title widget — consistent heading style.
///
/// Replaces 3+ inline TextStyle definitions for section headings.
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// A styled section title used in forms and detail screens.
///
/// ```dart
/// TqSectionTitle('Itens / Serviços')
/// ```
class TqSectionTitle extends StatelessWidget {
  /// The heading text to display.
  final String text;

  const TqSectionTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: TqTokens.space4),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: TqTokens.fontSizeLg,
          fontWeight: TqTokens.fontWeightSemibold,
        ),
      ),
    );
  }
}
