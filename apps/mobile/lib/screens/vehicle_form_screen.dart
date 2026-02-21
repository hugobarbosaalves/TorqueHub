/// Vehicle form screen — create or edit a vehicle record.
///
/// Receives optional `vehicle` map for editing.
/// On submit, calls the appropriate API method.
/// workshopId is injected by the backend via JWT (multi-tenancy).
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/mileage_mask_formatter.dart';
import '../widgets/tq_plate_field.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_dropdown.dart';
import '../widgets/tq_text_field.dart';
import '../widgets/tq_snackbar.dart';

/// Formulário para criar ou editar um veículo.
class VehicleFormScreen extends StatefulWidget {
  /// Dados do veículo para edição (null = criar novo).
  final Map<String, dynamic>? vehicle;

  const VehicleFormScreen({super.key, this.vehicle});

  @override
  State<VehicleFormScreen> createState() => _VehicleFormScreenState();
}

class _VehicleFormScreenState extends State<VehicleFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _plateCtrl;
  late final TextEditingController _brandCtrl;
  late final TextEditingController _modelCtrl;
  late final TextEditingController _yearCtrl;
  late final TextEditingController _colorCtrl;
  late final TextEditingController _mileageCtrl;

  List<Map<String, dynamic>> _customers = [];
  String? _selectedCustomerId;
  bool _loadingCustomers = true;
  bool _loading = false;

  bool get _isEditing => widget.vehicle != null;

  @override
  void initState() {
    super.initState();
    final v = widget.vehicle;
    _plateCtrl = TextEditingController(text: v?['plate'] as String? ?? '');
    _brandCtrl = TextEditingController(text: v?['brand'] as String? ?? '');
    _modelCtrl = TextEditingController(text: v?['model'] as String? ?? '');
    _yearCtrl = TextEditingController(text: v?['year']?.toString() ?? '');
    _colorCtrl = TextEditingController(text: v?['color'] as String? ?? '');
    _mileageCtrl = TextEditingController(text: v?['mileage']?.toString() ?? '');
    _selectedCustomerId = v?['customerId'] as String?;
    _loadCustomers();
  }

  @override
  void dispose() {
    _plateCtrl.dispose();
    _brandCtrl.dispose();
    _modelCtrl.dispose();
    _yearCtrl.dispose();
    _colorCtrl.dispose();
    _mileageCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCustomers() async {
    try {
      final data = await ApiService.listCustomers();
      if (!mounted) return;
      setState(() {
        _customers = data;
        _loadingCustomers = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingCustomers = false);
      showErrorSnack(context, 'Erro ao carregar clientes: $e');
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCustomerId == null) {
      showWarningSnack(context, 'Selecione um cliente');
      return;
    }

    setState(() => _loading = true);
    try {
      if (_isEditing) {
        final fields = <String, dynamic>{
          'plate': _plateCtrl.text.trim(),
          'brand': _brandCtrl.text.trim(),
          'model': _modelCtrl.text.trim(),
          if (_yearCtrl.text.trim().isNotEmpty)
            'year': int.tryParse(_yearCtrl.text.trim()),
          if (_colorCtrl.text.trim().isNotEmpty)
            'color': _colorCtrl.text.trim(),
          if (_mileageCtrl.text.trim().isNotEmpty)
            'mileage': int.tryParse(
              _mileageCtrl.text.trim().replaceAll('.', ''),
            ),
        };
        // Envia customerId se foi alterado
        if (_selectedCustomerId != null &&
            _selectedCustomerId != widget.vehicle?['customerId']) {
          fields['customerId'] = _selectedCustomerId;
        }
        await ApiService.updateVehicle(widget.vehicle!['id'] as String, fields);
      } else {
        await ApiService.createVehicle(
          customerId: _selectedCustomerId!,
          plate: _plateCtrl.text.trim(),
          brand: _brandCtrl.text.trim(),
          model: _modelCtrl.text.trim(),
          year: int.tryParse(_yearCtrl.text.trim()),
          color: _colorCtrl.text.trim(),
          mileage: int.tryParse(_mileageCtrl.text.trim().replaceAll('.', '')),
        );
      }

      if (!mounted) return;
      showSuccessSnack(
        context,
        _isEditing ? 'Veículo atualizado!' : 'Veículo cadastrado!',
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar Veículo' : 'Novo Veículo'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(TqTokens.space10),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Cliente *',
                style: TextStyle(fontWeight: TqTokens.fontWeightSemibold),
              ),
              const SizedBox(height: TqTokens.space3),
              _loadingCustomers
                  ? const LinearProgressIndicator()
                  : TqDropdown<String>(
                      value: _selectedCustomerId,
                      hint: 'Selecione o cliente',
                      items: _customers.map((customer) {
                        final doc = customer['document'] as String? ?? '';
                        final label = doc.isNotEmpty
                            ? '${customer['name']} ($doc)'
                            : customer['name'] as String;
                        return DropdownMenuItem(
                          value: customer['id'] as String,
                          child: Text(label),
                        );
                      }).toList(),
                      onChanged: (val) =>
                          setState(() => _selectedCustomerId = val),
                      validator: (value) =>
                          value == null ? 'Selecione um cliente' : null,
                    ),
              const SizedBox(height: TqTokens.space10),
              TqPlateField(controller: _plateCtrl),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _brandCtrl,
                label: 'Marca *',
                prefixIcon: Icons.branding_watermark,
                textCapitalization: TextCapitalization.words,
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Marca obrigatória'
                    : null,
              ),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _modelCtrl,
                label: 'Modelo *',
                prefixIcon: Icons.directions_car,
                textCapitalization: TextCapitalization.words,
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Modelo obrigatório'
                    : null,
              ),
              const SizedBox(height: TqTokens.space8),
              Row(
                children: [
                  Expanded(
                    child: TqTextField(
                      controller: _yearCtrl,
                      label: 'Ano',
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(4),
                      ],
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return null;
                        final year = int.tryParse(value.trim());
                        if (year == null || year < 1900 || year > 2030) {
                          return 'Ano inválido';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: TqTokens.space6),
                  Expanded(
                    child: TqTextField(
                      controller: _colorCtrl,
                      label: 'Cor',
                      textCapitalization: TextCapitalization.words,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _mileageCtrl,
                label: 'Quilometragem (km)',
                hint: '150.000',
                prefixIcon: Icons.speed,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  MileageMaskFormatter(),
                ],
              ),
              const SizedBox(height: TqTokens.space14),
              TqButton.ghost(
                label: _isEditing ? 'Salvar' : 'Cadastrar',
                icon: _isEditing ? Icons.save : Icons.directions_car,
                loading: _loading,
                onPressed: _loading ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
