/// Reusable error state widget — consistent empty/error UIs.
///
/// Replaces 4+ inconsistent error/empty patterns across screens.
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Full-screen error state with icon, message, and retry button.
///
/// ```dart
/// TqErrorState(
///   message: 'Erro ao carregar ordens',
///   detail: e.toString(),
///   onRetry: _loadOrders,
/// )
/// ```
class TqErrorState extends StatelessWidget {
  /// Main error heading.
  final String message;

  /// Optional detail text (e.g., exception message).
  final String? detail;

  /// Retry callback — shows a "Tentar novamente" button.
  final VoidCallback? onRetry;

  const TqErrorState({
    super.key,
    this.message = 'Ocorreu um erro',
    this.detail,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(TqTokens.space12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: TqTokens.danger),
            const SizedBox(height: TqTokens.space8),
            Text(
              message,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            if (detail != null) ...[
              const SizedBox(height: TqTokens.space4),
              Text(
                detail!,
                style: const TextStyle(color: TqTokens.neutral400),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: TqTokens.space12),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Tentar novamente'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Full-screen empty state with icon, title, and optional subtitle.
///
/// ```dart
/// TqEmptyState(
///   icon: Icons.inbox_outlined,
///   title: 'Nenhuma ordem de serviço',
///   subtitle: 'Toque em + para criar a primeira.',
/// )
/// ```
class TqEmptyState extends StatelessWidget {
  /// Large icon displayed at the top.
  final IconData icon;

  /// Primary text.
  final String title;

  /// Optional descriptive text below the title.
  final String? subtitle;

  const TqEmptyState({
    super.key,
    this.icon = Icons.inbox_outlined,
    required this.title,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(TqTokens.space12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 80, color: TqTokens.neutral300),
            const SizedBox(height: TqTokens.space8),
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: TqTokens.neutral600),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: TqTokens.space4),
              Text(
                subtitle!,
                style: const TextStyle(color: TqTokens.neutral500),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
