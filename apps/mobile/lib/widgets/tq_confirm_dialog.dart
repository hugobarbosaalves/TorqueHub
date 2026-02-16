/// Reusable confirmation dialog — consistent pattern across screens.
///
/// Eliminates 5+ duplicated `showDialog<bool>` → `AlertDialog` blocks.
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Shows a confirmation dialog and returns `true` if confirmed.
///
/// ```dart
/// final ok = await showConfirmDialog(
///   context,
///   title: 'Excluir Cliente',
///   content: 'Excluir "João"?',
///   confirmText: 'Sim',
/// );
/// ```
Future<bool> showConfirmDialog(
  BuildContext context, {
  required String title,
  required String content,
  String cancelText = 'Não',
  String confirmText = 'Sim',
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: Text(content),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: Text(cancelText),
        ),
        TextButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(
            confirmText,
            style: const TextStyle(color: TqTokens.danger),
          ),
        ),
      ],
    ),
  );
  return result ?? false;
}
