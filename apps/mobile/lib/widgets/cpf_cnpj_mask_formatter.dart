/// Formatter que aplica máscara de CPF ou CNPJ automaticamente.
///
/// - CPF:  ###.###.###-## (11 dígitos)
/// - CNPJ: ##.###.###/####-## (14 dígitos)
///
/// Detecta automaticamente o tipo com base no total de dígitos.
library;

import 'package:flutter/services.dart';

/// Quantidade máxima de dígitos para CPF.
const _cpfDigits = 11;

/// Quantidade máxima de dígitos para CNPJ.
const _cnpjDigits = 14;

/// Formata um valor bruto de CPF/CNPJ (ex: "12345678900" → "123.456.789-00").
///
/// Útil para formatar dados vindos do banco ao abrir formulário de edição.
String formatCpfCnpjRaw(String? raw) {
  if (raw == null || raw.trim().isEmpty) return '';
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.isEmpty) return raw;
  if (digits.length <= _cpfDigits) return _formatCpf(digits);
  return _formatCnpj(digits.length > _cnpjDigits ? digits.substring(0, _cnpjDigits) : digits);
}

/// Aplica máscara de CPF ou CNPJ no campo de texto.
class CpfCnpjMaskFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return newValue.copyWith(text: '');

    final trimmed =
        digits.length > _cnpjDigits ? digits.substring(0, _cnpjDigits) : digits;

    final formatted =
        trimmed.length <= _cpfDigits ? _formatCpf(trimmed) : _formatCnpj(trimmed);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Formata como CPF: ###.###.###-##
String _formatCpf(String digits) {
  final buffer = StringBuffer();
  for (var index = 0; index < digits.length; index++) {
    if (index == 3 || index == 6) buffer.write('.');
    if (index == 9) buffer.write('-');
    buffer.write(digits[index]);
  }
  return buffer.toString();
}

/// Formata como CNPJ: ##.###.###/####-##
String _formatCnpj(String digits) {
  final buffer = StringBuffer();
  for (var index = 0; index < digits.length; index++) {
    if (index == 2 || index == 5) buffer.write('.');
    if (index == 8) buffer.write('/');
    if (index == 12) buffer.write('-');
    buffer.write(digits[index]);
  }
  return buffer.toString();
}

/// Valida CPF ou CNPJ formatado.
///
/// Retorna mensagem de erro ou `null` se válido.
String? validateCpfCnpj(String? value) {
  if (value == null || value.trim().isEmpty) return null;
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.length < _cpfDigits) return 'CPF incompleto (11 dígitos)';
  if (digits.length > _cpfDigits && digits.length < _cnpjDigits) {
    return 'CNPJ incompleto (14 dígitos)';
  }
  if (digits.length == _cpfDigits && !_isValidCpf(digits)) {
    return 'CPF inválido';
  }
  if (digits.length == _cnpjDigits && !_isValidCnpj(digits)) {
    return 'CNPJ inválido';
  }
  return null;
}

/// Valida dígitos verificadores do CPF.
bool _isValidCpf(String digits) {
  if (RegExp(r'^(\d)\1{10}$').hasMatch(digits)) return false;

  int _calcDigit(List<int> nums, int factor) {
    var sum = 0;
    for (final digit in nums) {
      sum += digit * factor;
      factor--;
    }
    final rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  final nums = digits.split('').map(int.parse).toList();
  final d1 = _calcDigit(nums.sublist(0, 9), 10);
  if (nums[9] != d1) return false;
  final d2 = _calcDigit(nums.sublist(0, 10), 11);
  return nums[10] == d2;
}

/// Valida dígitos verificadores do CNPJ.
bool _isValidCnpj(String digits) {
  if (RegExp(r'^(\d)\1{13}$').hasMatch(digits)) return false;

  int _calcDigit(List<int> nums, List<int> weights) {
    var sum = 0;
    for (var index = 0; index < nums.length; index++) {
      sum += nums[index] * weights[index];
    }
    final rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  final nums = digits.split('').map(int.parse).toList();
  final w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  final w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  final d1 = _calcDigit(nums.sublist(0, 12), w1);
  if (nums[12] != d1) return false;
  final d2 = _calcDigit(nums.sublist(0, 13), w2);
  return nums[13] == d2;
}
