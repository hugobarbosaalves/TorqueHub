/// Formatter que aplica máscara de moeda brasileira (BRL).
///
/// Formata em tempo real: `52999` → `R$ 529,99`
/// O valor é sempre interpretado em centavos (últimos 2 dígitos = decimais).
///
/// Para exibição estática, use [formatCurrency] de `formatters.dart`.
/// Para extrair centavos de um campo formatado, use [parseCurrencyToCents].
library;

import 'package:flutter/services.dart';

/// Aplica máscara de moeda BRL no campo de texto.
///
/// Comportamento:
/// - Aceita apenas dígitos
/// - Insere `R$ `, separador de milhar (`.`) e decimal (`,`)
/// - Valor mínimo: `R$ 0,00`
/// - Máximo: 99.999.999,99 (R$ ~100M)
class CurrencyMaskFormatter extends TextInputFormatter {
  /// Máximo de dígitos permitidos (centavos) — 9999999999 = R$ 99.999.999,99.
  static const _maxDigits = 10;

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return newValue.copyWith(text: '');

    final trimmed = digits.length > _maxDigits
        ? digits.substring(0, _maxDigits)
        : digits;

    final cents = int.tryParse(trimmed) ?? 0;
    final formatted = _formatBrl(cents);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  /// Formata centavos como `R$ 1.234,56`.
  static String _formatBrl(int cents) {
    final reais = cents ~/ 100;
    final centavos = cents % 100;

    final reaisStr = _addThousandSeparators(reais.toString());
    final centavosStr = centavos.toString().padLeft(2, '0');

    return 'R\$ $reaisStr,$centavosStr';
  }

  /// Insere pontos como separadores de milhar.
  static String _addThousandSeparators(String number) {
    final reversed = number.split('').reversed.toList();
    final buffer = StringBuffer();
    for (var index = 0; index < reversed.length; index++) {
      if (index > 0 && index % 3 == 0) buffer.write('.');
      buffer.write(reversed[index]);
    }
    return buffer.toString().split('').reversed.join();
  }
}

/// Extrai o valor em centavos de um texto formatado como `R$ 1.234,56`.
///
/// Remove tudo que não é dígito e retorna o int.
/// Retorna `0` se vazio ou inválido.
///
/// ```dart
/// parseCurrencyToCents('R\$ 529,99'); // 52999
/// parseCurrencyToCents('R\$ 1.500,00'); // 150000
/// parseCurrencyToCents(''); // 0
/// ```
int parseCurrencyToCents(String? text) {
  if (text == null || text.trim().isEmpty) return 0;
  final digits = text.replaceAll(RegExp(r'\D'), '');
  return int.tryParse(digits) ?? 0;
}

/// Formata um valor em centavos para exibição em campo de texto com máscara.
///
/// Útil para preencher controllers ao abrir formulários de edição.
///
/// ```dart
/// formatCentsToInput(52999); // 'R\$ 529,99'
/// formatCentsToInput(0); // ''
/// ```
String formatCentsToInput(int? cents) {
  if (cents == null || cents == 0) return '';
  final reais = cents ~/ 100;
  final centavos = cents % 100;
  final reaisStr = CurrencyMaskFormatter._addThousandSeparators(
    reais.toString(),
  );
  final centavosStr = centavos.toString().padLeft(2, '0');
  return 'R\$ $reaisStr,$centavosStr';
}

/// Valida se um campo de valor monetário foi preenchido e é maior que zero.
///
/// Campo opcional se [required] for `false`.
String? validateCurrency(String? value, {bool required = true}) {
  if (value == null || value.trim().isEmpty) {
    return required ? 'Valor obrigatório' : null;
  }
  final cents = parseCurrencyToCents(value);
  if (cents <= 0 && required) return 'Valor deve ser maior que zero';
  return null;
}
