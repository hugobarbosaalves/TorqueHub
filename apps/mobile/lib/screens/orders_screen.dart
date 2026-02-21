/// Orders list screen — displays all service orders for the selected workshop.
///
/// Supports pull-to-refresh, status badges, and
/// navigation to [OrderDetailScreen] on tap.
library;

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/status_config.dart';
import '../theme/app_tokens.dart';
import '../utils/formatters.dart';
import '../widgets/widgets.dart';
import '../utils/constants.dart';
import 'create_order_screen.dart';
import 'order_detail_screen.dart';

/// Lista de ordens de serviço com status badges e total.
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => OrdersScreenState();
}

class OrdersScreenState extends State<OrdersScreen> {
  List<Map<String, dynamic>> _orders = [];
  List<Map<String, dynamic>> _filtered = [];
  bool _loading = true;
  String? _error;
  final _searchCtrl = TextEditingController();
  bool _showSearch = false;

  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(_applyFilter);
    refresh();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  /// Filtra ordens por cliente, placa ou descrição.
  void _applyFilter() {
    final q = _searchCtrl.text.trim().toLowerCase();
    if (q.isEmpty) {
      setState(() => _filtered = _orders);
      return;
    }
    setState(() {
      _filtered = _orders.where((order) {
        final desc = (order['description'] as String? ?? '').toLowerCase();
        final customer = (order['customerName'] as String? ?? '').toLowerCase();
        final plate = (order['vehiclePlate'] as String? ?? '').toLowerCase();
        final vehicle = (order['vehicleSummary'] as String? ?? '')
            .toLowerCase();
        return desc.contains(q) ||
            customer.contains(q) ||
            plate.contains(q) ||
            vehicle.contains(q);
      }).toList();
    });
  }

