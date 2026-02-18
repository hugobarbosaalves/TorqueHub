/// Shared formatting utilities — currency and date helpers.
///
/// Centralizes format logic used across multiple screens,
/// avoiding duplication of `_formatCurrency` and `_formatDate`.
library;

/// Formats an amount in centavos to BRL currency string.
///
/// Accepts `int` or parsable `String`. Returns `R$ 0,00` on failure.
/// Includes thousand separators for readability.
/// ```dart
/// formatCurrency(15000);    // 'R$ 150,00'
/// formatCurrency(5299900);  // 'R$ 52.999,00'
/// ```
String formatCurrency(dynamic cents) {
  final raw = cents is int ? cents : int.tryParse(cents.toString()) ?? 0;
  final reais = raw ~/ 100;
  final centavos = (raw % 100).abs();
  final reaisStr = _addThousandSeparators(reais.toString());
  final centavosStr = centavos.toString().padLeft(2, '0');
  return 'R\$ $reaisStr,$centavosStr';
}

/// Insere pontos como separadores de milhar.
String _addThousandSeparators(String number) {
  final reversed = number.split('').reversed.toList();
  final buffer = StringBuffer();
  for (var index = 0; index < reversed.length; index++) {
    if (index > 0 && index % 3 == 0) buffer.write('.');
    buffer.write(reversed[index]);
  }
  return buffer.toString().split('').reversed.join();
}

/// Formats an ISO 8601 date string to `dd/MM/yyyy HH:mm`.
///
/// Returns empty string for null input, original string on parse failure.
/// ```dart
/// formatDate('2026-02-15T10:30:00Z'); // '15/02/2026 10:30'
/// ```
String formatDate(String? iso) {
  if (iso == null) return '';
  final dt = DateTime.tryParse(iso);
  if (dt == null) return iso;
  final local = dt.toLocal();
  return '${local.day.toString().padLeft(2, '0')}/'
      '${local.month.toString().padLeft(2, '0')}/'
      '${local.year} '
      '${local.hour.toString().padLeft(2, '0')}:'
      '${local.minute.toString().padLeft(2, '0')}';
}
