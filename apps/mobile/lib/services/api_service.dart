/// TorqueHub API service — centralizes all HTTP calls to the backend.
///
/// Uses the singleton pattern via static methods.
/// Base URL points to localhost via Android emulator bridge (10.0.2.2).
/// For physical devices, change [baseUrl] to your machine's local IP.
library;

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Serviço centralizado para chamadas à API do TorqueHub.
class ApiService {
  // Emulador Android: 10.0.2.2 = localhost da máquina host
  // Device físico: trocar para o IP local (ex: 192.168.1.x)
  static const String baseUrl = 'http://10.0.2.2:3333';

  /// Executa uma requisição GET e retorna o campo `data` da resposta.
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

  static Future<dynamic> _put(String path, Map<String, dynamic> body) async {
    final res = await http.put(
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

  /// Verifica a saúde da API.
  static Future<Map<String, dynamic>> health() async {
    final res = await http.get(Uri.parse('$baseUrl/health'));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  /// Lista todas as oficinas cadastradas.
  static Future<List<Map<String, dynamic>>> getWorkshops() async {
    final data = await _get('/workshops');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Lista os clientes de uma oficina.
  static Future<List<Map<String, dynamic>>> getCustomers(
    String workshopId,
  ) async {
    final data = await _get('/workshops/$workshopId/customers');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Lista os veículos de uma oficina, opcionalmente filtrando por cliente.
  static Future<List<Map<String, dynamic>>> getVehicles(
    String workshopId, {
    String? customerId,
  }) async {
    final qs = customerId != null ? '?customerId=$customerId' : '';
    final data = await _get('/workshops/$workshopId/vehicles$qs');
    return List<Map<String, dynamic>>.from(data);
  }

  /// Lista ordens de serviço, opcionalmente filtrando por oficina.
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

  /// CRUD completo de clientes.
  static Future<List<Map<String, dynamic>>> getCustomersByWorkshop(
    String workshopId,
  ) async {
    final data = await _get('/customers?workshopId=$workshopId');
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<Map<String, dynamic>> getCustomer(String id) async {
    final data = await _get('/customers/$id');
    return Map<String, dynamic>.from(data);
  }

  static Future<Map<String, dynamic>> createCustomer({
    required String workshopId,
    required String name,
    String? document,
    String? phone,
    String? email,
  }) async {
    final body = <String, dynamic>{'workshopId': workshopId, 'name': name};
    if (document != null && document.isNotEmpty) body['document'] = document;
    if (phone != null && phone.isNotEmpty) body['phone'] = phone;
    if (email != null && email.isNotEmpty) body['email'] = email;
    final data = await _post('/customers', body);
    return Map<String, dynamic>.from(data);
  }

  static Future<Map<String, dynamic>> updateCustomer(
    String id,
    Map<String, dynamic> fields,
  ) async {
    final data = await _put('/customers/$id', fields);
    return Map<String, dynamic>.from(data);
  }

  static Future<void> deleteCustomer(String id) async {
    await _delete('/customers/$id');
  }

  /// CRUD completo de veículos.
  static Future<List<Map<String, dynamic>>> getVehiclesByWorkshop(
    String workshopId,
  ) async {
    final data = await _get('/vehicles?workshopId=$workshopId');
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<List<Map<String, dynamic>>> getVehiclesByCustomer(
    String customerId,
  ) async {
    final data = await _get('/vehicles?customerId=$customerId');
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<Map<String, dynamic>> getVehicle(String id) async {
    final data = await _get('/vehicles/$id');
    return Map<String, dynamic>.from(data);
  }

  static Future<Map<String, dynamic>> createVehicle({
    required String workshopId,
    required String customerId,
    required String plate,
    required String brand,
    required String model,
    int? year,
    String? color,
    int? mileage,
  }) async {
    final body = <String, dynamic>{
      'workshopId': workshopId,
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

  static Future<Map<String, dynamic>> updateVehicle(
    String id,
    Map<String, dynamic> fields,
  ) async {
    final data = await _put('/vehicles/$id', fields);
    return Map<String, dynamic>.from(data);
  }

  static Future<void> deleteVehicle(String id) async {
    await _delete('/vehicles/$id');
  }

  /// Upload de mídia (foto/vídeo) para uma ordem de serviço.
  static Future<Map<String, dynamic>> uploadMedia(
    String serviceOrderId,
    File file, {
    String? caption,
  }) async {
    final uri = Uri.parse('$baseUrl/service-orders/$serviceOrderId/media');
    final request = http.MultipartRequest('POST', uri)
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
  static Future<void> deleteMedia(
    String serviceOrderId,
    String mediaId,
  ) async {
    await _delete('/service-orders/$serviceOrderId/media/$mediaId');
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