  /// Recarrega a lista de ordens.
  Future<void> refresh() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await ApiService.listServiceOrders();
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _loading = false;
      });
      _applyFilter();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  /// Abre a tela de criação de ordem e recarrega a lista ao voltar.
  Future<void> _createOrder() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            CreateOrderScreen(onOrderCreated: () => Navigator.pop(context)),
      ),
    );
    refresh();
  }

  /// Encerra a sessão e volta para a tela de login.
  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _showSearch
            ? TextField(
                controller: _searchCtrl,
                autofocus: true,
                cursorColor: Colors.white,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: TqTokens.fontSizeLg,
                ),
                decoration: InputDecoration(
                  hintText: 'Buscar cliente, placa...',
                  hintStyle: const TextStyle(color: TqTokens.neutral400),
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: TqTokens.space4,
                    horizontal: TqTokens.space6,
                  ),
                  isDense: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                    borderSide: const BorderSide(
                      color: Colors.white54,
                      width: 0.8,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                    borderSide: const BorderSide(
                      color: Colors.white54,
                      width: 0.8,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                    borderSide: const BorderSide(color: Colors.white, width: 1),
                  ),
                ),
              )
            : const Text('TorqueHub'),
        centerTitle: !_showSearch,
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _showSearch = !_showSearch;
                if (!_showSearch) {
                  _searchCtrl.clear();
                }
              });
            },
            icon: Icon(_showSearch ? Icons.close : Icons.search),
            tooltip: 'Buscar',
          ),
          IconButton(
            onPressed: refresh,
            icon: const Icon(Icons.refresh),
            tooltip: 'Atualizar',
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == MenuAction.logout) _handleLogout();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: MenuAction.logout,
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 20),
                    SizedBox(width: TqTokens.space4),
                    Text('Sair'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: AuthService.isOwnerOrAdmin
          ? FloatingActionButton(
              heroTag: 'fab_orders',
              onPressed: _createOrder,
              child: const Icon(Icons.add),
            )
          : null,
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? TqErrorState(
              message: 'Erro ao carregar ordens',
              detail: _error,
              onRetry: refresh,
            )
          : _orders.isEmpty
          ? const TqEmptyState(
              icon: Icons.inbox_outlined,
              title: 'Nenhuma ordem de serviço',
              subtitle: 'Toque em + para criar a primeira.',
            )
          : _filtered.isEmpty
          ? const TqEmptyState(
              icon: Icons.search_off,
              title: 'Nenhum resultado',
              subtitle: 'Nenhuma ordem corresponde à busca.',
            )
          : _buildList(),
    );
  }

  Widget _buildList() {
    // — Summary header — contagem por status
    final statusCounts = <String, int>{};
    for (final order in _orders) {
      final status = order['status'] as String? ?? OrderStatus.draft;
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }

    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: TqTokens.space8,
          vertical: TqTokens.space6,
        ),
        children: [
          // — Chips de resumo por status —
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: statusCounts.entries.map((entry) {
                final info = getStatusInfo(entry.key);
                return Padding(
                  padding: const EdgeInsets.only(right: TqTokens.space4),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: TqTokens.space5,
                      vertical: TqTokens.space2,
                    ),
                    decoration: BoxDecoration(
                      color: info.color.withAlpha(18),
                      borderRadius: BorderRadius.circular(TqTokens.radiusPill),
                      border: Border.all(
                        color: info.color.withAlpha(50),
                        width: 0.5,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${entry.value}',
                          style: TextStyle(
                            color: info.color,
                            fontSize: TqTokens.fontSizeSm,
                            fontWeight: TqTokens.fontWeightBold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          info.label,
                          style: TextStyle(
                            color: info.color,
                            fontSize: TqTokens.fontSizeXs,
                            fontWeight: TqTokens.fontWeightMedium,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: TqTokens.space6),
          // — Cards list —
          ..._filtered.map((order) => _buildCard(order)),
        ],
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> order) {
    final status = order['status'] as String? ?? OrderStatus.draft;
    final info = getStatusInfo(status);
    final color = info.color;
    final customer = order['customerName'] as String? ?? '';
    final plate = order['vehiclePlate'] as String? ?? '';
    final vehicle = order['vehicleSummary'] as String? ?? '';
    final description = order['description'] as String? ?? 'Sem descrição';
    final itemCount = (order['items'] as List?)?.length ?? 0;

    return Padding(
      padding: const EdgeInsets.only(bottom: TqTokens.space5),
      child: TqCardShell(
        accentColor: color,
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => OrderDetailScreen(orderId: order['id'] as String),
            ),
          );
          refresh();
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // — Row 1: Status badge + valor —
            Row(
              children: [
                TqBadgePill(label: info.label, color: color, icon: info.icon),
                const Spacer(),
                Text(
                  formatCurrency(order['totalAmount']),
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeXl,
                    fontWeight: TqTokens.fontWeightBold,
                    color: TqTokens.neutral800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: TqTokens.space5),
            // — Row 2: Descrição —
            Text(
              description,
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
            // — Row 3: Cliente —
            if (customer.isNotEmpty) ...[
              TqInfoRow(
                icon: Icons.person_outline,
                text: customer,
                fontWeight: TqTokens.fontWeightMedium,
              ),
              const SizedBox(height: TqTokens.space2),
            ],
            // — Row 4: Veículo —
            if (vehicle.isNotEmpty || plate.isNotEmpty) ...[
              TqInfoRow(
                icon: Icons.directions_car_outlined,
                text: [
                  if (vehicle.isNotEmpty) vehicle,
                  if (plate.isNotEmpty) plate,
                ].join(' · '),
              ),
              const SizedBox(height: TqTokens.space2),
            ],
            // — Row 5: Itens + Data —
            TqInfoRow(
              icon: Icons.receipt_outlined,
              text: '$itemCount ${itemCount == 1 ? 'item' : 'itens'}',
              fontSize: TqTokens.fontSizeXs,
              iconSize: 14,
              textColor: TqTokens.neutral500,
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.schedule,
                    size: 13,
                    color: TqTokens.neutral400,
                  ),
                  const SizedBox(width: TqTokens.space1),
                  Text(
                    formatDate(order['createdAt'] as String?),
                    style: const TextStyle(
                      fontSize: TqTokens.fontSizeXs,
                      color: TqTokens.neutral500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
