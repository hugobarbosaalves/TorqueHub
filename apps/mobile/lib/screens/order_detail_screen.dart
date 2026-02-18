/// Order detail screen — shows full info for a single service order.
///
/// Displays status, description, line items table, total amount,
/// media gallery, and allows status transitions.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../services/api_service.dart';
import '../services/app_config.dart';
import '../theme/status_config.dart';
import '../theme/app_tokens.dart';
import '../utils/formatters.dart';
import '../widgets/tq_button.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_confirm_dialog.dart';
import '../widgets/tq_state_views.dart';
import '../utils/constants.dart';
import 'media_section_widget.dart';
import 'create_order_screen.dart';

const _statusFlow = OrderStatus.flow;

/// Tela de detalhe de ordem — itens, status, ações, mídia.
class OrderDetailScreen extends StatefulWidget {
  /// ID da ordem de serviço a exibir.
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Map<String, dynamic>? _order;
  List<Map<String, dynamic>> _media = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrder();
  }

  Future<void> _loadOrder() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.getServiceOrder(widget.orderId);
      final media = await ApiService.getMedia(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = data;
        _media = media;
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

  /// Avança o status da ordem para o próximo passo do fluxo.
  Future<void> _advanceStatus() async {
    final status = _order?['status'] as String?;
    if (status == null) return;
    final idx = _statusFlow.indexOf(status);
    if (idx < 0 || idx >= _statusFlow.length - 1) return;
    final next = _statusFlow[idx + 1];

    try {
      await ApiService.updateOrderStatus(widget.orderId, next);
      if (!mounted) return;
      showSuccessSnack(
        context,
        'Status atualizado para: ${getStatusInfo(next).label}',
      );
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    }
  }

  Future<void> _cancelOrder() async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'Cancelar Ordem',
      content: 'Tem certeza que deseja cancelar esta ordem de serviço?',
      confirmText: 'Sim, cancelar',
    );
    if (!confirmed) return;

    try {
      await ApiService.updateOrderStatus(widget.orderId, OrderStatus.cancelled);
      if (!mounted) return;
      showWarningSnack(context, 'Ordem cancelada');
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    }
  }

  Future<void> _deleteOrder() async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'Excluir Ordem',
      content:
          'Tem certeza que deseja EXCLUIR esta ordem?\nEsta ação não pode ser desfeita.',
      confirmText: 'Sim, excluir',
    );
    if (!confirmed) return;

    try {
      await ApiService.deleteServiceOrder(widget.orderId);
      if (!mounted) return;
      showSuccessSnack(context, 'Ordem excluída');
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    }
  }

  /// Compartilha o link da ordem via share nativo (WhatsApp, etc).
  void _shareOrderLink() {
    final token = _order?['publicToken'] as String?;
    if (token == null) return;
    final link = AppConfig.orderLink(token);
    final description = _order?['description'] as String? ?? 'Serviço';
    final message =
        '🔧 *TorqueHub* — Acompanhe seu serviço\n\n'
        '📋 $description\n\n'
        '🔗 Acesse: $link';
    SharePlus.instance.share(ShareParams(text: message));
  }

  /// Copia o link público da ordem para a área de transferência.
  void _copyOrderLink() {
    final token = _order?['publicToken'] as String?;
    if (token == null) return;
    final link = AppConfig.orderLink(token);
    Clipboard.setData(ClipboardData(text: link));
    showInfoSnack(context, 'Link copiado!');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes da Ordem'), centerTitle: true),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? TqErrorState(detail: _error, onRetry: _loadOrder)
          : _order == null
          ? const TqEmptyState(title: 'Ordem não encontrada')
          : _buildContent(),
    );
  }

  Widget _buildContent() {
    final order = _order!;
    final status = order['status'] as String? ?? OrderStatus.draft;
    final info = getStatusInfo(status);
    final color = info.color;
    final items = List<Map<String, dynamic>>.from(order['items'] ?? []);
    final canAdvance =
        _statusFlow.contains(status) &&
        _statusFlow.indexOf(status) < _statusFlow.length - 1;
    final canCancel =
        status != OrderStatus.cancelled && status != OrderStatus.completed;
    final canEdit = status == OrderStatus.draft;

    return RefreshIndicator(
      onRefresh: _loadOrder,
      child: ListView(
        padding: const EdgeInsets.all(TqTokens.space8),
        children: [
          _buildStatusBanner(info, color),
          const SizedBox(height: TqTokens.space10),
          _buildCustomerVehicleInfo(order),
          const SizedBox(height: TqTokens.space6),
          _buildDescription(order),
          const SizedBox(height: TqTokens.space6),
          _buildShareRow(),
          const SizedBox(height: TqTokens.space12),
          const Divider(),
          const SizedBox(height: TqTokens.space8),
          MediaSectionWidget(
            serviceOrderId: widget.orderId,
            initialMedia: _media,
            orderStatus: status,
          ),
          const SizedBox(height: TqTokens.space12),
          const Divider(),
          const SizedBox(height: TqTokens.space8),
          _buildItemsSection(items),
          const SizedBox(height: TqTokens.space6),
          _buildTotalRow(order),
          const SizedBox(height: TqTokens.space14),
          _buildActionButtons(status, canAdvance, canCancel, canEdit),
          const SizedBox(height: TqTokens.space12),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(StatusInfo info, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: TqTokens.space8),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(TqTokens.radiusXl),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Column(
        children: [
          Icon(info.icon, color: color, size: 36),
          const SizedBox(height: TqTokens.space3),
          Text(
            info.label,
            style: TextStyle(
              color: color,
              fontSize: TqTokens.fontSizeXl,
              fontWeight: TqTokens.fontWeightBold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerVehicleInfo(Map<String, dynamic> order) {
    final customer = order['customerName'] as String?;
    final plate = order['vehiclePlate'] as String?;
    final vehicle = order['vehicleSummary'] as String?;
    if (customer == null && vehicle == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(TqTokens.space6),
      decoration: BoxDecoration(
        color: TqTokens.neutral50,
        borderRadius: BorderRadius.circular(TqTokens.radiusMd),
        border: Border.all(color: TqTokens.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (customer != null && customer.isNotEmpty)
            Row(
              children: [
                const Icon(
                  Icons.person_outline,
                  size: 16,
                  color: TqTokens.neutral600,
                ),
                const SizedBox(width: TqTokens.space3),
                Text(
                  customer,
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeBase,
                    fontWeight: TqTokens.fontWeightSemibold,
                  ),
                ),
              ],
            ),
          if (vehicle != null || plate != null) ...[
            if (customer != null) const SizedBox(height: TqTokens.space3),
            Row(
              children: [
                const Icon(
                  Icons.directions_car_outlined,
                  size: 16,
                  color: TqTokens.neutral600,
                ),
                const SizedBox(width: TqTokens.space3),
                Expanded(
                  child: Text(
                    [vehicle, plate]
                        .where(
                          (segment) => segment != null && segment.isNotEmpty,
                        )
                        .join(' — '),
                    style: const TextStyle(
                      fontSize: TqTokens.fontSizeSm,
                      color: TqTokens.neutral700,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDescription(Map<String, dynamic> order) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          order['description'] as String? ?? 'Sem descrição',
          style: const TextStyle(
            fontSize: TqTokens.fontSize2xl,
            fontWeight: TqTokens.fontWeightBold,
          ),
        ),
        if (order['observations'] != null &&
            (order['observations'] as String).isNotEmpty) ...[
          const SizedBox(height: TqTokens.space4),
          Text(
            order['observations'] as String,
            style: const TextStyle(
              fontSize: TqTokens.fontSizeBase,
              color: TqTokens.neutral600,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
        const SizedBox(height: TqTokens.space4),
        Text(
          'Criada em: ${formatDate(order['createdAt'] as String?)}',
          style: const TextStyle(
            fontSize: TqTokens.fontSizeXs,
            color: TqTokens.neutral500,
          ),
        ),
      ],
    );
  }

  Widget _buildShareRow() {
    return Row(
      children: [
        Expanded(
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: _shareOrderLink,
              borderRadius: BorderRadius.circular(TqTokens.radiusXl),
              child: Ink(
                decoration: BoxDecoration(
                  color: TqTokens.whatsapp,
                  borderRadius: BorderRadius.circular(TqTokens.radiusXl),
                ),
                padding: const EdgeInsets.symmetric(
                  vertical: TqTokens.space6,
                  horizontal: TqTokens.space10,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.share, size: 18, color: Colors.white),
                    const SizedBox(width: TqTokens.space4),
                    const Text(
                      'Enviar ao cliente',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: TqTokens.fontSizeMd,
                        fontWeight: TqTokens.fontWeightSemibold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: TqTokens.space4),
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _copyOrderLink,
            borderRadius: BorderRadius.circular(TqTokens.radiusXl),
            child: Ink(
              decoration: BoxDecoration(
                color: TqTokens.neutral100,
                borderRadius: BorderRadius.circular(TqTokens.radiusXl),
              ),
              padding: const EdgeInsets.all(TqTokens.space6),
              child: const Icon(
                Icons.copy,
                size: 18,
                color: TqTokens.neutral600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildItemsSection(List<Map<String, dynamic>> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Itens / Serviços',
          style: TextStyle(
            fontSize: TqTokens.fontSizeLg,
            fontWeight: TqTokens.fontWeightSemibold,
          ),
        ),
        const SizedBox(height: TqTokens.space6),
        ...items.map((item) => _buildItemRow(item)),
      ],
    );
  }

  Widget _buildItemRow(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: TqTokens.space4),
      padding: const EdgeInsets.all(TqTokens.space6),
      decoration: BoxDecoration(
        color: TqTokens.neutral50,
        borderRadius: BorderRadius.circular(TqTokens.radiusMd),
        border: Border.all(color: TqTokens.neutral200),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['description'] as String? ?? '',
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeBase,
                    fontWeight: TqTokens.fontWeightMedium,
                  ),
                ),
                const SizedBox(height: TqTokens.space1),
                Text(
                  '${item['quantity']}x  ${formatCurrency(item['unitPrice'])}',
                  style: const TextStyle(
                    fontSize: TqTokens.fontSizeXs,
                    color: TqTokens.neutral600,
                  ),
                ),
              ],
            ),
          ),
          Text(
            formatCurrency(item['totalPrice']),
            style: const TextStyle(
              fontSize: TqTokens.fontSizeMd,
              fontWeight: TqTokens.fontWeightBold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(Map<String, dynamic> order) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: TqTokens.space8,
        vertical: 14,
      ),
      decoration: BoxDecoration(
        color: TqTokens.primary.withAlpha(8),
        borderRadius: BorderRadius.circular(TqTokens.radiusLg),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Total',
            style: TextStyle(
              fontSize: TqTokens.fontSizeLg,
              fontWeight: TqTokens.fontWeightSemibold,
            ),
          ),
          Text(
            formatCurrency(order['totalAmount']),
            style: const TextStyle(
              fontSize: TqTokens.fontSize3xl,
              fontWeight: TqTokens.fontWeightExtrabold,
              color: TqTokens.primary,
            ),
          ),
        ],
      ),
    );
  }

  /// Navega para a tela de edição com os dados da ordem atual.
  void _navigateToEdit() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreateOrderScreen(
          existingOrder: _order,
          onOrderCreated: _loadOrder,
        ),
      ),
    );
  }

  Widget _buildActionButtons(
    String status,
    bool canAdvance,
    bool canCancel,
    bool canEdit,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (canEdit)
          TqButton.ghost(
            label: 'Editar Ordem',
            icon: Icons.edit_outlined,
            onPressed: _navigateToEdit,
          ),
        if (canEdit && canAdvance) const SizedBox(height: TqTokens.space3),
        if (canAdvance)
          TqButton.ghost(
            label:
                'Avançar para: ${getStatusInfo(_statusFlow[_statusFlow.indexOf(status) + 1]).label}',
            icon: Icons.arrow_forward_rounded,
            onPressed: _advanceStatus,
          ),
        if (canAdvance || canEdit) const SizedBox(height: TqTokens.space3),
        if (canCancel)
          TqButton.ghost(
            label: 'Cancelar Ordem',
            icon: Icons.cancel_outlined,
            onPressed: _cancelOrder,
          ),
        if (canCancel) const SizedBox(height: TqTokens.space3),
        TqButton.danger(
          label: 'Excluir Ordem',
          icon: Icons.delete_outline_rounded,
          onPressed: _deleteOrder,
        ),
      ],
    );
  }
}
