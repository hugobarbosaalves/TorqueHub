/// Modelo de dados retornado pelo lookup de placa de veículo.
library;

/// Dados retornados pelo lookup de placa.
class PlateLookupData {
  /// Marca do veículo.
  final String brand;

  /// Modelo do veículo.
  final String model;

  /// Ano do veículo (pode ser nulo).
  final int? year;

  /// Cor do veículo (pode ser nula).
  final String? color;

  /// Cria instância com dados do lookup.
  const PlateLookupData({
    required this.brand,
    required this.model,
    this.year,
    this.color,
  });
}

/// Callback disparado quando o lookup retorna dados.
typedef OnPlateLookup = void Function(PlateLookupData data);

/// Callback assíncrono que executa a busca por placa.
typedef PlateLookupFn = Future<PlateLookupData?> Function(String plate);
