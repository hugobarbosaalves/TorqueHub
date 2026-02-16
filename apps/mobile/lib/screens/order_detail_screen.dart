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
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_confirm_dialog.dart';
import '../widgets/tq_state_views.dart';
import 'media_section_widget.dart';

const _statusFlow = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
];

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
      await ApiService.updateOrderStatus(widget.orderId, 'CANCELLED');
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
    final status = order['status'] as String? ?? 'DRAFT';
    final info = getStatusInfo(status);
    final color = info.color;
    final items = List<Map<String, dynamic>>.from(order['items'] ?? []);
    final canAdvance =
        _statusFlow.contains(status) &&
        _statusFlow.indexOf(status) < _statusFlow.length - 1;
    final canCancel = status != 'CANCELLED' && status != 'COMPLETED';

    return RefreshIndicator(
      onRefresh: _loadOrder,
      child: ListView(
        padding: const EdgeInsets.all(TqTokens.space8),
        children: [
          _buildStatusBanner(info, color),
          const SizedBox(height: TqTokens.space10),
          _buildDescription(order),
          const SizedBox(height: TqTokens.space6),
          _buildShareRow(),
          const SizedBox(height: TqTokens.space12),
          const Divider(),
          const SizedBox(height: TqTokens.space8),
          MediaSectionWidget(
            serviceOrderId: widget.orderId,
            initialMedia: _media,
          ),
          const SizedBox(height: TqTokens.space12),
          const Divider(),
          const SizedBox(height: TqTokens.space8),
          _buildItemsSection(items),
          const SizedBox(height: TqTokens.space6),
          _buildTotalRow(order),
          const SizedBox(height: TqTokens.space14),
          _buildActionButtons(status, canAdvance, canCancel),
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
          child: FilledButton.icon(
            onPressed: _shareOrderLink,
            icon: const Icon(Icons.share, size: 18),
            label: const Text('Enviar ao cliente'),
            style: FilledButton.styleFrom(
              backgroundColor: TqTokens.whatsapp,
              padding: const EdgeInsets.symmetric(vertical: TqTokens.space6),
            ),
          ),
        ),
        const SizedBox(width: TqTokens.space5),
        IconButton.outlined(
          onPressed: _copyOrderLink,
          icon: const Icon(Icons.copy, size: 18),
          tooltip: 'Copiar link',
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

  Widget _buildActionButtons(
    String status,
    bool canAdvance,
    bool canCancel,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (canAdvance)
          FilledButton.icon(
            onPressed: _advanceStatus,
            icon: const Icon(Icons.arrow_forward),
            label: Text(
              'Avançar para: ${getStatusInfo(_statusFlow[_statusFlow.indexOf(status) + 1]).label}',
            ),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              textStyle: const TextStyle(
                fontSize: TqTokens.fontSizeMd,
                fontWeight: TqTokens.fontWeightSemibold,
              ),
            ),
          ),
        if (canAdvance) const SizedBox(height: TqTokens.space5),
        if (canCancel)
          OutlinedButton.icon(
            onPressed: _cancelOrder,
            icon: const Icon(Icons.cancel_outlined, color: TqTokens.warning),
            label: const Text(
              'Cancelar Ordem',
              style: TextStyle(color: TqTokens.warning),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: TqTokens.warning),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        if (canCancel) const SizedBox(height: TqTokens.space5),
        TextButton.icon(
          onPressed: _deleteOrder,
          icon: Icon(Icons.delete_outline, color: TqTokens.danger.withAlpha(180)),
          label: Text(
            'Excluir Ordem',
            style: TextStyle(color: TqTokens.danger.withAlpha(180)),
          ),
        ),
      ],
    );
  }
}
