/// Vehicle management screen — CRUD operations for workshop vehicles.
///
/// Lists vehicles of the authenticated user's workshop (tenant-scoped via JWT).
/// Provides delete confirmation and navigation to [VehicleFormScreen].
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/widgets.dart';
import 'vehicle_form_screen.dart';

/// Lista de veículos da oficina com CRUD.
class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  List<Map<String, dynamic>> _vehicles = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  /// Carrega veículos da oficina do usuário logado (JWT tenant-scoped).
  Future<void> _loadVehicles() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.listVehicles();
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

  /// Exclui um veículo após confirmação.
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

  /// Abre o formulário para criar ou editar um veículo.
  void _openForm({Map<String, dynamic>? vehicle}) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => VehicleFormScreen(vehicle: vehicle)),
    );
    if (result == true) _loadVehicles();
  }

  @override
  Widget build(BuildContext context) {
    final canEdit = AuthService.isOwnerOrAdmin;

    return Scaffold(
      appBar: AppBar(title: const Text('Veículos'), centerTitle: true),
      floatingActionButton: canEdit
          ? FloatingActionButton(
              heroTag: 'fab_vehicles',
              onPressed: () => _openForm(),
              child: const Icon(Icons.directions_car),
            )
          : null,
      body: _loading
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
              child: ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: TqTokens.space8,
                  vertical: TqTokens.space6,
                ),
                children: [
                  // — Header com contagem —
                  Padding(
                    padding: const EdgeInsets.only(bottom: TqTokens.space6),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: TqTokens.space5,
                            vertical: TqTokens.space2,
                          ),
                          decoration: BoxDecoration(
                            color: TqTokens.neutral400.withAlpha(18),
                            borderRadius: BorderRadius.circular(
                              TqTokens.radiusPill,
                            ),
                            border: Border.all(
                              color: TqTokens.neutral400.withAlpha(50),
                              width: 0.5,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${_vehicles.length}',
                                style: const TextStyle(
                                  color: TqTokens.neutral400,
                                  fontSize: TqTokens.fontSizeSm,
                                  fontWeight: TqTokens.fontWeightBold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text(
                                'cadastrados',
                                style: TextStyle(
                                  color: TqTokens.neutral400,
                                  fontSize: TqTokens.fontSizeXs,
                                  fontWeight: TqTokens.fontWeightMedium,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  ..._vehicles.map((vehicle) => _buildCard(vehicle)),
                ],
              ),
            ),
    );
  }

  Widget _buildCard(Map<String, dynamic> vehicle) {
    final plate = vehicle['plate'] as String;
    final brand = vehicle['brand'] as String;
    final model = vehicle['model'] as String;
    final year = vehicle['year'];
    final color = vehicle['color'] as String? ?? '';
    final mileage = vehicle['mileage'] as int? ?? 0;
    final customerName = vehicle['customerName'] as String? ?? '';
    final label = '$brand $model';

    return Padding(
      padding: const EdgeInsets.only(bottom: TqTokens.space5),
      child: TqCardShell(
        accentColor: TqTokens.neutral400,
        onTap: () => _openForm(vehicle: vehicle),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // — Row 1: Badge pill (placa) + ações —
            Row(
              children: [
                TqBadgePill(
                  label: plate,
                  color: TqTokens.neutral400,
                  icon: Icons.directions_car,
                ),
                const Spacer(),
                TqPopupActions(
                  onEdit: () => _openForm(vehicle: vehicle),
                  onDelete: () => _deleteVehicle(
                    vehicle['id'] as String,
                    '$label — $plate',
                  ),
                ),
              ],
            ),
            const SizedBox(height: TqTokens.space5),
            // — Row 2: Marca/Modelo —
            Text(
              label,
              style: const TextStyle(
                fontSize: TqTokens.fontSizeLg,
                fontWeight: TqTokens.fontWeightSemibold,
                color: TqTokens.neutral800,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: TqTokens.space4),
            const Divider(height: 1, thickness: 0.5),
            const SizedBox(height: TqTokens.space4),
            // — Detalhes —
            if (customerName.isNotEmpty) ...[
              TqInfoRow(
                icon: Icons.person_outline,
                text: customerName,
                fontWeight: TqTokens.fontWeightMedium,
              ),
              const SizedBox(height: TqTokens.space2),
            ],
            // — Ano + cor + km —
            TqInfoRow(
              icon: Icons.calendar_today_outlined,
              text: [
                if (year != null) '$year',
                if (color.isNotEmpty) color,
                if (mileage > 0) '${mileage}km',
              ].join(' · '),
              fontSize: TqTokens.fontSizeXs,
              iconSize: 14,
              textColor: TqTokens.neutral500,
            ),
          ],
        ),
      ),
    );
  }
}
