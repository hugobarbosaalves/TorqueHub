/// Customer form screen — create or edit a customer record.
///
/// Receives optional `workshopId` and `customer` map for editing.
/// On submit, calls the appropriate API method (create or update).
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/cpf_cnpj_mask_formatter.dart';
import '../widgets/phone_mask_formatter.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_text_field.dart';
import '../widgets/tq_snackbar.dart';

/// Formulário para criar ou editar um cliente.
class CustomerFormScreen extends StatefulWidget {
  /// ID da oficina à qual o cliente será vinculado.
  final String workshopId;

  /// Dados do cliente para edição (null = criar novo).
  final Map<String, dynamic>? customer;

  const CustomerFormScreen({
    super.key,
    required this.workshopId,
    this.customer,
  });

  @override
  State<CustomerFormScreen> createState() => _CustomerFormScreenState();
}

class _CustomerFormScreenState extends State<CustomerFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _docCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _emailCtrl;
  bool _loading = false;

  bool get _isEditing => widget.customer != null;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(
      text: widget.customer?['name'] as String? ?? '',
    );
    _docCtrl = TextEditingController(
      text: formatCpfCnpjRaw(widget.customer?['document'] as String?),
    );
    _phoneCtrl = TextEditingController(
      text: formatPhoneRaw(widget.customer?['phone'] as String?),
    );
    _emailCtrl = TextEditingController(
      text: widget.customer?['email'] as String? ?? '',
    );
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _docCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      if (_isEditing) {
        await ApiService.updateCustomer(widget.customer!['id'] as String, {
          'name': _nameCtrl.text.trim(),
          'document': _docCtrl.text.trim(),
          'phone': _phoneCtrl.text.trim(),
          'email': _emailCtrl.text.trim(),
        });
      } else {
        await ApiService.createCustomer(
          workshopId: widget.workshopId,
          name: _nameCtrl.text.trim(),
          document: _docCtrl.text.trim(),
          phone: _phoneCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
        );
      }

      if (!mounted) return;
      showSuccessSnack(
        context,
        _isEditing ? 'Cliente atualizado!' : 'Cliente criado!',
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
        title: Text(_isEditing ? 'Editar Cliente' : 'Novo Cliente'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(TqTokens.space10),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TqTextField(
                controller: _nameCtrl,
                label: 'Nome *',
                prefixIcon: Icons.person,
                textCapitalization: TextCapitalization.words,
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Nome obrigatório'
                    : null,
              ),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _docCtrl,
                label: 'CPF / CNPJ',
                hint: '000.000.000-00',
                prefixIcon: Icons.badge,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  CpfCnpjMaskFormatter(),
                ],
                maxLength: 18,
                validator: validateCpfCnpj,
              ),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _phoneCtrl,
                label: 'Telefone',
                hint: '(11) 99999-9999',
                prefixIcon: Icons.phone,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  PhoneMaskFormatter(),
                ],
                maxLength: 15,
                validator: validatePhone,
              ),
              const SizedBox(height: TqTokens.space8),
              TqTextField(
                controller: _emailCtrl,
                label: 'E-mail',
                prefixIcon: Icons.email,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: TqTokens.space14),
              TqButton.ghost(
                label: _isEditing ? 'Salvar' : 'Cadastrar',
                icon: _isEditing ? Icons.save : Icons.person_add,
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
