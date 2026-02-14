/// Vehicle management screen — CRUD operations for workshop vehicles.
///
/// Lists vehicles filtered by workshop, with swipe-to-delete and
/// navigation to [VehicleFormScreen] for create/edit.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'vehicle_form_screen.dart';

/// Lista de veículos da oficina. O mecânico pode ver, criar, editar e excluir.
class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  List<Map<String, dynamic>> _workshops = [];
  String? _selectedWorkshopId;
  List<Map<String, dynamic>> _vehicles = [];
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
        _loadVehicles();
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

  Future<void> _loadVehicles() async {
    if (_selectedWorkshopId == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.getVehiclesByWorkshop(_selectedWorkshopId!);
      if (!mounted) return;
      setState(() {
        _vehicles = data;
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

  Future<void> _deleteVehicle(String id, String label) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Veículo'),
        content: Text(
          'Excluir "$label"? Isso pode falhar se houver ordens vinculadas.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Não'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteVehicle(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veículo excluído'),
          backgroundColor: Colors.green,
        ),
      );
      _loadVehicles();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _openForm({Map<String, dynamic>? vehicle}) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => VehicleFormScreen(
          workshopId: _selectedWorkshopId!,
          vehicle: vehicle,
        ),
      ),
    );
    if (result == true) _loadVehicles();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Veículos'), centerTitle: true),
      floatingActionButton: _selectedWorkshopId == null
          ? null
          : FloatingActionButton(
              onPressed: () => _openForm(),
              child: const Icon(Icons.directions_car),
            ),
      body: Column(
        children: [
          if (_workshops.length > 1)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: DropdownButtonFormField<String>(
                initialValue: _selectedWorkshopId,
                decoration: const InputDecoration(
                  labelText: 'Oficina',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
                items: _workshops
                    .map(
                      (w) => DropdownMenuItem(
                        value: w['id'] as String,
                        child: Text(w['name'] as String),
                      ),
                    )
                    .toList(),
                onChanged: (val) {
                  setState(() => _selectedWorkshopId = val);
                  _loadVehicles();
                },
              ),
            ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _error!,
                          style: const TextStyle(color: Colors.red),
                        ),
                        const SizedBox(height: 8),
                        FilledButton(
                          onPressed: _loadVehicles,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _vehicles.isEmpty
                ? const Center(child: Text('Nenhum veículo cadastrado'))
                : RefreshIndicator(
                    onRefresh: _loadVehicles,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _vehicles.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (_, i) => _buildCard(_vehicles[i]),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> v) {
    final plate = v['plate'] as String;
    final brand = v['brand'] as String;
    final model = v['model'] as String;
    final year = v['year'];
    final color = v['color'] as String? ?? '';
    final mileage = v['mileage'] as int? ?? 0;
    final label = '$brand $model — $plate';

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.orange.shade100,
          child: Icon(Icons.directions_car, color: Colors.orange.shade700),
        ),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          [
            if (year != null) 'Ano: $year',
            if (color.isNotEmpty) color,
            if (mileage > 0) '${mileage}km',
          ].join(' • '),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (action) {
            if (action == 'edit') _openForm(vehicle: v);
            if (action == 'delete') _deleteVehicle(v['id'] as String, label);
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'edit', child: Text('Editar')),
            const PopupMenuItem(
              value: 'delete',
              child: Text('Excluir', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
        onTap: () => _openForm(vehicle: v),
      ),
    );
  }
}
