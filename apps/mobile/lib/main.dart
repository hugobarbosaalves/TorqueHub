import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const TorqueHubApp());
}

class TorqueHubApp extends StatelessWidget {
  const TorqueHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TorqueHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1A1A2E),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // IMPORTANTE: No emulador Android, 10.0.2.2 aponta para o localhost da sua máquina.
  // Em device físico, use o IP da sua máquina na rede local.
  static const String apiBaseUrl = 'http://10.0.2.2:3333';

  String _status = 'Nenhuma requisição feita';
  bool _loading = false;

  /// Testa GET /health
  Future<void> _testHealth() async {
    setState(() {
      _loading = true;
      _status = 'Testando conexão...';
    });

    try {
      final response = await http.get(
        Uri.parse('$apiBaseUrl/health'),
      );

      // Coloque um BREAKPOINT aqui para inspecionar a response
      final body = jsonDecode(response.body);

      setState(() {
        _status = '✅ Health OK\n'
            'Status: ${response.statusCode}\n'
            'Body: ${const JsonEncoder.withIndent('  ').convert(body)}';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Erro: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  /// Testa POST /service-orders
  Future<void> _testCreateOrder() async {
    setState(() {
      _loading = true;
      _status = 'Criando ordem de serviço...';
    });

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/service-orders'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'workshopId': 'workshop-001',
          'customerId': 'customer-001',
          'vehicleId': 'vehicle-001',
          'description': 'Troca de óleo e filtros',
          'items': [
            {'description': 'Óleo 5W30', 'quantity': 4, 'unitPrice': 3500},
            {'description': 'Filtro de óleo', 'quantity': 1, 'unitPrice': 4500},
          ],
        }),
      );

      // Coloque um BREAKPOINT aqui para inspecionar a response
      final body = jsonDecode(response.body);

      setState(() {
        _status = '✅ Ordem criada!\n'
            'Status: ${response.statusCode}\n'
            'Body: ${const JsonEncoder.withIndent('  ').convert(body)}';
      });
    } catch (e) {
      setState(() {
        _status = '❌ Erro: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TorqueHub'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.build_circle_outlined,
                size: 80, color: Color(0xFF1A1A2E)),
            const SizedBox(height: 16),
            const Text(
              'TorqueHub Mobile',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            const Text(
              'Gestão de Manutenção Automotiva',
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 16),
            const Text('Testar Backend',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: _loading ? null : _testHealth,
              icon: const Icon(Icons.favorite_border),
              label: const Text('GET /health'),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: _loading ? null : _testCreateOrder,
              icon: const Icon(Icons.add_circle_outline),
              label: const Text('POST /service-orders'),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: SelectableText(
                _status,
                style: const TextStyle(
                    fontFamily: 'monospace', fontSize: 13, height: 1.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
