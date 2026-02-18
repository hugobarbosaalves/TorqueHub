/// Formatter que aplica máscara de telefone brasileiro.
///
/// - Celular: (##) #####-#### (11 dígitos)
/// - Fixo:    (##) ####-#### (10 dígitos)
///
/// Detecta automaticamente o tipo com base no total de dígitos.
library;

import 'package:flutter/services.dart';

/// Quantidade de dígitos de telefone fixo (com DDD).
const _landlineDigits = 10;

/// Quantidade de dígitos de celular (com DDD).
const _mobileDigits = 11;

/// Formata um valor bruto de telefone (ex: "11999998888" → "(11) 99999-8888").
///
/// Útil para formatar dados vindos do banco ao abrir formulário de edição.
String formatPhoneRaw(String? raw) {
  if (raw == null || raw.trim().isEmpty) return '';
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.isEmpty) return raw;
  final trimmed = digits.length > _mobileDigits
      ? digits.substring(0, _mobileDigits)
      : digits;
  final buffer = StringBuffer();
  for (var index = 0; index < trimmed.length; index++) {
    if (index == 0) buffer.write('(');
    if (index == 2) buffer.write(') ');
    if (trimmed.length <= _landlineDigits && index == 6) buffer.write('-');
    if (trimmed.length == _mobileDigits && index == 7) buffer.write('-');
    buffer.write(trimmed[index]);
  }
  return buffer.toString();
}

/// Aplica máscara de telefone brasileiro no campo de texto.
class PhoneMaskFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return newValue.copyWith(text: '');

    final trimmed =
        digits.length > _mobileDigits ? digits.substring(0, _mobileDigits) : digits;

    final formatted = _format(trimmed);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  /// Formata telefone com DDD.
  ///
  /// - Celular (11 dígitos): (##) #####-####
  /// - Fixo (10 dígitos):    (##) ####-####
  /// - Parcial: aplica máscara progressiva.
  String _format(String digits) {
    final buffer = StringBuffer();
    for (var index = 0; index < digits.length; index++) {
      if (index == 0) buffer.write('(');
      if (index == 2) buffer.write(') ');
      // Traço na posição correta depende do total de dígitos
      if (digits.length <= _landlineDigits && index == 6) buffer.write('-');
      if (digits.length == _mobileDigits && index == 7) buffer.write('-');
      buffer.write(digits[index]);
    }
    return buffer.toString();
  }
}

/// Valida número de telefone brasileiro (com DDD).
///
/// Retorna mensagem de erro ou `null` se válido.
/// Campo opcional — aceita vazio.
String? validatePhone(String? value) {
  if (value == null || value.trim().isEmpty) return null;
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.length < _landlineDigits) return 'Telefone incompleto';
  if (digits.length > _mobileDigits) return 'Telefone inválido';

  // DDD válido: 11-99
  final ddd = int.tryParse(digits.substring(0, 2)) ?? 0;
  if (ddd < 11 || ddd > 99) return 'DDD inválido';

  // Celular deve começar com 9 no 3º dígito
  if (digits.length == _mobileDigits && digits[2] != '9') {
    return 'Celular deve iniciar com 9';
  }

  return null;
}
