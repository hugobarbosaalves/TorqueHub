/// TorqueHub API service — centralizes all HTTP calls to the backend.
///
/// Uses the singleton pattern via static methods.
/// Base URL is configured via [AppConfig.apiBaseUrl].
/// Multi-tenancy: workshopId is injected by the backend via JWT,
/// so tenant-scoped calls do NOT send workshopId in the body.
library;

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'app_config.dart';
import 'auth_service.dart';

/// Serviço centralizado para chamadas à API do TorqueHub.
class ApiService {
  /// URL base da API — configurada em [AppConfig].
  static String get baseUrl => AppConfig.apiBaseUrl;

  /// Retorna headers com Authorization se autenticado.
  static Map<String, String> _headers({bool json = false}) {
    final h = <String, String>{};
    if (json) h['Content-Type'] = 'application/json';
    final token = AuthService.token;
    if (token != null) h['Authorization'] = 'Bearer $token';
    return h;
  }

  /// Executa uma requisição GET e retorna o campo `data` da resposta.
  static Future<dynamic> _get(String path) async {
    final res = await http.get(Uri.parse('$baseUrl$path'), headers: _headers());
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<dynamic> _post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers(json: true),
      body: jsonEncode(body),
    );
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<dynamic> _patch(String path, Map<String, dynamic> body) async {
    final res = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: _headers(json: true),
      body: jsonEncode(body),
    );
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<dynamic> _put(String path, Map<String, dynamic> body) async {
    final res = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: _headers(json: true),
      body: jsonEncode(body),
    );
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<void> _delete(String path) async {
    final res = await http.delete(
      Uri.parse('$baseUrl$path'),
      headers: _headers(),
    );
    if (res.statusCode >= 400) {
      final json = jsonDecode(res.body);
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
  }

  // ── Health ──────────────────────────────────────────────

  /// Verifica a saúde da API.
  static Future<Map<String, dynamic>> health() async {
    final res = await http.get(Uri.parse('$baseUrl/health'));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ── Lookup (PLATFORM_ADMIN) ─────────────────────────────

  /// Lista todas as oficinas. Requer role PLATFORM_ADMIN.
  static Future<List<Map<String, dynamic>>> getWorkshops() async {
    final data = await _get('/workshops');
    return List<Map<String, dynamic>>.from(data);
  }

  // ── Service Orders (tenant-scoped via JWT) ──────────────

  /// Lista ordens de serviço da oficina do usuário logado.
  static Future<List<Map<String, dynamic>>> listServiceOrders() async {
    final data = await _get('/service-orders');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Busca uma ordem de serviço por ID.
  static Future<Map<String, dynamic>> getServiceOrder(String id) async {
    final data = await _get('/service-orders/$id');
    return Map<String, dynamic>.from(data);
  }

  /// Cria uma ordem de serviço. workshopId é injetado pelo backend via JWT.
  static Future<Map<String, dynamic>> createServiceOrder({
    required String customerId,
    required String vehicleId,
    required String description,
    required List<Map<String, dynamic>> items,
  }) async {
    final data = await _post('/service-orders', {
      'customerId': customerId,
      'vehicleId': vehicleId,
      'description': description,
      'items': items,
    });
    return Map<String, dynamic>.from(data);
  }

  /// Atualiza o status de uma ordem de serviço.
  static Future<void> updateOrderStatus(String id, String status) async {
    await _patch('/service-orders/$id/status', {'status': status});
  }

  /// Exclui uma ordem de serviço.
  static Future<void> deleteServiceOrder(String id) async {
    await _delete('/service-orders/$id');
  }

  /// Atualiza uma ordem DRAFT (descrição, observações, itens).
  static Future<Map<String, dynamic>> updateServiceOrder(
    String id,
    Map<String, dynamic> fields,
  ) async {
    final data = await _put('/service-orders/$id', fields);
    return Map<String, dynamic>.from(data);
  }

  // ── Customers (tenant-scoped via JWT) ───────────────────

  /// Lista os clientes da oficina do usuário logado.
  static Future<List<Map<String, dynamic>>> listCustomers() async {
    final data = await _get('/customers');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Busca um cliente por ID.
  static Future<Map<String, dynamic>> getCustomer(String id) async {
    final data = await _get('/customers/$id');
    return Map<String, dynamic>.from(data);
  }

  /// Cria um cliente. workshopId é injetado pelo backend via JWT.
  static Future<Map<String, dynamic>> createCustomer({
    required String name,
    String? document,
    String? phone,
    String? email,
  }) async {
    final body = <String, dynamic>{'name': name};
    if (document != null && document.isNotEmpty) body['document'] = document;
    if (phone != null && phone.isNotEmpty) body['phone'] = phone;
    if (email != null && email.isNotEmpty) body['email'] = email;
    final data = await _post('/customers', body);
    return Map<String, dynamic>.from(data);
  }

  /// Atualiza um cliente existente.
  static Future<Map<String, dynamic>> updateCustomer(
    String id,
    Map<String, dynamic> fields,
  ) async {
    final data = await _put('/customers/$id', fields);
    return Map<String, dynamic>.from(data);
  }

  /// Exclui um cliente por ID.
  static Future<void> deleteCustomer(String id) async {
    await _delete('/customers/$id');
  }

  // ── Vehicles (tenant-scoped via JWT) ────────────────────

  /// Lista os veículos da oficina, opcionalmente filtrando por cliente.
  static Future<List<Map<String, dynamic>>> listVehicles({
    String? customerId,
  }) async {
    final qs = customerId != null ? '?customerId=$customerId' : '';
    final data = await _get('/vehicles$qs');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Busca um veículo por ID.
  static Future<Map<String, dynamic>> getVehicle(String id) async {
    final data = await _get('/vehicles/$id');
    return Map<String, dynamic>.from(data);
  }

  /// Cria um veículo. workshopId é injetado pelo backend via JWT.
  static Future<Map<String, dynamic>> createVehicle({
    required String customerId,
    required String plate,
    required String brand,
    required String model,
    int? year,
    String? color,
    int? mileage,
  }) async {
    final body = <String, dynamic>{
      'customerId': customerId,
      'plate': plate,
      'brand': brand,
      'model': model,
    };
    if (year != null) body['year'] = year;
    if (color != null && color.isNotEmpty) body['color'] = color;
    if (mileage != null) body['mileage'] = mileage;
    final data = await _post('/vehicles', body);
    return Map<String, dynamic>.from(data);
  }

  /// Atualiza um veículo existente.
  static Future<Map<String, dynamic>> updateVehicle(
    String id,
    Map<String, dynamic> fields,
  ) async {
    final data = await _put('/vehicles/$id', fields);
    return Map<String, dynamic>.from(data);
  }

  /// Exclui um veículo por ID.
  static Future<void> deleteVehicle(String id) async {
    await _delete('/vehicles/$id');
  }

  // ── Media (tenant-scoped via JWT) ───────────────────────

  /// Upload de mídia (foto/vídeo) para uma ordem de serviço.
  static Future<Map<String, dynamic>> uploadMedia(
    String serviceOrderId,
    File file, {
    String? caption,
  }) async {
    final uri = Uri.parse('$baseUrl/service-orders/$serviceOrderId/media');
    final request = http.MultipartRequest('POST', uri)
      ..headers.addAll(_headers())
      ..files.add(await http.MultipartFile.fromPath('file', file.path));
    if (caption != null && caption.isNotEmpty) {
      request.fields['caption'] = caption;
    }
    final streamed = await request.send();
    final body = await streamed.stream.bytesToString();
    final json = jsonDecode(body);
    if (streamed.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro no upload');
    }
    return Map<String, dynamic>.from(json['data']);
  }

  /// Lista mídias de uma ordem de serviço.
  static Future<List<Map<String, dynamic>>> getMedia(
    String serviceOrderId,
  ) async {
    final data = await _get('/service-orders/$serviceOrderId/media');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Exclui uma mídia de uma ordem de serviço.
  static Future<void> deleteMedia(String serviceOrderId, String mediaId) async {
    await _delete('/service-orders/$serviceOrderId/media/$mediaId');
  }

  // ── Team Management (tenant-scoped via JWT) ─────────────

  /// Lista os mecânicos/membros da equipe da oficina.
  static Future<List<Map<String, dynamic>>> listTeam() async {
    final workshopId = AuthService.workshopId;
    if (workshopId == null) throw ApiException('Oficina não identificada');
    final data = await _get('/admin/workshops/$workshopId/users');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Cria um novo membro da equipe (mecânico) na oficina.
  static Future<Map<String, dynamic>> createTeamMember({
    required String name,
    required String email,
    required String password,
    String role = 'MECHANIC',
  }) async {
    final workshopId = AuthService.workshopId;
    if (workshopId == null) throw ApiException('Oficina não identificada');
    final data = await _post('/admin/workshops/$workshopId/users', {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    });
    return Map<String, dynamic>.from(data);
  }

  // ─── Auth ──────────────────────────────────────────

  /// Altera a senha do usuário autenticado.
  ///
  /// Envia a senha atual e a nova senha para o endpoint `PATCH /auth/change-password`.
  static Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _patch('/auth/change-password', {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }
}

/// Exceção lançada quando uma chamada à API retorna erro.
class ApiException implements Exception {
  /// Mensagem de erro retornada pela API.
  final String message;

  /// Cria uma [ApiException] com a mensagem dada.
  ApiException(this.message);

  @override
  String toString() => message;
}
