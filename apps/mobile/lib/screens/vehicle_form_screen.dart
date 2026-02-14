/// Vehicle form screen — create or edit a vehicle record.
///
/// Receives `workshopId`, optional `customerId`, and optional `vehicle`
/// map for editing. On submit, calls the appropriate API method.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Formulário para criar ou editar um veículo.
class VehicleFormScreen extends StatefulWidget {
  final String workshopId;
  final Map<String, dynamic>? vehicle; // null = criar, preenchido = editar

  const VehicleFormScreen({super.key, required this.workshopId, this.vehicle});

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

  // Customer selection
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
      final data = await ApiService.getCustomers(widget.workshopId);
      if (!mounted) return;
      setState(() {
        _customers = data;
        _loadingCustomers = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loadingCustomers = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao carregar clientes: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_isEditing && _selectedCustomerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Selecione um cliente'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      if (_isEditing) {
        await ApiService.updateVehicle(widget.vehicle!['id'] as String, {
          'plate': _plateCtrl.text.trim(),
          'brand': _brandCtrl.text.trim(),
          'model': _modelCtrl.text.trim(),
          if (_yearCtrl.text.trim().isNotEmpty)
            'year': int.tryParse(_yearCtrl.text.trim()),
          if (_colorCtrl.text.trim().isNotEmpty)
            'color': _colorCtrl.text.trim(),
          if (_mileageCtrl.text.trim().isNotEmpty)
            'mileage': int.tryParse(_mileageCtrl.text.trim()),
        });
      } else {
        await ApiService.createVehicle(
          workshopId: widget.workshopId,
          customerId: _selectedCustomerId!,
          plate: _plateCtrl.text.trim(),
          brand: _brandCtrl.text.trim(),
          model: _modelCtrl.text.trim(),
          year: int.tryParse(_yearCtrl.text.trim()),
          color: _colorCtrl.text.trim(),
          mileage: int.tryParse(_mileageCtrl.text.trim()),
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isEditing ? 'Veículo atualizado!' : 'Veículo cadastrado!',
          ),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
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
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Cliente (somente na criação)
              if (!_isEditing) ...[
                const Text(
                  'Cliente *',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                _loadingCustomers
                    ? const LinearProgressIndicator()
                    : DropdownButtonFormField<String>(
                        initialValue: _selectedCustomerId,
                        hint: const Text('Selecione o cliente'),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                        ),
                        items: _customers.map((c) {
                          final doc = c['document'] as String? ?? '';
                          final label = doc.isNotEmpty
                              ? '${c['name']} ($doc)'
                              : c['name'] as String;
                          return DropdownMenuItem(
                            value: c['id'] as String,
                            child: Text(label),
                          );
                        }).toList(),
                        onChanged: (val) =>
                            setState(() => _selectedCustomerId = val),
                        validator: (v) =>
                            v == null ? 'Selecione um cliente' : null,
                        isExpanded: true,
                      ),
                const SizedBox(height: 20),
              ],

              TextFormField(
                controller: _plateCtrl,
                decoration: const InputDecoration(
                  labelText: 'Placa *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.pin),
                ),
                textCapitalization: TextCapitalization.characters,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Placa obrigatória' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _brandCtrl,
                decoration: const InputDecoration(
                  labelText: 'Marca *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.branding_watermark),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Marca obrigatória' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _modelCtrl,
                decoration: const InputDecoration(
                  labelText: 'Modelo *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.directions_car),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Modelo obrigatório' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _yearCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Ano',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _colorCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Cor',
                        border: OutlineInputBorder(),
                      ),
                      textCapitalization: TextCapitalization.words,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _mileageCtrl,
                decoration: const InputDecoration(
                  labelText: 'Quilometragem (km)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.speed),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 28),
              FilledButton.icon(
                onPressed: _loading ? null : _submit,
                icon: _loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Icon(_isEditing ? Icons.save : Icons.directions_car),
                label: Text(_isEditing ? 'Salvar' : 'Cadastrar'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
