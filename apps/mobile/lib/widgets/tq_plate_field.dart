/// Widget de campo de placa brasileira com máscara.
///
/// Aplica máscara ABC-1D23 (Mercosul) ou ABC-1234 (antiga).
/// Apenas formatação — sem consulta por placa.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'plate_mask_formatter.dart';
import 'tq_text_field.dart';

/// Campo de placa brasileira com máscara automática.
class TqPlateField extends StatelessWidget {
  /// Controller para o campo de placa.
  final TextEditingController controller;

  /// Se o campo está habilitado para edição.
  final bool enabled;

  /// Validador do campo.
  final String? Function(String?)? validator;

  /// Cria campo de placa brasileira com máscara.
  const TqPlateField({
    super.key,
    required this.controller,
    this.enabled = true,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TqTextField(
      controller: controller,
      label: 'Placa *',
      hint: 'ABC-1D23',
      prefixIcon: Icons.pin,
      textCapitalization: TextCapitalization.characters,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9\-]')),
        BrazilianPlateMaskFormatter(),
      ],
      maxLength: 8,
      enabled: enabled,
      validator:
          validator ??
          (value) => value == null || value.trim().isEmpty
              ? 'Placa obrigatória'
              : null,
    );
  }
}
