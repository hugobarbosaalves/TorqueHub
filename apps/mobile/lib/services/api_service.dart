import 'dart:convert';
import 'package:http/http.dart' as http;

/// Serviço centralizado para chamadas à API do TorqueHub.
class ApiService {
  // Emulador Android: 10.0.2.2 = localhost da máquina host
  // Device físico: trocar para o IP local (ex: 192.168.1.x)
  static const String baseUrl = 'http://10.0.2.2:3333';

  // ── Helpers ───────────────────────────────────────────────────────────────

  static Future<dynamic> _get(String path) async {
    final res = await http.get(Uri.parse('$baseUrl$path'));
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<dynamic> _post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
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
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    final json = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
    return json['data'];
  }

  static Future<void> _delete(String path) async {
    final res = await http.delete(Uri.parse('$baseUrl$path'));
    if (res.statusCode >= 400) {
      final json = jsonDecode(res.body);
      throw ApiException(json['meta']?['error'] ?? 'Erro ${res.statusCode}');
    }
  }

  // ── Health ────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> health() async {
    final res = await http.get(Uri.parse('$baseUrl/health'));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ── Workshops ─────────────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getWorkshops() async {
    final data = await _get('/workshops');
    return List<Map<String, dynamic>>.from(data);
  }

  // ── Customers ─────────────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getCustomers(
    String workshopId,
  ) async {
    final data = await _get('/workshops/$workshopId/customers');
    return List<Map<String, dynamic>>.from(data);
  }

  // ── Vehicles ──────────────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getVehicles(
    String workshopId, {
    String? customerId,
  }) async {
    final qs = customerId != null ? '?customerId=$customerId' : '';
    final data = await _get('/workshops/$workshopId/vehicles$qs');
    return List<Map<String, dynamic>>.from(data);
  }

  // ── Service Orders ────────────────────────────────────────────────────────

  static Future<List<Map<String, dynamic>>> getServiceOrders({
    String? workshopId,
  }) async {
    final qs = workshopId != null ? '?workshopId=$workshopId' : '';
    final data = await _get('/service-orders$qs');
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<Map<String, dynamic>> getServiceOrder(String id) async {
    final data = await _get('/service-orders/$id');
    return Map<String, dynamic>.from(data);
  }

  static Future<Map<String, dynamic>> createServiceOrder({
    required String workshopId,
    required String customerId,
    required String vehicleId,
    required String description,
    required List<Map<String, dynamic>> items,
  }) async {
    final data = await _post('/service-orders', {
      'workshopId': workshopId,
      'customerId': customerId,
      'vehicleId': vehicleId,
      'description': description,
      'items': items,
    });
    return Map<String, dynamic>.from(data);
  }

  static Future<void> updateOrderStatus(String id, String status) async {
    await _patch('/service-orders/$id/status', {'status': status});
  }

  static Future<void> deleteServiceOrder(String id) async {
    await _delete('/service-orders/$id');
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
