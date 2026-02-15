/// Configurações do ambiente da aplicação.
///
/// Alterne entre [dev] e [prod] conforme o ambiente de execução.
/// Para gerar APK de teste: use [prod] com a URL do Render.
library;

/// Ambiente ativo da aplicação.
enum Environment { dev, prod }

/// Configurações centralizadas — alterne [_current] para trocar de ambiente.
class AppConfig {
  static const Environment _current = Environment.prod;

  /// URL base da API conforme o ambiente.
  static String get apiBaseUrl {
    switch (_current) {
      case Environment.dev:
        // Android emulator: 10.0.2.2 = localhost da máquina host
        // Device físico na mesma rede: use o IP local (ex: 192.168.1.x:3333)
        return 'http://10.0.2.2:3333';
      case Environment.prod:
        // Render (ou outro hosting) — altere para sua URL real
        return 'https://torquehub-21wh.onrender.com';
    }
  }

  /// Retorna true se estiver em produção.
  static bool get isProduction => _current == Environment.prod;

  /// URL do portal web do cliente (para gerar links compartilháveis).
  static String get webPortalUrl {
    switch (_current) {
      case Environment.dev:
        return 'http://localhost:5173';
      case Environment.prod:
        // Vercel (ou outro hosting) — altere para sua URL real
        return 'https://torque-hub-web.vercel.app';
    }
  }

  /// Monta o link público completo para uma ordem de serviço.
  static String orderLink(String publicToken) {
    return '$webPortalUrl/order/$publicToken';
  }
}
