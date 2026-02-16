/// Vehicle management screen — CRUD operations for workshop vehicles.
///
/// Lists vehicles filtered by workshop, with delete confirmation and
/// navigation to [VehicleFormScreen] for create/edit.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_confirm_dialog.dart';
import '../widgets/tq_state_views.dart';
import 'vehicle_form_screen.dart';

/// Lista de veículos da oficina com CRUD.
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
    final confirmed = await showConfirmDialog(
      context,
      title: 'Excluir Veículo',
      content:
          'Excluir "$label"? Isso pode falhar se houver ordens vinculadas.',
    );
    if (!confirmed) return;

    try {
      await ApiService.deleteVehicle(id);
      if (!mounted) return;
      showSuccessSnack(context, 'Veículo excluído');
      _loadVehicles();
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
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
              heroTag: 'fab_vehicles',
              onPressed: () => _openForm(),
              child: const Icon(Icons.directions_car),
            ),
      body: Column(
        children: [
          if (_workshops.length > 1)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                TqTokens.space8,
                TqTokens.space6,
                TqTokens.space8,
                0,
              ),
              child: DropdownButtonFormField<String>(
                initialValue: _selectedWorkshopId,
                decoration: const InputDecoration(
                  labelText: 'Oficina',
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: TqTokens.space6,
                    vertical: TqTokens.space5,
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
                ? TqErrorState(message: _error!, onRetry: _loadVehicles)
                : _vehicles.isEmpty
                ? const TqEmptyState(
                    icon: Icons.directions_car_outlined,
                    title: 'Nenhum veículo cadastrado',
                  )
                : RefreshIndicator(
                    onRefresh: _loadVehicles,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(TqTokens.space8),
                      itemCount: _vehicles.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: TqTokens.space4),
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
    final customerName = v['customerName'] as String? ?? '';
    final label = '$brand $model — $plate';

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: TqTokens.warning.withAlpha(25),
          child: const Icon(Icons.directions_car, color: TqTokens.warning),
        ),
        title: Text(
          label,
          style: const TextStyle(fontWeight: TqTokens.fontWeightSemibold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (customerName.isNotEmpty)
              Row(
                children: [
                  const Icon(
                    Icons.person_outline,
                    size: 14,
                    color: TqTokens.neutral500,
                  ),
                  const SizedBox(width: TqTokens.space2),
                  Expanded(
                    child: Text(
                      customerName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: TqTokens.fontSizeXs,
                        color: TqTokens.neutral600,
                      ),
                    ),
                  ),
                ],
              ),
            Text(
              [
                if (year != null) 'Ano: $year',
                if (color.isNotEmpty) color,
                if (mileage > 0) '${mileage}km',
              ].join(' • '),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: TqTokens.fontSizeXs,
                color: TqTokens.neutral600,
              ),
            ),
          ],
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
              child: Text('Excluir', style: TextStyle(color: TqTokens.danger)),
            ),
          ],
        ),
        onTap: () => _openForm(vehicle: v),
      ),
    );
  }
}
