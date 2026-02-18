/// Formatter que aplica máscara de quilometragem com separador de milhar.
///
/// Ex: 150000 → 150.000
/// Aceita apenas dígitos, máx 7 dígitos (9.999.999 km).
library;

import 'package:flutter/services.dart';

/// Máximo de dígitos permitidos (9.999.999 km).
const _maxMileageDigits = 7;

/// Aplica máscara de separador de milhar para quilometragem.
class MileageMaskFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return newValue.copyWith(text: '');

    final trimmed = digits.length > _maxMileageDigits
        ? digits.substring(0, _maxMileageDigits)
        : digits;

    final formatted = _formatThousands(trimmed);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  /// Insere pontos como separadores de milhar.
  String _formatThousands(String digits) {
    final reversed = digits.split('').reversed.toList();
    final buffer = StringBuffer();
    for (var index = 0; index < reversed.length; index++) {
      if (index > 0 && index % 3 == 0) buffer.write('.');
      buffer.write(reversed[index]);
    }
    return buffer.toString().split('').reversed.join();
  }
}
