/// Serviço de autenticação — gerencia token JWT e estado de login.
///
/// Persiste o token via SharedPreferences.
/// Oferece métodos para login, logout e verificação do estado.
library;

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'api_service.dart';
import 'app_config.dart';

/// Gerencia autenticação e persistência do token JWT.
class AuthService {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'auth_user';

  static String? _token;
  static Map<String, dynamic>? _user;

  /// Token JWT atual (null se não logado).
  static String? get token => _token;

  /// Dados do usuário logado (null se não logado).
  static Map<String, dynamic>? get user => _user;

  /// Verifica se existe um token salvo.
  static bool get isAuthenticated => _token != null;

  /// Inicializa o serviço, restaurando token salvo (se existir).
  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      _user = jsonDecode(userJson) as Map<String, dynamic>;
    }
  }

  /// Realiza login com email e senha. Retorna dados do usuário.
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final res = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode >= 400) {
      throw ApiException(
        (json['meta'] as Map<String, dynamic>?)?['error'] as String? ??
            'Erro no login',
      );
    }

    final data = json['data'] as Map<String, dynamic>;
    final jwtToken = data['token'] as String;
    final userData = data['user'] as Map<String, dynamic>;

    await _persist(jwtToken, userData);
    return userData;
  }

  /// Encerra a sessão e limpa os dados persistidos.
  static Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  /// Salva token e user no SharedPreferences e na memória.
  static Future<void> _persist(
    String jwtToken,
    Map<String, dynamic> userData,
  ) async {
    _token = jwtToken;
    _user = userData;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, jwtToken);
    await prefs.setString(_userKey, jsonEncode(userData));
  }
}
