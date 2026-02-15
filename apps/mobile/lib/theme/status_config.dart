/// Status display configuration — labels, icons, and colors.
///
/// Eliminates duplication of _statusConfig across screens.
/// Single source of truth for order status rendering.
/// @see packages/design-tokens/tokens.json
library;

import 'package:flutter/material.dart';
import 'app_tokens.dart';

/// Display information for an order status.
class StatusInfo {
  /// Human-readable label displayed in the UI.
  final String label;

  /// Material icon for the status.
  final IconData icon;

  /// Color used for badges, banners, and indicators.
  final Color color;

  /// Creates a status display configuration.
  const StatusInfo({
    required this.label,
    required this.icon,
    required this.color,
  });
}

/// Map of order status codes to their display configuration.
final Map<String, StatusInfo> statusConfig = {
  'DRAFT': StatusInfo(
    label: 'Rascunho',
    icon: Icons.edit_note,
    color: TqTokens.statusColors['DRAFT'] ?? TqTokens.neutral400,
  ),
  'PENDING_APPROVAL': StatusInfo(
    label: 'Aguardando Aprovação',
    icon: Icons.hourglass_empty,
    color: TqTokens.statusColors['PENDING_APPROVAL'] ?? TqTokens.warning,
  ),
  'APPROVED': StatusInfo(
    label: 'Aprovada',
    icon: Icons.thumb_up,
    color: TqTokens.statusColors['APPROVED'] ?? TqTokens.accent,
  ),
  'IN_PROGRESS': StatusInfo(
    label: 'Em Andamento',
    icon: Icons.build,
    color: TqTokens.statusColors['IN_PROGRESS'] ?? TqTokens.info,
  ),
  'COMPLETED': StatusInfo(
    label: 'Concluído',
    icon: Icons.check_circle,
    color: TqTokens.statusColors['COMPLETED'] ?? TqTokens.success,
  ),
  'CANCELLED': StatusInfo(
    label: 'Cancelada',
    icon: Icons.cancel,
    color: TqTokens.statusColors['CANCELLED'] ?? TqTokens.danger,
  ),
};

/// Returns [StatusInfo] for a given status code with safe fallback.
StatusInfo getStatusInfo(String status) {
  return statusConfig[status] ??
      StatusInfo(
        label: status,
        icon: Icons.help_outline,
        color: TqTokens.neutral400,
      );
}
