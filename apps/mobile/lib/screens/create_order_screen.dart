/// New/edit service order screen — cascading form for creating or editing orders.
///
/// Flow: select Workshop → Customer → Vehicle, then add line items
/// with description, quantity, and unit price.
/// When [existingOrder] is provided, operates in edit mode (only DRAFT).
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/currency_mask_formatter.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_dropdown.dart';
import '../widgets/tq_text_field.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_section_title.dart';

/// Tela para criar ou editar uma ordem de serviço.
class CreateOrderScreen extends StatefulWidget {
  /// Callback opcional chamado quando a ordem é criada/atualizada.
  final VoidCallback? onOrderCreated;

  /// Dados da ordem existente para modo edição (null = criação).
  final Map<String, dynamic>? existingOrder;

  const CreateOrderScreen({super.key, this.onOrderCreated, this.existingOrder});

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

  /// Indica se estamos em modo edição.
  bool get _isEditing => widget.existingOrder != null;

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

  /// Pré-popula campos a partir da ordem existente (modo edição).
  void _prefillFromOrder() {
    final order = widget.existingOrder;
    if (order == null) return;

    _descriptionCtrl.text = order['description'] as String? ?? '';

    _selectedWorkshopId = order['workshopId'] as String?;
    _selectedCustomerId = order['customerId'] as String?;
    _selectedVehicleId = order['vehicleId'] as String?;

    final existingItems = List<Map<String, dynamic>>.from(order['items'] ?? []);
    _items.clear();
    for (final item in existingItems) {
      final entry = _ItemEntry();
      entry.descCtrl.text = item['description'] as String? ?? '';
      entry.qtyCtrl.text = '${item['quantity'] ?? 1}';
      final unitPrice = item['unitPrice'] as int? ?? 0;
      entry.priceCtrl.text = formatCentsToInput(unitPrice);
      _items.add(entry);
    }
    if (_items.isEmpty) _items.add(_ItemEntry());
  }

  Future<void> _loadWorkshops() async {
    try {
      final data = await ApiService.getWorkshops();
      if (!mounted) return;

      if (_isEditing) {
        _prefillFromOrder();
        // Carregar clientes e veículos da ordem existente.
        if (_selectedWorkshopId != null) {
          final customers = await ApiService.getCustomers(_selectedWorkshopId!);
          if (!mounted) return;
          _customers = customers;

          if (_selectedCustomerId != null) {
            final vehicles = await ApiService.getVehicles(
              _selectedWorkshopId!,
              customerId: _selectedCustomerId,
            );
            if (!mounted) return;
            _vehicles = vehicles;
          }
        }
      }

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
        .where((item) => item.descCtrl.text.trim().isNotEmpty)
        .map((item) {
          final cents = parseCurrencyToCents(item.priceCtrl.text);
          return {
            'description': item.descCtrl.text.trim(),
            'quantity': int.tryParse(item.qtyCtrl.text) ?? 1,
            'unitPrice': cents,
          };
        })
        .toList();

    if (validItems.isEmpty) {
      showErrorSnack(context, 'Adicione pelo menos 1 item/serviço');
      return;
    }

    setState(() => _loading = true);
    try {
      if (_isEditing) {
        final orderId = widget.existingOrder!['id'] as String;
        await ApiService.updateServiceOrder(orderId, {
          'description': _descriptionCtrl.text.trim(),
          'items': validItems,
        });
        if (!mounted) return;
        showSuccessSnack(context, 'Ordem atualizada com sucesso!');
      } else {
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
      }
      widget.onOrderCreated?.call();
      if (_isEditing && mounted) Navigator.pop(context);
    } catch (e) {
      showErrorSnack(
        context,
        _isEditing ? 'Erro ao atualizar ordem: $e' : 'Erro ao criar ordem: $e',
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar Ordem' : 'Nova Ordem de Serviço'),
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
                          (workshop) => DropdownMenuItem(
                            value: workshop['id'] as String,
                            child: Text(workshop['name'] as String),
                          ),
                        )
                        .toList(),
                    onChanged: _isEditing ? null : _onWorkshopChanged,
                  ),
                  const SizedBox(height: TqTokens.space8),
                  const TqSectionTitle('Cliente'),
                  _buildDropdown(
                    currentValue: _selectedCustomerId,
                    hint: _selectedWorkshopId == null
                        ? 'Selecione uma oficina primeiro'
                        : 'Selecione o cliente',
                    items: _customers.map((customer) {
                      final doc = customer['document'] as String?;
                      final label = doc != null && doc.isNotEmpty
                          ? '${customer['name']} ($doc)'
                          : customer['name'] as String;
                      return DropdownMenuItem(
                        value: customer['id'] as String,
                        child: Text(label),
                      );
                    }).toList(),
                    onChanged: _isEditing
                        ? null
                        : (_selectedWorkshopId == null
                              ? null
                              : _onCustomerChanged),
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
                          (vehicle) => DropdownMenuItem(
                            value: vehicle['id'] as String,
                            child: Text(
                              '${vehicle['brand']} ${vehicle['model']} — ${vehicle['plate']}',
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: _isEditing
                        ? null
                        : (_selectedCustomerId == null
                              ? null
                              : (val) =>
                                    setState(() => _selectedVehicleId = val)),
                  ),
                  const SizedBox(height: TqTokens.space12),
                  const Divider(),
                  const SizedBox(height: TqTokens.space8),
                  const TqSectionTitle('Descrição do Serviço'),
                  TqTextField(
                    controller: _descriptionCtrl,
                    hint: 'Ex: Troca de óleo e filtros',
                    maxLines: 2,
                    validator: (value) => value == null || value.trim().isEmpty
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
                    final index = entry.key;
                    final item = entry.value;
                    return _buildItemCard(item, index);
                  }),
                  const SizedBox(height: TqTokens.space16),
                  TqButton.ghost(
                    label: _loading
                        ? (_isEditing ? 'Salvando...' : 'Criando...')
                        : (_isEditing
                              ? 'Salvar Alterações'
                              : 'Criar Ordem de Serviço'),
                    icon: _loading ? null : Icons.check,
                    loading: _loading,
                    onPressed: _loading ? null : _submit,
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
    return TqDropdown<String>(
      value: currentValue,
      hint: hint,
      items: items,
      onChanged: onChanged,
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
            TqTextField(
              controller: item.descCtrl,
              hint: 'Descrição do item',
              dense: true,
            ),
            const SizedBox(height: TqTokens.space4),
            Row(
              children: [
                Expanded(
                  child: TqTextField(
                    controller: item.qtyCtrl,
                    label: 'Qtd',
                    dense: true,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                ),
                const SizedBox(width: TqTokens.space4),
                Expanded(
                  child: TqTextField(
                    controller: item.priceCtrl,
                    label: 'Valor (R\$)',
                    hint: 'R\$ 0,00',
                    dense: true,
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      CurrencyMaskFormatter(),
                    ],
                    validator: (value) => validateCurrency(value),
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
