/// Customer management screen — CRUD operations for workshop customers.
///
/// Lists customers filtered by workshop, with delete confirmation and
/// navigation to [CustomerFormScreen] for create/edit.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/widgets.dart';
import 'customer_form_screen.dart';

/// Lista de clientes da oficina com CRUD.
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
      final data = await ApiService.getCustomersByWorkshop(
        _selectedWorkshopId!,
      );
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
    final confirmed = await showConfirmDialog(
      context,
      title: 'Excluir Cliente',
      content: 'Excluir "$name"? Isso pode falhar se houver ordens vinculadas.',
    );
    if (!confirmed) return;

    try {
      await ApiService.deleteCustomer(id);
      if (!mounted) return;
      showSuccessSnack(context, 'Cliente excluído');
      _loadCustomers();
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
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
              heroTag: 'fab_customers',
              onPressed: () => _openForm(),
              child: const Icon(Icons.person_add),
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
              child: TqDropdown<String>(
                value: _selectedWorkshopId,
                hint: 'Selecione a oficina',
                label: 'Oficina',
                items: _workshops
                    .map(
                      (workshop) => DropdownMenuItem(
                        value: workshop['id'] as String,
                        child: Text(workshop['name'] as String),
                      ),
                    )
                    .toList(),
                onChanged: (val) {
                  setState(() => _selectedWorkshopId = val);
                  _loadCustomers();
                },
              ),
            ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                ? TqErrorState(message: _error!, onRetry: _loadCustomers)
                : _customers.isEmpty
                ? const TqEmptyState(
                    icon: Icons.people_outline,
                    title: 'Nenhum cliente cadastrado',
                  )
                : RefreshIndicator(
                    onRefresh: _loadCustomers,
                    child: ListView(
                      padding: const EdgeInsets.symmetric(
                        horizontal: TqTokens.space8,
                        vertical: TqTokens.space6,
                      ),
                      children: [
                        // — Header com contagem —
                        Padding(
                          padding: const EdgeInsets.only(
                            bottom: TqTokens.space6,
                          ),
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
                                      '${_customers.length}',
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
                        ..._customers.map(
                          (customer) => _buildCard(customer),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> customer) {
    final name = customer['name'] as String;
    final doc = customer['document'] as String? ?? '';
    final phone = customer['phone'] as String? ?? '';
    final email = customer['email'] as String? ?? '';

    return Padding(
      padding: const EdgeInsets.only(bottom: TqTokens.space5),
      child: TqCardShell(
        accentColor: TqTokens.neutral400,
        onTap: () => _openForm(customer: customer),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // — Row 1: Badge pill + ações —
            Row(
              children: [
                TqBadgePill(
                  label: 'Cliente',
                  color: TqTokens.neutral400,
                  icon: Icons.person,
                ),
                const Spacer(),
                TqPopupActions(
                  onEdit: () => _openForm(customer: customer),
                  onDelete: () =>
                      _deleteCustomer(customer['id'] as String, name),
                ),
              ],
            ),
            const SizedBox(height: TqTokens.space5),
            // — Row 2: Nome —
            Text(
              name,
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
            if (doc.isNotEmpty) ...[
              TqInfoRow(
                icon: Icons.badge_outlined,
                text: doc,
                fontWeight: TqTokens.fontWeightMedium,
              ),
              const SizedBox(height: TqTokens.space2),
            ],
            if (phone.isNotEmpty) ...[
              TqInfoRow(icon: Icons.phone_outlined, text: phone),
              const SizedBox(height: TqTokens.space2),
            ],
            if (email.isNotEmpty)
              TqInfoRow(icon: Icons.email_outlined, text: email),
          ],
        ),
      ),
    );
  }
}
