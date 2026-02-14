import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'customer_form_screen.dart';

/// Lista de clientes da oficina. O mecânico pode ver, criar, editar e excluir.
class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  List<Map<String, dynamic>> _workshops = [];
  String? _selectedWorkshopId;
  List<Map<String, dynamic>> _customers = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadWorkshops();
  }

  Future<void> _loadWorkshops() async {
    try {
      final ws = await ApiService.getWorkshops();
      if (!mounted) return;
      setState(() {
        _workshops = ws;
        if (ws.isNotEmpty) {
          _selectedWorkshopId = ws.first['id'] as String;
        }
      });
      if (_selectedWorkshopId != null) {
        _loadCustomers();
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadCustomers() async {
    if (_selectedWorkshopId == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.getCustomersByWorkshop(_selectedWorkshopId!);
      if (!mounted) return;
      setState(() {
        _customers = data;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _deleteCustomer(String id, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Cliente'),
        content: Text('Excluir "$name"? Isso pode falhar se houver ordens vinculadas.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Não')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteCustomer(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cliente excluído'), backgroundColor: Colors.green),
      );
      _loadCustomers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _openForm({Map<String, dynamic>? customer}) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => CustomerFormScreen(
          workshopId: _selectedWorkshopId!,
          customer: customer,
        ),
      ),
    );
    if (result == true) _loadCustomers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clientes'), centerTitle: true),
      floatingActionButton: _selectedWorkshopId == null
          ? null
          : FloatingActionButton(
              onPressed: () => _openForm(),
              child: const Icon(Icons.person_add),
            ),
      body: Column(
        children: [
          // Workshop selector
          if (_workshops.length > 1)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: DropdownButtonFormField<String>(
                initialValue: _selectedWorkshopId,
                decoration: const InputDecoration(
                  labelText: 'Oficina',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: _workshops.map((w) => DropdownMenuItem(
                  value: w['id'] as String,
                  child: Text(w['name'] as String),
                )).toList(),
                onChanged: (val) {
                  setState(() => _selectedWorkshopId = val);
                  _loadCustomers();
                },
              ),
            ),

          // Content
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_error!, style: const TextStyle(color: Colors.red)),
                            const SizedBox(height: 8),
                            FilledButton(onPressed: _loadCustomers, child: const Text('Retry')),
                          ],
                        ),
                      )
                    : _customers.isEmpty
                        ? const Center(child: Text('Nenhum cliente cadastrado'))
                        : RefreshIndicator(
                            onRefresh: _loadCustomers,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _customers.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (_, i) => _buildCard(_customers[i]),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> c) {
    final name = c['name'] as String;
    final doc = c['document'] as String? ?? '';
    final phone = c['phone'] as String? ?? '';
    final email = c['email'] as String? ?? '';

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue.shade100,
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : '?',
            style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          [doc, phone, email].where((s) => s.isNotEmpty).join(' • '),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (action) {
            if (action == 'edit') _openForm(customer: c);
            if (action == 'delete') _deleteCustomer(c['id'] as String, name);
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'edit', child: Text('Editar')),
            const PopupMenuItem(value: 'delete', child: Text('Excluir', style: TextStyle(color: Colors.red))),
          ],
        ),
        onTap: () => _openForm(customer: c),
      ),
    );
  }
}
