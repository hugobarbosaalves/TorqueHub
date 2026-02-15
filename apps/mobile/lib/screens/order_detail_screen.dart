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
import 'media_section_widget.dart';

const _statusFlow = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
];

/// Tela de detalhe de uma ordem de serviço.
/// O mecânico pode ver os itens, avançar status, cancelar ou excluir.
class OrderDetailScreen extends StatefulWidget {
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

  String _formatCurrency(dynamic cents) {
    final value =
        (cents is int ? cents : int.tryParse(cents.toString()) ?? 0) / 100;
    return 'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    final local = dt.toLocal();
    return '${local.day.toString().padLeft(2, '0')}/${local.month.toString().padLeft(2, '0')}/${local.year} ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Status atualizado para: ${getStatusInfo(next).label}',
          ),
          backgroundColor: Colors.green,
        ),
      );
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _cancelOrder() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancelar Ordem'),
        content: const Text(
          'Tem certeza que deseja cancelar esta ordem de serviço?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Não'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Sim, cancelar',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.updateOrderStatus(widget.orderId, 'CANCELLED');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ordem cancelada'),
          backgroundColor: Colors.orange,
        ),
      );
      _loadOrder();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _deleteOrder() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Ordem'),
        content: const Text(
          'Tem certeza que deseja EXCLUIR esta ordem?\nEsta ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Não'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Sim, excluir',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteServiceOrder(widget.orderId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ordem excluída'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context); // volta pra lista
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
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
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Link copiado!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes da Ordem'), centerTitle: true),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? _buildError()
          : _order == null
          ? const Center(child: Text('Ordem não encontrada'))
          : _buildContent(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              _error!,
              style: const TextStyle(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _loadOrder,
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
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
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withAlpha(60)),
            ),
            child: Column(
              children: [
                Icon(info.icon, color: color, size: 36),
                const SizedBox(height: 6),
                Text(
                  info.label,
                  style: TextStyle(
                    color: color,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Text(
            order['description'] as String? ?? 'Sem descrição',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          if (order['observations'] != null &&
              (order['observations'] as String).isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              order['observations'] as String,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Text(
            'Criada em: ${_formatDate(order['createdAt'] as String?)}',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
          ),

          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: _shareOrderLink,
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('Enviar ao cliente'),
                  style: FilledButton.styleFrom(
                    backgroundColor: TqTokens.whatsapp,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              IconButton.outlined(
                onPressed: _copyOrderLink,
                icon: const Icon(Icons.copy, size: 18),
                tooltip: 'Copiar link',
              ),
            ],
          ),

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),

          MediaSectionWidget(
            serviceOrderId: widget.orderId,
            initialMedia: _media,
          ),

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),

          const Text(
            'Itens / Serviços',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ...items.map((item) => _buildItemRow(item)),

          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: TqTokens.primary.withAlpha(8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                Text(
                  _formatCurrency(order['totalAmount']),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: TqTokens.primary,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

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
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          if (canAdvance) const SizedBox(height: 10),

          if (canCancel)
            OutlinedButton.icon(
              onPressed: _cancelOrder,
              icon: const Icon(Icons.cancel_outlined, color: Colors.orange),
              label: const Text(
                'Cancelar Ordem',
                style: TextStyle(color: Colors.orange),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.orange),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          if (canCancel) const SizedBox(height: 10),

          TextButton.icon(
            onPressed: _deleteOrder,
            icon: Icon(Icons.delete_outline, color: Colors.red.shade300),
            label: Text(
              'Excluir Ordem',
              style: TextStyle(color: Colors.red.shade300),
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildItemRow(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
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
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${item['quantity']}x  ${_formatCurrency(item['unitPrice'])}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          Text(
            _formatCurrency(item['totalPrice']),
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
