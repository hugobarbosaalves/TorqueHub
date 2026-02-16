/// New service order screen — cascading form for creating orders.
///
/// Flow: select Workshop → Customer → Vehicle, then add line items
/// with description, quantity, and unit price.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_section_title.dart';

/// Tela para o mecânico criar uma nova ordem de serviço.
class CreateOrderScreen extends StatefulWidget {
  /// Callback opcional chamado quando a ordem é criada com sucesso.
  final VoidCallback? onOrderCreated;

  const CreateOrderScreen({super.key, this.onOrderCreated});

  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  List<Map<String, dynamic>> _workshops = [];
  List<Map<String, dynamic>> _customers = [];
  List<Map<String, dynamic>> _vehicles = [];

  String? _selectedWorkshopId;
  String? _selectedCustomerId;
  String? _selectedVehicleId;

  final _descriptionCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final List<_ItemEntry> _items = [_ItemEntry()];

  bool _loading = false;
  bool _loadingData = true;

  @override
  void initState() {
    super.initState();
    _loadWorkshops();
  }

  @override
  void dispose() {
    _descriptionCtrl.dispose();
    for (final item in _items) {
      item.dispose();
    }
    super.dispose();
  }

  Future<void> _loadWorkshops() async {
    try {
      final data = await ApiService.getWorkshops();
      if (!mounted) return;
      setState(() {
        _workshops = data;
        _loadingData = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingData = false);
      showErrorSnack(context, 'Erro ao carregar oficinas: $e');
    }
  }

  Future<void> _onWorkshopChanged(String? id) async {
    setState(() {
      _selectedWorkshopId = id;
      _selectedCustomerId = null;
      _selectedVehicleId = null;
      _customers = [];
      _vehicles = [];
    });
    if (id == null) return;
    try {
      final data = await ApiService.getCustomers(id);
      if (!mounted) return;
      setState(() => _customers = data);
    } catch (e) {
      showErrorSnack(context, 'Erro ao carregar clientes: $e');
    }
  }

  Future<void> _onCustomerChanged(String? id) async {
    setState(() {
      _selectedCustomerId = id;
      _selectedVehicleId = null;
      _vehicles = [];
    });
    if (id == null || _selectedWorkshopId == null) return;
    try {
      final data = await ApiService.getVehicles(
        _selectedWorkshopId!,
        customerId: id,
      );
      if (!mounted) return;
      setState(() => _vehicles = data);
    } catch (e) {
      showErrorSnack(context, 'Erro ao carregar veículos: $e');
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedWorkshopId == null ||
        _selectedCustomerId == null ||
        _selectedVehicleId == null) {
      showErrorSnack(context, 'Selecione oficina, cliente e veículo');
      return;
    }

    final validItems = _items
        .where((i) => i.descCtrl.text.trim().isNotEmpty)
        .map((i) {
          final price =
              double.tryParse(i.priceCtrl.text.replaceAll(',', '.')) ?? 0;
          return {
            'description': i.descCtrl.text.trim(),
            'quantity': int.tryParse(i.qtyCtrl.text) ?? 1,
            'unitPrice': (price * 100).round(),
          };
        })
        .toList();

    if (validItems.isEmpty) {
      showErrorSnack(context, 'Adicione pelo menos 1 item/serviço');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService.createServiceOrder(
        workshopId: _selectedWorkshopId!,
        customerId: _selectedCustomerId!,
        vehicleId: _selectedVehicleId!,
        description: _descriptionCtrl.text.trim(),
        items: validItems,
      );
      if (!mounted) return;
      showSuccessSnack(context, 'Ordem de serviço criada com sucesso!');
      _descriptionCtrl.clear();
      for (final item in _items) {
        item.dispose();
      }
      setState(() {
        _items.clear();
        _items.add(_ItemEntry());
      });
      widget.onOrderCreated?.call();
    } catch (e) {
      showErrorSnack(context, 'Erro ao criar ordem: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova Ordem de Serviço'),
        centerTitle: true,
      ),
      body: _loadingData
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(TqTokens.space8),
                children: [
                  const TqSectionTitle('Oficina'),
                  _buildDropdown(
                    currentValue: _selectedWorkshopId,
                    hint: 'Selecione a oficina',
                    items: _workshops
                        .map(
                          (w) => DropdownMenuItem(
                            value: w['id'] as String,
                            child: Text(w['name'] as String),
                          ),
                        )
                        .toList(),
                    onChanged: _onWorkshopChanged,
                  ),
                  const SizedBox(height: TqTokens.space8),
                  const TqSectionTitle('Cliente'),
                  _buildDropdown(
                    currentValue: _selectedCustomerId,
                    hint: _selectedWorkshopId == null
                        ? 'Selecione uma oficina primeiro'
                        : 'Selecione o cliente',
                    items: _customers.map((c) {
                      final doc = c['document'] as String?;
                      final label = doc != null && doc.isNotEmpty
                          ? '${c['name']} ($doc)'
                          : c['name'] as String;
                      return DropdownMenuItem(
                        value: c['id'] as String,
                        child: Text(label),
                      );
                    }).toList(),
                    onChanged:
                        _selectedWorkshopId == null ? null : _onCustomerChanged,
                  ),
                  const SizedBox(height: TqTokens.space8),
                  const TqSectionTitle('Veículo'),
                  _buildDropdown(
                    currentValue: _selectedVehicleId,
                    hint: _selectedCustomerId == null
                        ? 'Selecione um cliente primeiro'
                        : 'Selecione o veículo',
                    items: _vehicles
                        .map(
                          (v) => DropdownMenuItem(
                            value: v['id'] as String,
                            child: Text(
                              '${v['brand']} ${v['model']} — ${v['plate']}',
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: _selectedCustomerId == null
                        ? null
                        : (val) => setState(() => _selectedVehicleId = val),
                  ),
                  const SizedBox(height: TqTokens.space12),
                  const Divider(),
                  const SizedBox(height: TqTokens.space8),
                  const TqSectionTitle('Descrição do Serviço'),
                  TextFormField(
                    controller: _descriptionCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Ex: Troca de óleo e filtros',
                    ),
                    maxLines: 2,
                    validator: (v) => v == null || v.trim().isEmpty
                        ? 'Informe a descrição'
                        : null,
                  ),
                  const SizedBox(height: TqTokens.space12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const TqSectionTitle('Itens / Serviços'),
                      TextButton.icon(
                        onPressed: () =>
                            setState(() => _items.add(_ItemEntry())),
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Adicionar'),
                      ),
                    ],
                  ),
                  const SizedBox(height: TqTokens.space4),
                  ..._items.asMap().entries.map((entry) {
                    final i = entry.key;
                    final item = entry.value;
                    return _buildItemCard(item, i);
                  }),
                  const SizedBox(height: TqTokens.space16),
                  FilledButton.icon(
                    onPressed: _loading ? null : _submit,
                    icon: _loading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: TqTokens.card,
                            ),
                          )
                        : const Icon(Icons.check),
                    label: Text(
                      _loading ? 'Criando...' : 'Criar Ordem de Serviço',
                    ),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      textStyle: const TextStyle(
                        fontSize: TqTokens.fontSizeLg,
                        fontWeight: TqTokens.fontWeightSemibold,
                      ),
                    ),
                  ),
                  const SizedBox(height: TqTokens.space12),
                ],
              ),
            ),
    );
  }

  Widget _buildDropdown({
    required String? currentValue,
    required String hint,
    required List<DropdownMenuItem<String>> items,
    required void Function(String?)? onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: currentValue,
      hint: Text(hint),
      items: items,
      onChanged: onChanged,
      decoration: const InputDecoration(
        contentPadding: EdgeInsets.symmetric(
          horizontal: TqTokens.space6,
          vertical: TqTokens.space5,
        ),
      ),
      isExpanded: true,
    );
  }

  Widget _buildItemCard(_ItemEntry item, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: TqTokens.space5),
      child: Padding(
        padding: const EdgeInsets.all(TqTokens.space6),
        child: Column(
          children: [
            Row(
              children: [
                Text(
                  'Item ${index + 1}',
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeXs,
                    color: TqTokens.neutral600,
                  ),
                ),
                const Spacer(),
                if (_items.length > 1)
                  GestureDetector(
                    onTap: () => setState(() {
                      _items[index].dispose();
                      _items.removeAt(index);
                    }),
                    child: const Text(
                      'Remover',
                      style: TextStyle(
                        fontSize: TqTokens.fontSizeXs,
                        color: TqTokens.danger,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: TqTokens.space4),
            TextFormField(
              controller: item.descCtrl,
              decoration: const InputDecoration(
                hintText: 'Descrição do item',
                isDense: true,
              ),
            ),
            const SizedBox(height: TqTokens.space4),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: item.qtyCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Qtd',
                      isDense: true,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: TqTokens.space4),
                Expanded(
                  child: TextFormField(
                    controller: item.priceCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Valor (R\$)',
                      isDense: true,
                    ),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Helper class para manter controllers de cada item.
class _ItemEntry {
  final descCtrl = TextEditingController();
  final qtyCtrl = TextEditingController(text: '1');
  final priceCtrl = TextEditingController();

  void dispose() {
    descCtrl.dispose();
    qtyCtrl.dispose();
    priceCtrl.dispose();
  }
}
