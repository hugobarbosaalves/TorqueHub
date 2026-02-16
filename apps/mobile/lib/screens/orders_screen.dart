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
import '../widgets/tq_state_views.dart';
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
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    refresh();
  }

  /// Recarrega a lista de ordens.
  Future<void> refresh() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await ApiService.getServiceOrders();
      if (!mounted) return;
      setState(() {
        _orders = orders;
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
        title: const Text('TorqueHub'),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: refresh,
            icon: const Icon(Icons.refresh),
            tooltip: 'Atualizar',
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') _handleLogout();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'logout',
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
      floatingActionButton: FloatingActionButton(
        heroTag: 'fab_orders',
        onPressed: _createOrder,
        child: const Icon(Icons.add),
      ),
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
                  : _buildList(),
    );
  }

  Widget _buildList() {
    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(
          horizontal: TqTokens.space8,
          vertical: TqTokens.space6,
        ),
        itemCount: _orders.length,
        itemBuilder: (context, index) => _buildCard(_orders[index]),
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> order) {
    final status = order['status'] as String? ?? 'DRAFT';
    final info = getStatusInfo(status);
    final color = info.color;

    return Card(
      margin: const EdgeInsets.only(bottom: TqTokens.space6),
      child: InkWell(
        borderRadius: BorderRadius.circular(TqTokens.radiusXl),
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) =>
                  OrderDetailScreen(orderId: order['id'] as String),
            ),
          );
          refresh();
        },
        child: Padding(
          padding: const EdgeInsets.all(TqTokens.space8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(info.icon, color: color, size: 20),
                  const SizedBox(width: TqTokens.space4),
                  Expanded(
                    child: Text(
                      order['description'] as String? ?? 'Sem descrição',
                      style: const TextStyle(
                        fontSize: TqTokens.fontSizeLg,
                        fontWeight: TqTokens.fontWeightSemibold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: TqTokens.space5),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: TqTokens.space5,
                      vertical: TqTokens.space2,
                    ),
                    decoration: BoxDecoration(
                      color: color.withAlpha(25),
                      borderRadius:
                          BorderRadius.circular(TqTokens.radiusPill),
                    ),
                    child: Text(
                      info.label,
                      style: TextStyle(
                        color: color,
                        fontSize: TqTokens.fontSizeXs,
                        fontWeight: TqTokens.fontWeightSemibold,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    formatCurrency(order['totalAmount']),
                    style: const TextStyle(
                      fontSize: TqTokens.fontSizeLg,
                      fontWeight: TqTokens.fontWeightBold,
                      color: TqTokens.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: TqTokens.space4),
              Row(
                children: [
                  const Icon(
                    Icons.receipt_long,
                    size: 14,
                    color: TqTokens.neutral500,
                  ),
                  const SizedBox(width: TqTokens.space2),
                  Text(
                    '${(order['items'] as List?)?.length ?? 0} itens',
                    style: const TextStyle(
                      fontSize: TqTokens.fontSizeXs,
                      color: TqTokens.neutral600,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    formatDate(order['createdAt'] as String?),
                    style: const TextStyle(
                      fontSize: TqTokens.fontSizeXs,
                      color: TqTokens.neutral500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
