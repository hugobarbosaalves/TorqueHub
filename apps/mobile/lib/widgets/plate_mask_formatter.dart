/// Formatter que aplica máscara de placa brasileira.
///
/// Aceita tanto o padrão antigo (ABC-1234) quanto Mercosul (ABC1D23).
/// Insere o traço automaticamente na posição correta.
library;

import 'package:flutter/services.dart';

/// Aplica máscara de placa brasileira no campo de texto.
class BrazilianPlateMaskFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final raw = newValue.text.toUpperCase().replaceAll(
      RegExp(r'[^A-Z0-9]'),
      '',
    );
    if (raw.isEmpty) return newValue.copyWith(text: '');
    if (raw.length > 7) {
      final trimmed = raw.substring(0, 7);
      return _format(trimmed);
    }
    return _format(raw);
  }

  TextEditingValue _format(String raw) {
    final buffer = StringBuffer();
    for (var index = 0; index < raw.length; index++) {
      if (index == 3) buffer.write('-');
      buffer.write(raw[index]);
    }
    final text = buffer.toString();
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
