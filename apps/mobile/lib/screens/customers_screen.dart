/// Customer management screen — CRUD operations for workshop customers.
///
/// Lists customers filtered by workshop, with delete confirmation and
/// navigation to [CustomerFormScreen] for create/edit.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_confirm_dialog.dart';
import '../widgets/tq_state_views.dart';
import '../utils/constants.dart';
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
              child: DropdownButtonFormField<String>(
                value: _selectedWorkshopId,
                decoration: const InputDecoration(
                  labelText: 'Oficina',
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: TqTokens.space6,
                    vertical: TqTokens.space5,
                  ),
                ),
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
                    child: ListView.separated(
                      padding: const EdgeInsets.all(TqTokens.space8),
                      itemCount: _customers.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: TqTokens.space4),
                      itemBuilder: (_, index) => _buildCard(_customers[index]),
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

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: TqTokens.accent.withAlpha(25),
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : '?',
            style: const TextStyle(
              color: TqTokens.accent,
              fontWeight: TqTokens.fontWeightBold,
            ),
          ),
        ),
        title: Text(
          name,
          style: const TextStyle(fontWeight: TqTokens.fontWeightSemibold),
        ),
        subtitle: Text(
          [doc, phone, email].where((detail) => detail.isNotEmpty).join(' • '),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: TqTokens.fontSizeXs,
            color: TqTokens.neutral600,
          ),
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (action) {
            if (action == MenuAction.edit) _openForm(customer: customer);
            if (action == MenuAction.delete)
              _deleteCustomer(customer['id'] as String, name);
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: MenuAction.edit, child: Text('Editar')),
            const PopupMenuItem(
              value: MenuAction.delete,
              child: Text('Excluir', style: TextStyle(color: TqTokens.danger)),
            ),
          ],
        ),
        onTap: () => _openForm(customer: customer),
      ),
    );
  }
}
