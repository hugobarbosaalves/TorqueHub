/// Standard popup menu with Edit/Delete actions.
///
/// Provides consistent action menu for entity cards (customers,
/// vehicles, etc.) with danger-colored delete option.
///
/// ```dart
/// TqPopupActions(
///   onEdit: () => openForm(entity: item),
///   onDelete: () => deleteItem(item),
/// )
/// ```
library;

import 'package:flutter/material.dart';
import '../theme/app_tokens.dart';

/// Menu popup padronizado com ações Editar e Excluir.
class TqPopupActions extends StatelessWidget {
  /// Callback ao selecionar "Editar".
  final VoidCallback onEdit;

  /// Callback ao selecionar "Excluir".
  final VoidCallback onDelete;

  /// Label para ação de editar. Padrão: 'Editar'.
  final String editLabel;

  /// Label para ação de excluir. Padrão: 'Excluir'.
  final String deleteLabel;

  const TqPopupActions({
    super.key,
    required this.onEdit,
    required this.onDelete,
    this.editLabel = 'Editar',
    this.deleteLabel = 'Excluir',
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(
        Icons.more_vert,
        color: TqTokens.neutral400,
        size: 20,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(TqTokens.radiusLg),
      ),
      onSelected: (action) {
        if (action == 'edit') onEdit();
        if (action == 'delete') onDelete();
      },
      itemBuilder: (_) => [
        PopupMenuItem(
          value: 'edit',
          child: Row(
            children: [
              const Icon(
                Icons.edit_outlined,
                size: 18,
                color: TqTokens.neutral600,
              ),
              const SizedBox(width: TqTokens.space4),
              Text(
                editLabel,
                style: const TextStyle(
                  fontSize: TqTokens.fontSizeSm,
                  color: TqTokens.neutral700,
                ),
              ),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              const Icon(
                Icons.delete_outline,
                size: 18,
                color: TqTokens.danger,
              ),
              const SizedBox(width: TqTokens.space4),
              Text(
                deleteLabel,
                style: const TextStyle(
                  fontSize: TqTokens.fontSizeSm,
                  color: TqTokens.danger,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
